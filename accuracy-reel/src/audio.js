import { TIMELINE, BEAT } from './timeline.js';
import { rng } from './lib/util.js';

/* Trilha original sintetizada com Web Audio a 100 BPM (Lá menor), no
   mesmo pulso dos cortes. Renderizada uma vez (OfflineAudioContext): o
   mesmo áudio toca no player e vai para o MP4. */

const SR = 48000;
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const T0 = 0.72;                 // primeira batida depois da abertura
const beatAt = n => T0 + n * BEAT;

const CH = {
  Am: { root: 45, pad: [57, 60, 64, 71], arp: [69, 72, 76, 79] },
  F: { root: 41, pad: [53, 57, 60, 64], arp: [65, 69, 72, 76] },
  C: { root: 48, pad: [55, 60, 64, 67], arp: [67, 72, 76, 79] },
  G: { root: 43, pad: [55, 59, 62, 67], arp: [67, 71, 74, 79] },
};
const PROG = ['Am', 'F', 'C', 'G', 'Am', 'F'];
const ARP = [0, 2, 1, 3, 2, 1, 3, 2];

function build(ctx) {
  const rand = rng(77);
  const noise = ctx.createBuffer(1, SR * 2, SR);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = rand() * 2 - 1;
  const ir = ctx.createBuffer(2, Math.floor(SR * 2.2), SR);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < d.length; i++) d[i] = (rand() * 2 - 1) * Math.pow(1 - i / d.length, 3.4);
  }
  const master = ctx.createGain();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -15; comp.knee.value = 8; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.18;
  master.connect(comp);
  comp.connect(ctx.destination);
  const verb = ctx.createConvolver();
  verb.buffer = ir;
  const verbIn = ctx.createGain();
  verbIn.gain.value = 0.28;
  verbIn.connect(verb);
  verb.connect(master);
  const delay = ctx.createDelay(1);
  delay.delayTime.value = BEAT * 0.75;
  const fb = ctx.createGain(); fb.gain.value = 0.3;
  const dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 3000;
  const delayIn = ctx.createGain(), delayOut = ctx.createGain();
  delayOut.gain.value = 0.35;
  delayIn.connect(delay); delay.connect(dlp); dlp.connect(fb); fb.connect(delay); dlp.connect(delayOut); delayOut.connect(master);
  const duck = ctx.createGain();
  duck.connect(master);

  const env = (t, peak, a, d, dest) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    g.connect(dest);
    return g;
  };
  const filt = (type, f, q = 0.7) => { const n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; return n; };
  const nsrc = (t, dur, loop = false) => { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = loop; s.start(t, loop ? 0 : rand() * 1.2); s.stop(t + dur); return s; };
  const osc = (type, f, t, dur) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(t + dur); return o; };
  const send = (node, dest, amt) => { const g = ctx.createGain(); g.gain.value = amt; node.connect(g); g.connect(dest); };

  return {
    master,
    kick(t, v = 0.95) {
      const o = osc('sine', 155, t, 0.5);
      o.frequency.exponentialRampToValueAtTime(44, t + 0.12);
      o.connect(env(t, v, 0.003, 0.45, master));
      nsrc(t, 0.03).connect(filt('highpass', 2600)).connect(env(t, 0.2 * v, 0.001, 0.012, master));
      duck.gain.setValueAtTime(0.35, t);
      duck.gain.linearRampToValueAtTime(1, t + 0.26);
    },
    clap(t, v = 0.42) {
      const s = nsrc(t, 0.34), g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      [0, 0.011, 0.022].forEach(k => { g.gain.setValueAtTime(v, t + k); g.gain.exponentialRampToValueAtTime(0.03 * v, t + k + 0.009); });
      g.gain.setValueAtTime(0.8 * v, t + 0.031);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
      s.connect(filt('bandpass', 1500, 0.9)).connect(filt('highpass', 500)).connect(g);
      g.connect(master);
      send(g, verbIn, 0.4);
    },
    hat(t, open = false, v = 0.08) { nsrc(t, open ? 0.3 : 0.08).connect(filt('highpass', 7800)).connect(env(t, v, 0.001, open ? 0.2 : 0.04, master)); },
    snare(t, v = 0.2) { const g = env(t, v, 0.001, 0.07, master); nsrc(t, 0.12).connect(filt('bandpass', 1900, 0.8)).connect(g); send(g, verbIn, 0.3); },
    bass(t, m, dur, v = 0.28) {
      const lp = filt('lowpass', 1300, 5);
      lp.frequency.setValueAtTime(1300, t);
      lp.frequency.exponentialRampToValueAtTime(200, t + 0.2);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.006);
      g.gain.setValueAtTime(v, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc('sawtooth', hz(m), t, dur + 0.02).connect(lp);
      const sub = osc('sine', hz(m), t, dur + 0.02), sg = ctx.createGain();
      sg.gain.value = 0.9; sub.connect(sg); sg.connect(g);
      lp.connect(g);
      g.connect(duck);
    },
    pad(t, notes, dur, v = 0.02, cutoff = 1200, attack = 0.25) {
      notes.forEach(m => [-8, 0, 8].forEach((c, k) => {
        const o = osc('sawtooth', hz(m), t, dur + 1.2);
        o.detune.value = c;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(v, t + attack);
        g.gain.setValueAtTime(v, t + dur);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.1);
        const p = ctx.createStereoPanner();
        p.pan.value = (k - 1) * 0.6;
        o.connect(filt('lowpass', cutoff, 0.4)).connect(g).connect(p);
        p.connect(duck);
        send(p, verbIn, 0.5);
      }));
    },
    pluck(t, m, v = 0.1, bright = 4000) {
      const lp = filt('lowpass', bright, 2);
      lp.frequency.setValueAtTime(bright, t);
      lp.frequency.exponentialRampToValueAtTime(400, t + 0.22);
      const g = env(t, v, 0.003, 0.3, duck);
      [-7, 7].forEach(c => { const o = osc('square', hz(m), t, 0.4); o.detune.value = c; o.connect(lp); });
      lp.connect(g);
      send(g, delayIn, 0.5);
      send(g, verbIn, 0.2);
    },
    riser(t0, t1, v = 0.18) {
      const bp = filt('bandpass', 300, 1.6);
      bp.frequency.setValueAtTime(300, t0);
      bp.frequency.exponentialRampToValueAtTime(7000, t1);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(v, t1 - 0.02);
      g.gain.linearRampToValueAtTime(0.0001, t1);
      nsrc(t0, t1 - t0 + 0.02, true).connect(bp).connect(g);
      g.connect(master);
      send(g, verbIn, 0.4);
    },
    impact(t, v = 0.8) {
      const o = osc('sine', 60, t, 1.8);
      o.frequency.exponentialRampToValueAtTime(30, t + 1.2);
      o.connect(env(t, v, 0.004, 1.5, master));
      const g = env(t, 0.3, 0.002, 1.3, master);
      nsrc(t, 1.5).connect(filt('lowpass', 1800)).connect(g);
      send(g, verbIn, 0.6);
    },
    crash(t, v = 0.1) { const g = env(t, v, 0.002, 1.1, master); nsrc(t, 1.3).connect(filt('highpass', 4200)).connect(g); send(g, verbIn, 0.3); },
    whoosh(t, dur = 0.3, v = 0.2) {
      const bp = filt('bandpass', 400, 1.8);
      bp.frequency.setValueAtTime(400, t);
      bp.frequency.exponentialRampToValueAtTime(3800, t + dur * 0.7);
      bp.frequency.exponentialRampToValueAtTime(900, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const p = ctx.createStereoPanner();
      p.pan.setValueAtTime(-0.7, t);
      p.pan.linearRampToValueAtTime(0.7, t + dur);
      nsrc(t, dur + 0.05).connect(bp).connect(g).connect(p);
      p.connect(master);
    },
    // Falha digital: bip quadrado que cai de afinação + estalo de ruído.
    glitch(t, m, v = 0.16) {
      const o = osc('square', hz(m), t, 0.09);
      o.frequency.exponentialRampToValueAtTime(hz(m - 12), t + 0.07);
      o.connect(filt('lowpass', 5000)).connect(env(t, v, 0.001, 0.07, master));
      nsrc(t, 0.05).connect(filt('bandpass', 6000, 2)).connect(env(t, v * 0.8, 0.001, 0.03, master));
    },
  };
}

