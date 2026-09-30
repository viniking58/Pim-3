import * as THREE from 'three';
import { fbmTile, hash2, rng, clamp } from './util.js';

/* Texturas procedurais (ladrilháveis) para materiais realistas:
   rugosidade, normal e cor, geradas uma vez em canvas e reaproveitadas. */

export function makeCanvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = Math.round(w);
  c.height = Math.round(h);
  return c;
}

export function canvasTexture(canvas, { repeat = [1, 1], color = false, anisotropy = 8 } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = anisotropy;
  t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.needsUpdate = true;
  return t;
}

function field(size, fn) {
  const h = new Float32Array(size * size);
  for (let y = 0, i = 0; y < size; y++) for (let x = 0; x < size; x++, i++) h[i] = fn(x, y);
  return h;
}

function greyCanvas(size, h, lo = 0, hi = 1) {
  const c = makeCanvas(size), g = c.getContext('2d');
  const img = g.createImageData(size, size), d = img.data;
  for (let i = 0; i < h.length; i++) {
    const v = clamp(lo + (hi - lo) * h[i]) * 255;
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
    d[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

function normalCanvas(size, h, strength) {
  const c = makeCanvas(size), g = c.getContext('2d');
  const img = g.createImageData(size, size), d = img.data;
  const at = (x, y) => h[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0, i = 0; y < size; y++) {
    for (let x = 0; x < size; x++, i++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const l = Math.hypot(dx, dy, 1);
      d[i * 4] = (-dx / l * 0.5 + 0.5) * 255;
      d[i * 4 + 1] = (dy / l * 0.5 + 0.5) * 255;
      d[i * 4 + 2] = (1 / l * 0.5 + 0.5) * 255;
      d[i * 4 + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}

const cache = new Map();
function cached(key, make) {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
}

/* Conjuntos de mapas por tipo de superfície. Cada um devolve
   { normal, rough, color? } como canvases; use maps(tipo, repeat). */
const GEN = {
  // Papel e cartão revestido: fibra fina.
  paper() {
    const s = 512;
    const h = field(s, (x, y) => fbmTile(x / 8, y / 8, s / 8, 3, 1) * 0.6 + hash2(x, y) * 0.4);
    return { normal: normalCanvas(s, h, 1.2), rough: greyCanvas(s, h, 0.72, 0.9) };
  },
  // Pintura eletrostática (casca de laranja).
  powder() {
    const s = 512;
    const h = field(s, (x, y) => fbmTile(x / 6, y / 6, s / 6, 3, 7));
    return { normal: normalCanvas(s, h, 3.2), rough: greyCanvas(s, h, 0.42, 0.52) };
  },
  // Alumínio escovado: riscos horizontais.
  brushed() {
    const s = 512;
    const r = rng(11), rows = Array.from({ length: s }, () => r());
    const h = field(s, (x, y) => rows[y] * 0.7 + fbmTile(x / 64, y / 1, s / 64, 2, 3) * 0.3);
    return { normal: normalCanvas(s, h, 0.9), rough: greyCanvas(s, h, 0.22, 0.38) };
  },
  // Concreto polido (piso de galpão).
  concrete() {
    const s = 1024;
    const blot = field(s, (x, y) => fbmTile(x / 96, y / 96, s / 96, 5, 21));
    const pores = field(s, (x, y) => (hash2(x * 3, y * 7) > 0.996 ? 1 : 0));
    const c = makeCanvas(s), g = c.getContext('2d');
    const img = g.createImageData(s, s), d = img.data;
    for (let i = 0; i < blot.length; i++) {
      const v = 150 + (blot[i] - 0.5) * 70 - pores[i] * 60 + (hash2(i, 5) - 0.5) * 10;
      d[i * 4] = v; d[i * 4 + 1] = v; d[i * 4 + 2] = v - 3; d[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const hh = field(s, (x, y) => blot[y * s + x] * 0.3 + hash2(x, y) * 0.1 - pores[y * s + x] * 0.6);
    return { color: c, normal: normalCanvas(s, hh, 1.5), rough: greyCanvas(s, blot, 0.25, 0.7) };
  },
  // Reboco/parede branca.
  plaster() {
    const s = 512;
    const h = field(s, (x, y) => fbmTile(x / 16, y / 16, s / 16, 4, 31) * 0.8 + hash2(x, y) * 0.2);
    return { normal: normalCanvas(s, h, 2.4), rough: greyCanvas(s, h, 0.8, 0.95) };
  },
  // Plástico injetado (textura sutil).
  plastic() {
    const s = 256;
    const h = field(s, (x, y) => fbmTile(x / 4, y / 4, s / 4, 2, 41));
    return { normal: normalCanvas(s, h, 0.6), rough: greyCanvas(s, h, 0.3, 0.38) };
  },
};

export function maps(kind, repeat = [1, 1]) {
  const m = cached(kind, GEN[kind]);
  const out = {};
  if (m.normal) out.normalMap = canvasTexture(m.normal, { repeat });
  if (m.rough) out.roughnessMap = canvasTexture(m.rough, { repeat });
  if (m.color) out.map = canvasTexture(m.color, { repeat, color: true });
  return out;
}

export function warmTextures() {
  Object.keys(GEN).forEach(k => cached(k, GEN[k]));
}
