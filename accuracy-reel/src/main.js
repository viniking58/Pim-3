import { loadFonts } from './lib/fonts.js';
import { createStage } from './lib/stage.js';
import { warmTextures } from './lib/tex.js';
import { TIMELINE, VIDEO, prepareAll, renderFrame, cutAt } from './timeline.js';
import { startPlayer } from './player.js';
import { renderSoundtrack, toWav } from './audio.js';

/* Ponto de entrada: prepara fontes, texturas e planos; depois inicia o
   player (ou só expõe a API de quadros quando aberto com ?render). */
const RENDER = new URLSearchParams(location.search).has('render');

async function boot() {
  await loadFonts();
  const canvas = document.getElementById('stage');
  const stage = createStage(canvas, VIDEO.width, VIDEO.height);
  warmTextures();
  await prepareAll(stage, p => { const l = document.getElementById('loading'); if (l) l.textContent = `Preparando cenas… ${Math.round(p * 100)}%`; });

  window.__meta = { fps: VIDEO.fps, duration: TIMELINE.duration, width: VIDEO.width, height: VIDEO.height, frames: Math.round(TIMELINE.duration * VIDEO.fps) };
  window.__renderFrameJPEG = (t, q = 0.93) => {
    renderFrame(stage, t);
    return canvas.toDataURL('image/jpeg', q).split(',')[1];
  };
  // Folha de contato para revisão: vários instantes reduzidos numa imagem.
  window.__renderSheet = (times, scale = 0.25, cols = 6) => {
    const w = Math.round(VIDEO.width * scale), h = Math.round(VIDEO.height * scale);
    const out = document.createElement('canvas');
    out.width = cols * (w + 6) + 6;
    out.height = Math.ceil(times.length / cols) * (h + 26) + 6;
    const g = out.getContext('2d');
    g.fillStyle = '#555';
    g.fillRect(0, 0, out.width, out.height);
    const ms = [];
    times.forEach((t, i) => {
      const t0 = performance.now();
      renderFrame(stage, t);
      ms.push(Math.round(performance.now() - t0));
      const x = 6 + (i % cols) * (w + 6), y = 6 + Math.floor(i / cols) * (h + 26);
      g.drawImage(canvas, x, y, w, h);
      g.fillStyle = '#fff';
      g.font = '14px monospace';
      g.fillText(`${t.toFixed(2)}s ${cutAt(t).cut.id}`, x, y + h + 17);
    });
    return { data: out.toDataURL('image/jpeg', 0.9), ms };
  };
  window.__audioWavBase64 = async () => {
    const bytes = new Uint8Array(toWav(await renderSoundtrack()));
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  };
  if (!RENDER) startPlayer({ stage, canvas });
  else { document.body.classList.add('render'); renderFrame(stage, 0); }
  window.__ready = true;
}

boot().catch(err => {
  window.__error = String((err && err.stack) || err);
  console.error(err);
  const l = document.getElementById('loading');
  if (l) l.textContent = 'Erro ao iniciar: ' + err.message;
});
