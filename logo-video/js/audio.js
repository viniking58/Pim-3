'use strict';
/* =====================================================================
   Trilha sonora sintetizada com Web Audio, no mesmo ritmo dos cortes
   (120 BPM, Fá menor). É renderizada uma vez com OfflineAudioContext:
   o mesmo áudio toca na prévia e vai para o MP4.
   ===================================================================== */

const Soundtrack = (() => {
  const SR = 48000;
  const b = n => n * BEAT;                 // tempos → segundos
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  const CH = {
    Db: { root: 37, pad: [49, 53, 56, 60], arp: [61, 65, 68, 72] },
    Eb: { root: 39, pad: [51, 55, 58, 65], arp: [63, 67, 70, 75] },
    Fm: { root: 41, pad: [53, 56, 60, 63], arp: [65, 68, 72, 75] },
    Ab: { root: 44, pad: [56, 60, 63, 67], arp: [68, 72, 75, 79] },
  };
  // Um acorde por compasso (2 s).
  const BARS = ['Db', 'Eb', 'Fm', 'Db', 'Ab', 'Eb', 'Fm', 'Db', 'Ab', 'Eb', 'Fm', 'Eb', 'Fm', 'Db', 'Fm'];
  const ARP = [0, null, 2, 1, null, 3, 2, null, 0, 2, null, 1, 3, null, 2, 1];

  function build(ctx) {
    const rnd = mulberry32(2026);
    const noise = ctx.createBuffer(1, SR * 2, SR);
    const nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = rnd() * 2 - 1;

    const ir = ctx.createBuffer(2, Math.floor(SR * 2.4), SR);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < d.length; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / d.length, 3.2);
    }

    const master = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 8;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.2;
    master.connect(comp);
    comp.connect(ctx.destination);

    const verb = ctx.createConvolver();
    verb.buffer = ir;
    const verbIn = ctx.createGain();
    verbIn.gain.value = 0.3;
    verbIn.connect(verb);
    verb.connect(master);

    const delay = ctx.createDelay(1);
    delay.delayTime.value = b(0.75);
    const fb = ctx.createGain();
    fb.gain.value = 0.34;
    const dlp = ctx.createBiquadFilter();
    dlp.type = 'lowpass';
    dlp.frequency.value = 2800;
    const delayIn = ctx.createGain();
    const delayOut = ctx.createGain();
    delayOut.gain.value = 0.4;
    delayIn.connect(delay);
    delay.connect(dlp);
    dlp.connect(fb);
    fb.connect(delay);
    dlp.connect(delayOut);
    delayOut.connect(master);

    // Barramento com "sidechain": abaixa pad/baixo a cada bumbo.
    const duck = ctx.createGain();
    duck.connect(master);

    const gainEnv = (t, peak, a, dcy, dest) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + dcy);
      g.connect(dest);
      return g;
    };
    const filt = (type, f, q = 0.7) => {
      const n = ctx.createBiquadFilter();
      n.type = type;
      n.frequency.value = f;
      n.Q.value = q;
      return n;
    };
    const noiseSrc = (t, dur, loop = false) => {
      const s = ctx.createBufferSource();
      s.buffer = noise;
      s.loop = loop;
      s.start(t, loop ? 0 : rnd() * 1.2);
      s.stop(t + dur);
      return s;
    };
    const osc = (type, f, t, dur) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(f, t);
      o.start(t);
      o.stop(t + dur);
      return o;
    };
    const send = (node, dest, amt) => {
      const g = ctx.createGain();
      g.gain.value = amt;
      node.connect(g);
      g.connect(dest);
    };

    const I = {
      kick(t, v = 0.95) {
        const o = osc('sine', 150, t, 0.5);
        o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
        o.connect(gainEnv(t, v, 0.003, 0.42, master));
        const n = noiseSrc(t, 0.03);
        n.connect(filt('highpass', 2500)).connect(gainEnv(t, 0.22 * v, 0.001, 0.012, master));
        duck.gain.setValueAtTime(0.32, t);
        duck.gain.linearRampToValueAtTime(1, t + 0.24);
      },
      clap(t, v = 0.42, wet = 0.45) {
        const n = noiseSrc(t, 0.34);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        [0, 0.011, 0.022].forEach(k => {
          g.gain.setValueAtTime(v, t + k);
          g.gain.exponentialRampToValueAtTime(0.03 * v, t + k + 0.009);
        });
        g.gain.setValueAtTime(0.8 * v, t + 0.031);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
        n.connect(filt('bandpass', 1400, 0.9)).connect(filt('highpass', 500)).connect(g);
        g.connect(master);
        send(g, verbIn, wet);
      },
      hat(t, open = false, v = 0.09) {
        const n = noiseSrc(t, open ? 0.3 : 0.08);
        n.connect(filt('highpass', 7600)).connect(gainEnv(t, v, 0.001, open ? 0.22 : 0.045, master));
      },
      snare(t, v = 0.2) {
        const n = noiseSrc(t, 0.12);
        const g = gainEnv(t, v, 0.001, 0.07, master);
        n.connect(filt('bandpass', 1900, 0.8)).connect(g);
        send(g, verbIn, 0.3);
      },
      bass(t, m, dur, v = 0.26) {
        const f = hz(m);
        const lp = filt('lowpass', 1500, 5);
        lp.frequency.setValueAtTime(1500, t);
        lp.frequency.exponentialRampToValueAtTime(240, t + 0.18);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(v, t + 0.006);
        g.gain.setValueAtTime(v, t + dur * 0.7);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc('sawtooth', f, t, dur + 0.02).connect(lp);
        const sub = osc('sine', f, t, dur + 0.02);
        const sg = ctx.createGain();
        sg.gain.value = 0.9;
        sub.connect(sg);
        sg.connect(g);
        lp.connect(g);
        g.connect(duck);
      },
      sub(t, m, dur, v = 0.15) {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(v, t + 0.08);
        g.gain.setValueAtTime(v, t + dur - 0.3);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc('sine', hz(m - 12), t, dur + 0.05).connect(g);
        g.connect(master);
      },
      pad(t, notes, dur, v = 0.024, cutoff = 1100, attack = 0.35) {
        notes.forEach(m => {
          [-9, 0, 9].forEach((cents, k) => {
            const o = osc('sawtooth', hz(m), t, dur + 1.2);
            o.detune.value = cents;
            const lp = filt('lowpass', cutoff, 0.4);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(v, t + attack);
            g.gain.setValueAtTime(v, t + dur);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.1);
            const p = ctx.createStereoPanner();
            p.pan.value = (k - 1) * 0.55;
            o.connect(lp).connect(g).connect(p);
            p.connect(duck);
            send(p, verbIn, 0.5);
          });
        });
      },
      pluck(t, m, v = 0.11, bright = 4200) {
        const lp = filt('lowpass', bright, 2);
        lp.frequency.setValueAtTime(bright, t);
        lp.frequency.exponentialRampToValueAtTime(420, t + 0.22);
        const g = gainEnv(t, v, 0.003, 0.3, duck);
        [-7, 7].forEach(c => {
          const o = osc('sawtooth', hz(m), t, 0.4);
          o.detune.value = c;
          o.connect(lp);
        });
        lp.connect(g);
        send(g, delayIn, 0.55);
        send(g, verbIn, 0.25);
      },
      riser(t0, t1, v = 0.2) {
        const n = noiseSrc(t0, t1 - t0 + 0.02, true);
        const bp = filt('bandpass', 300, 1.6);
        bp.frequency.setValueAtTime(300, t0);
        bp.frequency.exponentialRampToValueAtTime(7500, t1);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(v, t1 - 0.02);
        g.gain.linearRampToValueAtTime(0.0001, t1);
        n.connect(bp).connect(g);
        g.connect(master);
        send(g, verbIn, 0.4);
        const o = osc('sine', 220, t0, t1 - t0);
        o.frequency.exponentialRampToValueAtTime(880, t1);
        const og = ctx.createGain();
        og.gain.setValueAtTime(0.0001, t0);
        og.gain.exponentialRampToValueAtTime(0.05, t1 - 0.02);
        og.gain.linearRampToValueAtTime(0.0001, t1);
        o.connect(og);
        og.connect(master);
      },
      impact(t, v = 0.85) {
        const o = osc('sine', 62, t, 1.8);
        o.frequency.exponentialRampToValueAtTime(31, t + 1.2);
        o.connect(gainEnv(t, v, 0.004, 1.6, master));
        const n = noiseSrc(t, 1.6);
        const g = gainEnv(t, 0.32, 0.002, 1.4, master);
        n.connect(filt('lowpass', 1900)).connect(g);
        send(g, verbIn, 0.6);
      },
      crash(t, v = 0.12) {
        const n = noiseSrc(t, 1.4);
        const g = gainEnv(t, v, 0.002, 1.2, master);
        n.connect(filt('highpass', 4200)).connect(g);
        send(g, verbIn, 0.3);
      },
      whoosh(t, dur = 0.4, v = 0.16) {
        const n = noiseSrc(t, dur + 0.05);
        const bp = filt('bandpass', 300, 2);
        bp.frequency.setValueAtTime(300, t);
        bp.frequency.exponentialRampToValueAtTime(2800, t + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(v, t + dur * 0.6);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        const p = ctx.createStereoPanner();
        p.pan.setValueAtTime(-0.6, t);
        p.pan.linearRampToValueAtTime(0.6, t + dur);
        n.connect(bp).connect(g).connect(p);
        p.connect(master);
        send(p, verbIn, 0.3);
      },
      snip(t) {
        const n = noiseSrc(t, 0.05);
        n.connect(filt('bandpass', 5200, 3)).connect(gainEnv(t, 0.35, 0.001, 0.03, master));
        const o = osc('sine', 2600, t, 0.08);
        o.frequency.exponentialRampToValueAtTime(1700, t + 0.06);
        o.connect(gainEnv(t, 0.12, 0.001, 0.06, master));
      },
      thud(t) {
        const o = osc('sine', 230, t, 0.35);
        o.frequency.exponentialRampToValueAtTime(70, t + 0.12);
        o.connect(gainEnv(t, 0.75, 0.002, 0.3, master));
        const p = osc('sine', 900, t, 0.08);
        p.frequency.exponentialRampToValueAtTime(1400, t + 0.05);
        p.connect(gainEnv(t, 0.16, 0.001, 0.05, master));
      },
      blip(t, m) {
        const g = gainEnv(t, 0.07, 0.002, 0.09, master);
        osc('square', hz(m), t, 0.12).connect(filt('lowpass', 3200)).connect(g);
        send(g, delayIn, 0.5);
      },
    };
    return { I, master };
  }

  function arrange(ctx) {
    const { I, master } = build(ctx);
    const bar = i => i * 2;

    // Introdução: construção da logo.
    I.pad(0, CH.Db.pad, 2, 0.016, 700, 0.9);
    I.pad(2, CH.Eb.pad, 2, 0.02, 900, 0.3);
    [0.75, 1.25, 1.75].forEach(t => I.whoosh(t - 0.12, 0.42));
    for (let k = 0; k < 8; k++) I.hat(2 + k * 0.25, false, 0.03 + k * 0.008);
    I.snip(2.5);
    I.thud(3.0);
    I.riser(2, 4, 0.18);
    for (let k = 0; k < 4; k++) I.snare(3.0 + k * b(0.25), 0.05 + k * 0.012);
    for (let k = 0; k < 8; k++) I.snare(3.5 + k * b(0.125), 0.1 + k * 0.014);
    I.impact(4);

    // Drop e seções com batida.
    const groove = (from, to, { pluck = true, hats16 = true } = {}) => {
      for (let t = from; t < to - 1e-6; t += BEAT) {
        const beatInBar = Math.round((t % 2) / BEAT);
        I.kick(t);
        if (beatInBar % 2 === 1) I.clap(t);
        I.hat(t + b(0.5), true, 0.1);
        if (hats16) [0.25, 0.75].forEach(o => I.hat(t + b(o), false, 0.05));
        const chord = CH[BARS[Math.floor(t / 2)]];
        I.bass(t + b(0.5), chord.root, b(0.45));
      }
      if (pluck) {
        for (let t = from; t < to - 1e-6; t += b(0.25)) {
          const step = Math.round((t % 2) / b(0.25)) % 16;
          const idx = ARP[step];
          if (idx === null) continue;
          const chord = CH[BARS[Math.floor(t / 2)]];
          I.pluck(t, chord.arp[idx], step % 4 === 0 ? 0.12 : 0.085);
        }
      }
    };
    for (let i = 2; i <= 12; i++) {
      const c = CH[BARS[i]];
      if (i === 10 || i === 11) I.pad(bar(i), c.pad, 2, 0.02, 1500, 0.2);
      else I.pad(bar(i), c.pad, 2, 0.022, 1200, 0.15);
    }
    groove(4, 8, { pluck: false, hats16: false });
    groove(8, 20);
    [8, 12, 16].forEach(t => I.crash(t));
    I.riser(19, 20, 0.12);

    // Quebra: padrão + versões de cor.
    for (let t = 20; t < 24; t += BEAT) {
      const beatInBar = Math.round((t % 2) / BEAT);
      if (beatInBar % 2 === 1) I.clap(t, 0.3, 0.8);
      I.hat(t + b(0.5), false, 0.04);
    }
    for (let t = 20; t < 24; t += b(0.25)) {
      const step = Math.round((t % 2) / b(0.25)) % 16;
      const idx = ARP[step];
      if (idx !== null) I.pluck(t, CH[BARS[Math.floor(t / 2)]].arp[idx], 0.07, 1800);
    }
    I.sub(20, CH.Fm.root, 2);
    I.sub(22, CH.Eb.root, 2);
    I.riser(22, 24, 0.2);
    for (let k = 0; k < 16; k++) I.snare(23 + k * 0.0625, 0.04 + k * 0.011);
    I.impact(24, 0.7);

    // Recap: drop curto e intenso.
    groove(24, 26);
    [25.5, 25.625, 25.75, 25.875].forEach((t, k) => I.snare(t, 0.12 + k * 0.03));

    // Final: assinatura.
    I.impact(26, 0.75);
    I.pad(26, CH.Db.pad, 2, 0.018, 1000, 0.1);
    I.pad(28, CH.Fm.pad, 2.2, 0.02, 900, 0.3);
    I.sub(26, CH.Db.root, 2);
    I.sub(28, CH.Fm.root, 2);
    [[26.5, 72], [27.0, 68], [27.5, 65]].forEach(([t, m]) => I.pluck(t, m, 0.08, 2600));
    [[28.0, 84], [28.25, 91], [28.5, 84], [28.75, 91]].forEach(([t, m]) => I.blip(t, m));

    // Fade-out final.
    master.gain.setValueAtTime(1, TIMELINE.duration - 0.9);
    master.gain.linearRampToValueAtTime(0, TIMELINE.duration - 0.05);
  }

  let cache = null;
  async function render() {
    if (cache) return cache;
    const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ctx = new Ctx(2, Math.ceil(SR * TIMELINE.duration), SR);
    arrange(ctx);
    const buf = await ctx.startRendering();
    let peak = 0;
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
    }
    const gain = peak > 0 ? 0.89 / peak : 1;
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < d.length; i++) d[i] *= gain;
    }
    cache = buf;
    return buf;
  }

  // WAV PCM 16 bits.
  function toWav(buf) {
    const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate;
    const view = new DataView(new ArrayBuffer(44 + n * ch * 2));
    const str = (o, s) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
    str(0, 'RIFF');
    view.setUint32(4, 36 + n * ch * 2, true);
    str(8, 'WAVE');
    str(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, ch, true);
    view.setUint32(24, sr, true);
    view.setUint32(28, sr * ch * 2, true);
    view.setUint16(32, ch * 2, true);
    view.setUint16(34, 16, true);
    str(36, 'data');
    view.setUint32(40, n * ch * 2, true);
    const chans = [...Array(ch)].map((_, c) => buf.getChannelData(c));
    let o = 44;
    for (let i = 0; i < n; i++) {
      for (let c = 0; c < ch; c++) {
        const v = Math.max(-1, Math.min(1, chans[c][i]));
        view.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true);
        o += 2;
      }
    }
    return view.buffer;
  }

  return { render, toWav };
})();
