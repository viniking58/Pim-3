'use strict';
/* =====================================================================
   Linha do tempo, sobreposição de interface e renderização de quadros.
   Durações em tempos musicais (BEAT = 0,5 s a 120 BPM).
   ===================================================================== */

const TIMELINE = (() => {
  const list = [
    { id: 'intro', label: 'Construção', beats: 8, theme: 'dark', draw: (...a) => sceneIntro(...a), count: false, punch: false },
    { id: 'papel', label: 'Papel', beats: 1, theme: 'light', draw: (...a) => matPaper(...a) },
    { id: 'cera', label: 'Lacre de cera', beats: 1, theme: 'light', draw: (...a) => matWax(...a) },
    { id: 'bordado', label: 'Bordado', beats: 1, theme: 'dark', draw: (...a) => matEmbroidery(...a) },
    { id: 'neon', label: 'Neon', beats: 1, theme: 'dark', draw: (...a) => matNeon(...a) },
    { id: 'carimbo', label: 'Carimbo', beats: 1, theme: 'light', draw: (...a) => matStamp(...a) },
    { id: 'metal', label: 'Placa de metal', beats: 1, theme: 'dark', draw: (...a) => matMetal(...a) },
    { id: 'pin', label: 'Pin esmaltado', beats: 1, theme: 'dark', draw: (...a) => matPin(...a) },
    { id: 'adesivo', label: 'Adesivo', beats: 1, theme: 'dark', draw: (...a) => matSticker(...a) },
    { id: 'app', label: 'Ícone do app', beats: 4, theme: 'light', draw: (...a) => sceneApp(...a) },
    { id: 'cartao', label: 'Cartão de visita', beats: 4, theme: 'light', draw: (...a) => sceneCards(...a) },
    { id: 'camiseta', label: 'Camiseta', beats: 4, theme: 'light', draw: (...a) => sceneShirt(...a) },
    { id: 'outdoor', label: 'Outdoor', beats: 4, theme: 'dark', draw: (...a) => sceneBillboard(...a) },
    { id: 'embalagem', label: 'Embalagem', beats: 4, theme: 'light', draw: (...a) => scenePackaging(...a) },
    { id: 'perfil', label: 'Redes sociais', beats: 4, theme: 'dark', draw: (...a) => sceneProfile(...a) },
    { id: 'padrao', label: 'Padrão', beats: 4, theme: 'dark', draw: (...a) => scenePattern(...a) },
    { id: 'cores', label: 'Versões de cor', beats: 4, theme: 'dark', draw: (...a) => sceneColors(...a) },
    { id: 'recap', label: 'Recap', beats: 4, theme: 'dark', draw: (...a) => sceneRecap(...a), count: false },
    { id: 'final', label: 'Assinatura', beats: 8, theme: 'dark', draw: (...a) => sceneFinal(...a), count: false },
  ];
  let t = 0, app = 0;
  const byId = {};
  for (const s of list) {
    s.dur = s.beats * BEAT;
    s.start = t;
    t += s.dur;
    if (s.count !== false) s.app = ++app;
    byId[s.id] = s;
  }
  return { list, byId, duration: t, apps: app };
})();

// Batidas com flash de luz (entrada do drop, quebra, recap e final).
const FLASHES = [4, 20, 24, 26];

function sceneAt(t) {
  const L = TIMELINE.list;
  for (let i = L.length - 1; i >= 0; i--) if (t >= L[i].start) return { s: L[i], local: t - L[i].start, index: i };
  return { s: L[0], local: t, index: 0 };
}

/* ---------- interface sobreposta (rótulos, contador, progresso) ---------- */
const pad2 = n => String(n).padStart(2, '0');

function regMark(ctx, x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y);
  ctx.moveTo(x, y - 12); ctx.lineTo(x, y + 12);
  ctx.stroke();
}