function arrange(ctx) {
  const I = build(ctx);
  const dur = TIMELINE.duration;

  // Abertura: falhas no ritmo do pisca-pisca cromo/chapado e riser.
  [[0, 81], [0.12, 76], [0.24, 81], [0.3, 84], [0.48, 76], [0.6, 88]].forEach(([t, m]) => I.glitch(t, m));
  I.riser(0.05, T0, 0.14);
  I.impact(T0, 0.7);

  // Seções: batida completa com um respiro no meio.
  const fin = TIMELINE.byId.final.start;
  PROG.forEach((name, b) => {
    const t = beatAt(b * 4);
    I.pad(t, CH[name].pad, Math.min(BEAT * 4, fin - t), b === 0 ? 0.016 : 0.02, b === 3 ? 900 : 1300);
  });
  const lastBeat = Math.floor((dur - T0) / BEAT) - 2; // termina antes do final
  for (let n = 0; n < lastBeat; n++) {
    const t = beatAt(n);
    const inBar = n % 4;
    const chord = CH[PROG[Math.floor(n / 4) % PROG.length]];
    const breath = n >= 12 && n < 16; // respiro no compasso 4 (papelaria → bobinas)
    // No respiro a batida vira meio-tempo (bumbo nos tempos 1 e 3, palma no 3).
    if (!breath || inBar % 2 === 0) I.kick(t);
    if (breath ? inBar === 2 : inBar === 1 || inBar === 3) I.clap(t, 0.4);
    I.hat(t + BEAT / 2, true, breath ? 0.05 : 0.08);
    [0.25, 0.75].forEach(o => I.hat(t + BEAT * o, false, 0.045));
    I.bass(t + BEAT / 2, chord.root, BEAT * 0.45, breath ? 0.2 : 0.28);
    // Arpejo em colcheias a partir do compasso 2.
    if (n >= 4) [0, 0.5].forEach((o, k) => I.pluck(t + BEAT * o, chord.arp[ARP[(inBar * 2 + k) % 8]], k ? 0.07 : 0.09, breath ? 2000 : 4000));
  }
  // Pontos de acento: manual, painel, contêiner e totem.
  ['manual', 'painel', 'conteiner', 'totem'].forEach(id => I.crash(TIMELINE.byId[id].start));
  ['painel', 'totem'].forEach(id => I.impact(TIMELINE.byId[id].start, 0.45));
  // Whooshes nas transições com desfoque.
  TIMELINE.list.filter(s => s.whip).forEach(s => I.whoosh(s.start - 0.16, 0.34));
  I.riser(beatAt(15) - BEAT * 2, beatAt(16), 0.12);
  // Final: impacto, acorde longo e fade-out.
  I.impact(fin, 0.8);
  I.pad(fin, CH.Am.pad.concat([76]), 1.0, 0.022, 1100, 0.05);
  [[fin + 0.3, 81], [fin + 0.6, 76], [fin + 0.9, 72]].forEach(([t, m]) => I.pluck(t, m, 0.07, 2600));
  I.master.gain.setValueAtTime(1, dur - 0.8);
  I.master.gain.linearRampToValueAtTime(0, dur - 0.03);
}

let cache = null;
export async function renderSoundtrack() {
  if (cache) return cache;
  const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const ctx = new Ctx(2, Math.ceil(SR * TIMELINE.duration), SR);
  arrange(ctx);
  const buf = await ctx.startRendering();
  let peak = 0;
  for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i])); }
  const g = peak > 0 ? 0.89 / peak : 1;
  for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= g; }
  cache = buf;
  return buf;
}

export function toWav(buf) {
  const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate;
  const view = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const str = (o, s) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); view.setUint32(4, 36 + n * ch * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, ch, true);
  view.setUint32(24, sr, true); view.setUint32(28, sr * ch * 2, true); view.setUint16(32, ch * 2, true);
  view.setUint16(34, 16, true); str(36, 'data'); view.setUint32(40, n * ch * 2, true);
  const chans = [...Array(ch)].map((_, c) => buf.getChannelData(c));
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, chans[c][i])); view.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
  return view.buffer;
}
