'use strict';
/* =====================================================================
   Player: reprodução sincronizada com o áudio, navegação por cenas,
   gravação no navegador e API usada pelo render.mjs (?render).
   ===================================================================== */

(() => {
  const RENDER = new URLSearchParams(location.search).has('render');
  const DUR = TIMELINE.duration;
  const POSTER = 3.25;
  const $ = id => document.getElementById(id);
  const canvas = $('stage');
  const ctx = canvas.getContext('2d');
  const S = { t: POSTER, playing: false, sound: true, K: 1, ac: null, src: null, buf: null, t0: 0, a0: 0, w0: 0, rec: null, recDest: null, dragging: false };

  const fmt = t => {
    const m = Math.floor(t / 60), s = t - m * 60;
    return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
  };

  function warmTextures() {
    ['grain', 'paper', 'twill', 'denim', 'metal', 'bricks', 'grunge', 'alu', 'stamp', 'cityFar', 'cityMid', 'cityNear'].forEach(tex);
    cardFaceLight();
    boardContent();
    SCREEN();
  }

  function fit() {
    if (RENDER || S.rec) {
      S.K = 1;
    } else {
      const r = canvas.getBoundingClientRect();
      const need = (r.height * (window.devicePixelRatio || 1)) / H;
      S.K = clamp(Math.ceil(need * 4) / 4, 0.25, 1);
    }
    const w = Math.round(W * S.K), h = Math.round(H * S.K);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  function draw() {
    renderFrame(ctx, S.t, { K: S.K });
    if (!RENDER) syncUI();
  }

  /* ---------- áudio ---------- */
  let audioJob = null;
  const prepareAudio = () => audioJob || (audioJob = Soundtrack.render().then(buf => { S.buf = buf; syncUI(); return buf; }));

  // Precisa rodar dentro do clique (política de autoplay dos navegadores).
  function unlockAudio() {
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

  function clockTime() {
    if (S.src) return S.t0 + Math.max(0, S.ac.currentTime - S.a0);
    return S.t0 + (performance.now() - S.w0) / 1000;
  }

  /* ---------- transporte ---------- */
  // A imagem começa na hora; o som entra sincronizado quando a trilha fica pronta.
  async function play() {
    if (S.t >= DUR - 0.05) S.t = 0;
    unlockAudio();
    S.playing = true;
    S.t0 = S.t;
    S.w0 = performance.now();
    requestAnimationFrame(tick);
    syncUI();
    if (!S.buf) {
      try { await prepareAudio(); } catch (e) { return; }
      if (!S.playing) return;
      S.t0 = S.t;
      S.w0 = performance.now();
    }
    startAudio(S.t);
  }

  function pause() {
    S.playing = false;
    stopAudio();
    syncUI();
  }

  function seek(t) {
    S.t = clamp(t, 0, DUR - 1e-3);
    if (S.playing) {
      S.t0 = S.t;
      S.w0 = performance.now();
      startAudio(S.t);
    }
    draw();
  }

  function tick() {
    if (!S.playing) return;
    const t = clockTime();
    if (t >= DUR) {
      if (S.rec) {
        S.t = DUR - 1e-3;
        draw();
        pause();
        S.rec.stop();
        return;
      }
      S.t = 0;
      S.t0 = 0;
      S.w0 = performance.now();
      startAudio(0);
    } else {
      S.t = t;
    }
    draw();
    requestAnimationFrame(tick);
  }

  /* ---------- interface ---------- */
  let sceneButtons = [];
  function buildUI() {
    const list = $('scenes');
    TIMELINE.list.filter(s => s.id !== 'recap').forEach(s => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = `<b>${s.app ? pad2(s.app) : '—'}</b><span></span>`;
      b.querySelector('span').textContent = s.label;
      b.addEventListener('click', () => seek(s.start + Math.min(0.2, s.dur * 0.3)));
      li.appendChild(b);
      list.appendChild(li);
      sceneButtons.push([s, b]);
    });
    const ticks = $('ticks');
    TIMELINE.list.forEach(s => {
      const i = document.createElement('i');
      i.style.left = `${(s.start / DUR) * 100}%`;
      ticks.appendChild(i);
    });
    const scrub = $('scrub');
    scrub.max = String(Math.round(DUR * 1000));
    scrub.addEventListener('input', () => { S.dragging = true; seek(scrub.value / 1000); });
    scrub.addEventListener('change', () => { S.dragging = false; });
    $('play').addEventListener('click', () => (S.playing ? pause() : play()));
    $('bigPlay').addEventListener('click', () => play());
    $('sound').addEventListener('click', () => {
      S.sound = !S.sound;
      if (S.playing) { S.t0 = S.t; S.w0 = performance.now(); startAudio(S.t); }
      syncUI();
    });
    $('export').addEventListener('click', record);
    if (window.__ARTIFACT__) $('exportBox').hidden = true;
    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' && e.target.type === 'range' && e.code !== 'Space') return;
      if (e.code === 'Space') { e.preventDefault(); S.playing ? pause() : play(); }
      if (e.code === 'ArrowRight') seek(S.t + BEAT);
      if (e.code === 'ArrowLeft') seek(S.t - BEAT);
    });
    window.addEventListener('resize', () => { fit(); draw(); });
  }

  function syncUI() {
    $('time').textContent = `${fmt(S.t)} / ${fmt(DUR)}`;
    const now = sceneAt(S.t).s;
    $('now').textContent = now.app ? `${pad2(now.app)} · ${now.label}` : now.label;
    if (!S.dragging) $('scrub').value = String(Math.round(S.t * 1000));
    const play = $('play');
    play.textContent = S.playing ? 'Pausar' : 'Reproduzir';
    $('bigPlay').hidden = S.playing || !!S.rec || $('play').disabled;
    const snd = $('sound');
    snd.textContent = !S.sound ? 'Som: desligado' : S.buf ? 'Som: ligado' : 'Som: preparando…';
    snd.setAttribute('aria-pressed', String(S.sound));
    const cur = sceneAt(S.t).s;
    const ref = cur.id === 'recap' ? null : cur;
    sceneButtons.forEach(([s, b]) => b.classList.toggle('on', s === ref));
  }

  /* ---------- gravação no navegador (MediaRecorder) ---------- */
  async function record() {
    if (S.rec) return;
    const types = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    const mime = window.MediaRecorder && types.find(m => MediaRecorder.isTypeSupported(m));
    const note = $('exportNote');
    if (!mime || !canvas.captureStream) {
      note.textContent = 'Este navegador não grava canvas. Use npm run render para gerar o MP4.';
      return;
    }
    pause();
    unlockAudio();
    if (!S.ac) {
      note.textContent = 'Não foi possível iniciar o áudio neste navegador.';
      return;
    }
    $('export').disabled = true;
    $('export').textContent = 'Preparando trilha…';
    await prepareAudio();
    S.recDest = S.ac.createMediaStreamDestination();
    const stream = new MediaStream([...canvas.captureStream(VIDEO.fps).getVideoTracks(), ...S.recDest.stream.getAudioTracks()]);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 16e6, audioBitsPerSecond: 192e3 });
    const chunks = [];
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: mime });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `reel-da-logo.${mime.startsWith('video/mp4') ? 'mp4' : 'webm'}`;
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
    fit();
    S.t = 0;
    draw();
    rec.start(500);
    await play();
  }

  /* ---------- API para o render.mjs ---------- */
  window.__meta = { fps: VIDEO.fps, duration: DUR, width: W, height: H, frames: Math.round(DUR * VIDEO.fps) };
  window.__renderFrameJPEG = (t, q = 0.93) => {
    renderFrame(ctx, t, { K: 1 });
    return canvas.toDataURL('image/jpeg', q).split(',')[1];
  };
  window.__audioWavBase64 = async () => {
    const bytes = new Uint8Array(Soundtrack.toWav(await Soundtrack.render()));
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  };

  /* ---------- início ---------- */
  (async () => {
    if (RENDER) document.body.classList.add('render');
    else buildUI();
    await loadEmbeddedFonts();
    fit();
    draw();
    await new Promise(r => setTimeout(r, 30));
    warmTextures();
    draw();
    if (!RENDER) {
      $('loading').hidden = true;
      $('play').disabled = false;
      $('export').disabled = false;
      syncUI();
      prepareAudio().catch(() => {});
    }
    window.__ready = true;
  })().catch(err => {
    window.__error = String(err && err.stack || err);
    const l = $('loading');
    if (l) l.textContent = 'Erro ao iniciar: ' + err.message;
  });
})();
