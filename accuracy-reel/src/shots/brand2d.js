import { flatShot } from '../lib/flat.js';
import { LOGO, BRAND, logoPath } from '../logo.js';
import { drawLockup, WORD, TEXT } from '../lib/art.js';
import { E, range, lerp, clamp } from '../lib/util.js';

const C = BRAND.colors;

// Tela verde com a assinatura (abre e fecha o vídeo).
export function createLockup({ tagline = false } = {}) {
  return flatShot((ctx, t, d) => {
    ctx.fillStyle = C.green;
    ctx.fillRect(0, 0, 1080, 1920);
    const g = ctx.createRadialGradient(540, 900, 100, 540, 960, 1300);
    g.addColorStop(0, 'rgba(255,255,255,0.05)');
    g.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1920);
    const z = lerp(1.045, 1, E.outCubic(range(t, 0, d)));
    ctx.save();
    ctx.translate(540, 960);
    ctx.scale(z, z);
    ctx.translate(-540, -960);
    drawLockup(ctx, 540, tagline ? 900 : 960, 150);
    if (tagline) {
      const a = E.outCubic(range(t, 0.25, 0.7));
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(255,255,255,0.78)';
      ctx.font = `500 34px ${TEXT}`;
      ctx.textAlign = 'center';
      ctx.fillText(BRAND.tagline, 540, 1080 + (1 - a) * 16);
    }
    ctx.restore();
  }, { grain: 0.025 });
}

// Grade de construção do símbolo sobre fundo claro.
export function createGrid() {
  const lines = [];
  // Retas das bordas inclinadas (prolongadas) e horizontais-chave.
  for (const pts of LOGO.shapes) {
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if (Math.abs(a[1] - b[1]) > 60) lines.push([a, b]);
    }
  }
  const hs = [0, 72.5, 141.1, 167.79, 228.62, 282.17];
  return flatShot((ctx, t, d) => {
    ctx.fillStyle = '#F3F3F1';
    ctx.fillRect(0, 0, 1080, 1920);
    const h = 330, s = h / LOGO.h;
    const ox = 540 - (LOGO.w * s) / 2, oy = 960 - h / 2;
    const P = ([x, y]) => [ox + x * s, oy + y * s];
    const p1 = E.outCubic(range(t, 0, d * 0.7));
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(s, s);
    ctx.fillStyle = `rgba(20,22,21,${0.16 * E.outCubic(range(t, 0, 0.25))})`;
    ctx.fill(logoPath());
    ctx.restore();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(40,46,44,0.55)';
    lines.forEach(([a, b], i) => {
      const k = E.outExpo(clamp(p1 * 1.6 - i * 0.03));
      if (k <= 0) return;
      const A = P(a), B = P(b);
      const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
      const ext = 900 * k;
      ctx.beginPath();
      ctx.moveTo(A[0] - (dx / L) * ext * 0.6, A[1] - (dy / L) * ext * 0.6);
      ctx.lineTo(B[0] + (dx / L) * ext * 0.6, B[1] + (dy / L) * ext * 0.6);
      ctx.stroke();
    });
    hs.forEach((y, i) => {
      const k = E.outExpo(clamp(p1 * 1.5 - i * 0.05));
      if (k <= 0) return;
      const Y = oy + y * s;
      ctx.beginPath();
      ctx.moveTo(540 - 560 * k, Y);
      ctx.lineTo(540 + 560 * k, Y);
      ctx.stroke();
    });
    const pn = E.outCubic(range(t, d * 0.25, d * 0.7));
    ctx.fillStyle = '#F3F3F1';
    ctx.strokeStyle = 'rgba(40,46,44,0.8)';
    ctx.lineWidth = 2;
    for (const pts of LOGO.shapes) {
      for (const pt of pts) {
        const [x, y] = P(pt);
        ctx.beginPath();
        ctx.arc(x, y, 5.5 * pn, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.globalAlpha = pn;
    ctx.fillStyle = 'rgba(40,46,44,0.65)';
    ctx.font = `500 17px ${TEXT}`;
    ctx.fillText('59°', ox + 40, oy + h + 42);
    ctx.fillText('x', ox + 150 * s, oy - 18);
    ctx.fillText('x', ox + 300 * s, oy - 18);
    ctx.fillText('1,6x', ox + LOGO.w * s + 20, oy + 141 * s);
    ctx.globalAlpha = 1;
  }, { grain: 0.02 });
}

// Tipografia: Barlow em blocos que sobem (como um espécime de fonte).
export function createType() {
  return flatShot((ctx, t, d) => {
    ctx.fillStyle = C.ink;
    ctx.fillRect(0, 0, 1080, 1920);
    const scroll = E.inOutCubic(range(t, 0, d)) * 420;
    ctx.save();
    ctx.translate(0, -scroll);
    ctx.fillStyle = C.white;
    ctx.font = `600 150px ${TEXT}`;
    ctx.fillText('Barlow', 90, 520);
    ctx.font = `400 26px ${TEXT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.62)';
    ['Uma grotesca de inspiração industrial, com', 'desenho aberto e ótima leitura em placas,', 'painéis e interfaces de operação.'].forEach((l, i) => ctx.fillText(l, 96, 600 + i * 38));
    ctx.fillStyle = C.white;
    ctx.font = `500 190px ${TEXT}`;
    ['Aa', 'Bb', 'Cc', 'Dd'].forEach((l, i) => ctx.fillText(l, 90, 930 + i * 210));
    ctx.font = `italic 800 190px ${WORD}`;
    ctx.fillStyle = '#8FB5AA';
    ['Aa', 'Bb', 'Cc', 'Dd'].forEach((l, i) => ctx.fillText(l, 560, 930 + i * 210));
    ctx.font = `500 22px ${TEXT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Regular 400 · Medium 500 · SemiBold 600', 96, 1800);
    ctx.fillText('Semi Condensed ExtraBold Italic 800', 560, 1800);
    ctx.restore();
  }, { grain: 0.03 });
}
