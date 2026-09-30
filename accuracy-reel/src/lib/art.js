import * as THREE from 'three';
import { makeCanvas } from './tex.js';
import { LOGO, BRAND, drawLogo, logoPath } from '../logo.js';
import { rng } from './util.js';

/* Artes impressas (canvas) usadas como texturas: rótulos, cartões,
   papelaria, telas, pôsteres. Tudo com as cores e fontes da marca. */

export const C = BRAND.colors;
export const WORD = '"Barlow Semi Condensed", "Barlow", sans-serif';
export const TEXT = '"Barlow", sans-serif';

export function txt(ctx, s, x, y, o = {}) {
  const { size = 24, weight = 500, family = TEXT, color = C.ink, align = 'left', italic = false, spacing = 0, alpha = 1, baseline = 'alphabetic' } = o;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${family}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (spacing && 'letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(s, x, y);
  ctx.restore();
}

/* Assinatura horizontal: símbolo + ACCURACY / AUTOMATION.
   (x, y) = centro (ou início, com align 'left'); h = altura do símbolo. */
export function drawLockup(ctx, x, y, h, { fill = C.white, shadow = C.shadow, word = C.white, align = 'center' } = {}) {
  const fs = h * 0.47;
  ctx.save();
  ctx.font = `italic 800 ${fs}px ${WORD}`;
  const tw = Math.max(ctx.measureText(BRAND.line1).width, ctx.measureText(BRAND.line2).width);
  const lw = (h * (LOGO.w - (shadow ? LOGO.shadow[0] : 0))) / LOGO.h;
  const gap = h * 0.26;
  const total = lw + gap + tw;
  const x0 = align === 'center' ? x - total / 2 : x;
  drawLogo(ctx, x0 + lw / 2, y, h, { fill, shadow });
  ctx.fillStyle = word;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillText(BRAND.line1, x0 + lw + gap, y - h * 0.035);
  ctx.fillText(BRAND.line2, x0 + lw + gap - fs * 0.06, y + fs * 0.88);
  ctx.restore();
  return total;
}

// Grafismo da marca: faixas inclinadas a 59°, como as barras do símbolo.
export function stripes(ctx, x, y, w, h, { color = C.green, bar = 60, gap = 38, alpha = 1 } = {}) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  const k = 0.6, step = bar + gap;
  for (let sx = x - h * k - step; sx < x + w + step; sx += step) {
    ctx.beginPath();
    ctx.moveTo(sx + h * k, y);
    ctx.lineTo(sx + h * k + bar, y);
    ctx.lineTo(sx + bar, y + h);
    ctx.lineTo(sx, y + h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function barcode(ctx, x, y, w, h, seed = 3, color = C.ink) {
  const r = rng(seed);
  ctx.fillStyle = color;
  let cx = x;
  while (cx < x + w) {
    const bw = 1 + Math.floor(r() * 3.2);
    if (r() > 0.42) ctx.fillRect(cx, y, bw, h);
    cx += bw + 1;
  }
}

// Símbolo monocromático (sem sombra), alinhado por (cx, cy) e altura h.
export function mark(ctx, cx, cy, h, color = C.green) {
  drawLogo(ctx, cx, cy, h, { fill: color, shadow: null });
}

/* Cria (uma vez) uma textura a partir de uma função de desenho. */
const artCache = new Map();
export function artTexture(key, w, h, draw, { anisotropy = 8 } = {}) {
  if (artCache.has(key)) return artCache.get(key);
  const c = makeCanvas(w, h);
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropy;
  t.userData.canvas = c;
  artCache.set(key, t);
  return t;
}

export { LOGO, BRAND, drawLogo, logoPath };
