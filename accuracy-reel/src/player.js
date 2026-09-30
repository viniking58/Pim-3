import { TIMELINE, VIDEO, BEAT, renderFrame, cutAt } from './timeline.js';
import { renderSoundtrack } from './audio.js';

/* Player: reprodução sincronizada pelo relógio do áudio, navegação por
   planos, gravação no navegador (MediaRecorder). */
export function startPlayer({ stage, canvas }) {
  const $ = id => document.getElementById(id);
  const DUR = TIMELINE.duration;
  const S = { t: 2.9, playing: false, sound: true, K: 1, ac: null, src: null, buf: null, t0: 0, a0: 0, w0: 0, rec: null, recDest: null, dragging: false };
  const fmt = t => `${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(1).padStart(4, '0')}`;

  function fit() {
    let K = 1;
    if (!S.rec) {
      const r = canvas.getBoundingClientRect();
      K = Math.min(1, Math.max(0.5, Math.ceil(((r.height * (window.devicePixelRatio || 1)) / VIDEO.height) * 4) / 4));
    }
    if (K !== S.K || stage.width !== Math.round(VIDEO.width * K)) {
      S.K = K;
      stage.setSize(Math.round(VIDEO.width * K), Math.round(VIDEO.height * K));
    }
  }
  const draw = () => { renderFrame(stage, S.t); sync(); };

  let job = null;
  const prepareAudio = () => job || (job = renderSoundtrack().then(b => { S.buf = b; sync(); return b; }));
  function unlock() {
    try {
      if (!S.ac) S.ac = new (window.AudioContext || window.webkitAudioContext)();
      if (S.ac.state === 'suspended') S.ac.resume();
    } catch (e) { S.ac = null; }
  }
  function stopAudio() {
    if (!S.src) return;
    try { S.src.stop(); } catch (e) { /* já parado */ }
    S.src.disconnect();
    S.src = null;
  }
  function startAudio(t) {
    stopAudio();
    if (!S.ac || !S.buf || (!S.sound && !S.recDest)) return;
    const src = S.ac.createBufferSource();
    src.buffer = S.buf;
    if (S.sound) src.connect(S.ac.destination);
    if (S.recDest) src.connect(S.recDest);
    S.a0 = S.ac.currentTime + 0.05;
    src.start(S.a0, t);
    S.src = src;
  }
  const clock = () => (S.src ? S.t0 + Math.max(0, S.ac.currentTime - S.a0) : S.t0 + (performance.now() - S.w0) / 1000);

  async function play() {
    if (S.t >= DUR - 0.05) S.t = 0;
    unlock();
    S.playing = true;
    S.t0 = S.t;
    S.w0 = performance.now();
    requestAnimationFrame(tick);
    sync();
    if (!S.buf) {
      try { await prepareAudio(); } catch (e) { return; }
      if (!S.playing) return;
      S.t0 = S.t;
      S.w0 = performance.now();
    }
    startAudio(S.t);
  }
  function pause() { S.playing = false; stopAudio(); sync(); }
  function seek(t) {
    S.t = Math.min(DUR - 1e-3, Math.max(0, t));
    if (S.playing) { S.t0 = S.t; S.w0 = performance.now(); startAudio(S.t); }
    draw();
  }
  function tick() {
    if (!S.playing) return;
    const t = clock();
    if (t >= DUR) {
      if (S.rec) { S.t = DUR - 1e-3; draw(); pause(); S.rec.stop(); return; }
      S.t = 0; S.t0 = 0; S.w0 = performance.now(); startAudio(0);
    } else S.t = t;
    draw();
    requestAnimationFrame(tick);
  }

  const buttons = [];
  const list = $('scenes');
  TIMELINE.list.forEach((s, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b><span></span>`;
    b.querySelector('span').textContent = s.label;
    b.addEventListener('click', () => seek(s.start + Math.min(0.15, s.dur * 0.25)));
    li.appendChild(b);
    list.appendChild(li);
    buttons.push([s, b]);
  });
  const ticks = $('ticks');
  TIMELINE.list.forEach(s => { const i = document.createElement('i'); i.style.left = `${(s.start / DUR) * 100}%`; ticks.appendChild(i); });
  const scrub = $('scrub');
  scrub.max = String(Math.round(DUR * 1000));
  scrub.addEventListener('input', () => { S.dragging = true; seek(scrub.value / 1000); });
  scrub.addEventListener('change', () => { S.dragging = false; });
  $('play').addEventListener('click', () => (S.playing ? pause() : play()));
  $('bigPlay').addEventListener('click', () => play());
  $('sound').addEventListener('click', () => {
    S.sound = !S.sound;
    if (S.playing) { S.t0 = S.t; S.w0 = performance.now(); startAudio(S.t); }
    sync();
  });
  $('export').addEventListener('click', record);
  if (window.__ARTIFACT__) $('exportBox').hidden = true;
  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' && e.code !== 'Space') return;
    if (e.code === 'Space') { e.preventDefault(); S.playing ? pause() : play(); }
    if (e.code === 'ArrowRight') seek(S.t + BEAT);
    if (e.code === 'ArrowLeft') seek(S.t - BEAT);
  });
  window.addEventListener('resize', () => { if (!S.rec) { fit(); draw(); } });

  function sync() {
    $('time').textContent = `${fmt(S.t)} / ${fmt(DUR)}`;
    if (!S.dragging) scrub.value = String(Math.round(S.t * 1000));
    $('play').textContent = S.playing ? 'Pausar' : 'Reproduzir';
    $('bigPlay').hidden = S.playing || !!S.rec;
    $('sound').textContent = !S.sound ? 'Som: desligado' : S.buf ? 'Som: ligado' : 'Som: preparando…';
    $('sound').setAttribute('aria-pressed', String(S.sound));
    const cur = cutAt(S.t);
    $('now').textContent = `${String(cur.index + 1).padStart(2, '0')} · ${cur.cut.label}`;
    buttons.forEach(([s, b]) => b.classList.toggle('on', s === cur.cut));
  }

  async function record() {
    if (S.rec) return;
    const types = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    const mime = window.MediaRecorder && types.find(m => MediaRecorder.isTypeSupported(m));
    const note = $('exportNote');
    if (!mime || !canvas.captureStream) { note.textContent = 'Este navegador não grava canvas. Use npm run render para gerar o MP4.'; return; }
    pause();
    unlock();
    if (!S.ac) { note.textContent = 'Não foi possível iniciar o áudio neste navegador.'; return; }
    $('export').disabled = true;
    $('export').textContent = 'Preparando trilha…';
    await prepareAudio();
    S.recDest = S.ac.createMediaStreamDestination();
    S.rec = true;
    fit();
    const stream = new MediaStream([...canvas.captureStream(VIDEO.fps).getVideoTracks(), ...S.recDest.stream.getAudioTracks()]);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 16e6, audioBitsPerSecond: 192e3 });
    const chunks = [];
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: mime });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `accuracy-automation-reel.${mime.startsWith('video/mp4') ? 'mp4' : 'webm'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      S.rec = null;
      S.recDest = null;
      $('export').disabled = false;
      $('export').textContent = 'Gravar vídeo';
      note.textContent = `Pronto: ${a.download} (${(blob.size / 1e6).toFixed(1)} MB).`;
      fit();
      draw();
    };
    S.rec = rec;
    $('export').textContent = 'Gravando…';
    note.textContent = 'Gravando em tempo real. Mantenha esta aba aberta até o fim.';
    S.t = 0;
    draw();
    rec.start(500);
    await play();
  }

  fit();
  draw();
  $('loading').hidden = true;
  $('play').disabled = false;
  $('export').disabled = false;
  sync();
  prepareAudio().catch(() => {});
}
