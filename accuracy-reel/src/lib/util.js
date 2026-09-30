/* Matemática, easing e aleatoriedade determinística. */

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const range = (t, a, b) => clamp((t - a) / (b - a));
export const smooth = t => t * t * (3 - 2 * t);
export const TAU = Math.PI * 2;

export const E = {
  linear: t => t,
  inQuad: t => t * t,
  outQuad: t => 1 - (1 - t) * (1 - t),
  inOutQuad: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: t => t * t * t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: t => 1 - Math.pow(1 - t, 4),
  inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
};

export function hash(n) {
  let h = Math.imul(n | 0, 374761393) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
export const hash2 = (x, y) => hash(Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663));

export function rng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function vnoise2(x, y, seed = 0) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const ux = smooth(x - ix), uy = smooth(y - iy);
  const s = seed * 7919;
  const a = hash2(ix + s, iy), b = hash2(ix + 1 + s, iy);
  const c = hash2(ix + s, iy + 1), d = hash2(ix + 1 + s, iy + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}

// Ruído fractal que fecha nas bordas (period = tamanho do ladrilho em células).
export function fbmTile(x, y, period, oct = 4, seed = 0) {
  let v = 0, amp = 0.5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) {
    const p = period * f;
    const ix = Math.floor(x * f), iy = Math.floor(y * f);
    const ux = smooth(x * f - ix), uy = smooth(y * f - iy);
    const s = (seed + i) * 7919;
    const w = k => ((k % p) + p) % p;
    const a = hash2(w(ix) + s, w(iy)), b = hash2(w(ix + 1) + s, w(iy));
    const c = hash2(w(ix) + s, w(iy + 1)), d = hash2(w(ix + 1) + s, w(iy + 1));
    v += amp * lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
    n += amp; amp *= 0.5; f *= 2;
  }
  return v / n;
}