function drawUI(ctx, t, ui, sinceCut) {
  const dur = TIMELINE.duration;
  const a = range(t, 0.2, 0.7) * (1 - range(t, dur - 0.7, dur - 0.2));
  if (a <= 0) return;
  const fg = ui.theme === 'light' ? COL.ink : COL.cream;
  ctx.save();
  ctx.globalAlpha = a;

  const sg = ctx.createLinearGradient(0, 0, 0, 300);
  const scrim = ui.theme === 'light' ? '#EFE9DF' : COL.ink;
  sg.addColorStop(0, rgba(scrim, 0.42));
  sg.addColorStop(1, rgba(scrim, 0));
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, W, 300);

  regMark(ctx, 64, 76, rgba(fg, 0.5));
  regMark(ctx, W - 64, 76, rgba(fg, 0.5));
  text(ctx, BRAND.kicker, 64, 136, { size: 19, weight: 600, spacing: 4, color: fg, alpha: 0.72 });
  if (ui.app) text(ctx, 'APLICAÇÕES', W - 64, 136, { size: 19, weight: 600, spacing: 4, color: fg, alpha: 0.72, align: 'right' });

  // Rótulo da cena entra de baixo para cima a cada corte.
  const k = E.outCubic(range(sinceCut, 0, 0.2));
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 150, W, 70);
  ctx.clip();
  const dy = (1 - k) * 60;
  text(ctx, ui.label, 64, 200 + dy, { family: FONT_DISPLAY, size: 42, weight: 700, color: fg });
  if (ui.app) {
    text(ctx, `${pad2(ui.app)}/${pad2(TIMELINE.apps)}`, W - 64, 200 + dy, { family: FONT_DISPLAY, size: 42, weight: 700, color: fg, align: 'right' });
  }
  ctx.restore();

  const by = 1846;
  ctx.fillStyle = rgba(fg, 0.22);
  ctx.fillRect(64, by, W - 128, 3);
  ctx.fillStyle = COL.pink;
  ctx.fillRect(64, by, (W - 128) * clamp(t / dur), 3);
  const secs = Math.floor(t);
  text(ctx, `00:${pad2(secs)} / 00:${pad2(Math.round(dur))}`, W - 64, by - 22, { size: 17, weight: 400, color: fg, alpha: 0.7, align: 'right' });
  text(ctx, `© ${BRAND.year}`, 64, by - 22, { size: 17, weight: 400, color: fg, alpha: 0.7 });
  ctx.restore();
}

function drawFlashes(ctx, t) {
  for (const f of FLASHES) {
    if (t >= f && t < f + 0.22) {
      ctx.fillStyle = rgba(COL.cream, 0.6 * Math.pow(1 - (t - f) / 0.22, 2));
      ctx.fillRect(0, 0, W, H);
    }
  }
}

/* ---------- um quadro completo ---------- */
function renderFrame(ctx, t, opts = {}) {
  K = opts.K || 1;
  const frame = opts.frame ?? Math.round(t * VIDEO.fps);
  t = clamp(t, 0, TIMELINE.duration - 1e-6);
  const { s, local } = sceneAt(t);
  const env = { t, frame, ui: { label: s.label, theme: s.theme, app: s.app }, sinceCut: local };

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowColor = 'transparent';
  const punch = s.punch === false ? 1 : 1 + 0.05 * (1 - E.outCubic(range(local, 0, 0.3)));
  ctx.setTransform(K * punch, 0, 0, K * punch, CX * K * (1 - punch), CY * K * (1 - punch));
  ctx.save();
  s.draw(ctx, local, s.dur, env);
  ctx.restore();

  ctx.setTransform(K, 0, 0, K, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  drawVignette(ctx, env.ui.theme === 'light' ? 0.16 : 0.38);
  drawFlashes(ctx, t);
  drawGrain(ctx, frame, 0.07);
  if (opts.ui !== false) drawUI(ctx, t, env.ui, env.sinceCut);
}
