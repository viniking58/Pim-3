'use strict';
/* =====================================================================
   Núcleo: matemática, easing, aleatoriedade determinística, cores,
   geometria da logo, efeitos de canvas, 3D simples e texturas.
   Tudo é desenhado num espaço virtual de 1080 × 1920.
   ===================================================================== */

const W = VIDEO.width, H = VIDEO.height;
const CX = W / 2, CY = H / 2;
const TAU = Math.PI * 2;
const BEAT = 60 / VIDEO.bpm;
const COL = BRAND.colors;
const FONT_DISPLAY = 'Unbounded';
const FONT_MONO = 'Martian Mono';

// K = pixels reais por pixel virtual (1 na exportação, menor na prévia).
let K = 1;
const px = v => v * K;

// Registra as fontes embutidas (js/fonts.js) para o canvas e para o CSS.
async function loadEmbeddedFonts() {
  if (typeof EMBEDDED_FONTS === 'undefined' || !('FontFace' in window)) return;
  await Promise.all(EMBEDDED_FONTS.map(async f => {
    const bin = Uint8Array.from(atob(f.data), c => c.charCodeAt(0));
    const face = new FontFace(f.family, bin, { weight: String(f.weight), style: 'normal' });
    await face.load();
    document.fonts.add(face);
  }));
}

/* ---------- matemática ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const range = (t, a, b) => clamp((t - a) / (b - a));
const smooth = t => t * t * (3 - 2 * t);

const E = {
  linear: t => t,
  inQuad: t => t * t,
  outQuad: t => 1 - (1 - t) * (1 - t),
  inOutQuad: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: t => t * t * t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: t => 1 - Math.pow(1 - t, 4),
  inOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  inExpo: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo: t => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
  outBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
};

// Mola amortecida: 0 → 1 com leve oscilação.
const spring = (t, f = 18, d = 7) => (t <= 0 ? 0 : 1 - Math.exp(-d * t) * Math.cos(f * t));

/* ---------- aleatoriedade determinística ---------- */
function hash(n) {
  let h = Math.imul(n | 0, 374761393) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const hash2 = (x, y) => hash(Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663));

function mulberry32(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function vnoise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  return lerp(hash(i + seed * 1013), hash(i + 1 + seed * 1013), smooth(f));
}

function vnoise2(x, y, seed = 0) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const ux = smooth(x - ix), uy = smooth(y - iy);
  const s = seed * 7919;
  const a = hash2(ix + s, iy), b = hash2(ix + 1 + s, iy);
  const c = hash2(ix + s, iy + 1), d = hash2(ix + 1 + s, iy + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}

function fbm2(x, y, oct = 4, seed = 0) {
  let v = 0, amp = 0.5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) {
    v += amp * vnoise2(x * f, y * f, seed + i);
    n += amp; amp *= 0.5; f *= 2;
  }
  return v / n;
}

/* ---------- cores ---------- */
function rgbOf(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const css = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
const rgba = (hex, a = 1) => css(rgbOf(hex), a);
const mix = (h1, h2, t, a = 1) => {
  const x = rgbOf(h1), y = rgbOf(h2);
  return css([lerp(x[0], y[0], t), lerp(x[1], y[1], t), lerp(x[2], y[2], t)], a);
};
const shade = (hex, f, a = 1) => {
  const c = rgbOf(hex);
  return css(c.map(v => clamp(v * f, 0, 255)), a);
};

/* ---------- canvas ---------- */
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

function rrect(p, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  p.moveTo(x + r, y);
  p.arcTo(x + w, y, x + w, y + h, r);
  p.arcTo(x + w, y + h, x, y + h, r);
  p.arcTo(x, y + h, x, y, r);
  p.arcTo(x, y, x + w, y, r);
  p.closePath();
  return p;
}
const rrectPath = (x, y, w, h, r) => rrect(new Path2D(), x, y, w, h, r);

function fillRR(ctx, x, y, w, h, r, style) {
  ctx.fillStyle = style;
  ctx.fill(rrectPath(x, y, w, h, r));
}

function zoomAt(ctx, z, cx = CX, cy = CY) {
  ctx.translate(cx, cy);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
}

// Texto com espaçamento entre letras (usa ctx.letterSpacing quando existe).
function text(ctx, str, x, y, o = {}) {
  const {
    size = 24, weight = 500, family = FONT_MONO, color = COL.cream,
    align = 'left', baseline = 'alphabetic', spacing = 0, alpha = 1,
  } = o;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `${weight} ${size}px "${family}", ui-monospace, monospace`;
  ctx.fillStyle = color;
  ctx.textBaseline = baseline;
  if (!spacing) {
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
  } else if ('letterSpacing' in ctx) {
    ctx.letterSpacing = `${spacing}px`;
    const w = ctx.measureText(str).width - spacing;
    ctx.textAlign = 'left';
    ctx.fillText(str, align === 'center' ? x - w / 2 : align === 'right' ? x - w : x, y);
  } else {
    const chars = [...str];
    const w = chars.reduce((s, ch) => s + ctx.measureText(ch).width + spacing, -spacing);
    let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.textAlign = 'left';
    for (const ch of chars) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + spacing; }
  }
  ctx.restore();
}

/* ---------- geometria: polígonos com cantos arredondados ---------- */
function roundedPolyPts(verts, seg = 10) {
  const n = verts.length, pts = [];
  for (let i = 0; i < n; i++) {
    const [x, y, r] = verts[i];
    const [ax, ay] = verts[(i - 1 + n) % n];
    const [bx, by] = verts[(i + 1) % n];
    if (!r) { pts.push([x, y]); continue; }
    let l1 = Math.hypot(ax - x, ay - y), l2 = Math.hypot(bx - x, by - y);
    const d1 = [(ax - x) / l1, (ay - y) / l1], d2 = [(bx - x) / l2, (by - y) / l2];
    const th = Math.acos(clamp(d1[0] * d2[0] + d1[1] * d2[1], -1, 1));
    const tl = r / Math.tan(th / 2);
    const bl = Math.hypot(d1[0] + d2[0], d1[1] + d2[1]);
    const bis = [(d1[0] + d2[0]) / bl, (d1[1] + d2[1]) / bl];
    const cd = r / Math.sin(th / 2);
    const c = [x + bis[0] * cd, y + bis[1] * cd];
    const t1 = [x + d1[0] * tl, y + d1[1] * tl], t2 = [x + d2[0] * tl, y + d2[1] * tl];
    const a1 = Math.atan2(t1[1] - c[1], t1[0] - c[0]);
    let da = Math.atan2(t2[1] - c[1], t2[0] - c[0]) - a1;
    while (da > Math.PI) da -= TAU;
    while (da < -Math.PI) da += TAU;
    for (let k = 0; k <= seg; k++) {
      const a = a1 + (da * k) / seg;
      pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
    }
  }
  return pts;
}

function roundedPolyPath(verts) {
  const n = verts.length, p = new Path2D();
  const [lx, ly] = verts[n - 1], [fx, fy] = verts[0];
  p.moveTo((lx + fx) / 2, (ly + fy) / 2);
  for (let i = 0; i < n; i++) {
    const [x, y, r] = verts[i];
    const [nx, ny] = verts[(i + 1) % n];
    p.arcTo(x, y, nx, ny, r);
  }
  p.closePath();
  return p;
}

const rrectPts = (x, y, w, h, r, seg = 8) =>
  roundedPolyPts([[x, y, r], [x + w, y, r], [x + w, y + h, r], [x, y + h, r]], seg);

function ellipsePts(cx, cy, rx, ry, n = 48) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return pts;
}

function polyPath(pts, p = new Path2D()) {
  pts.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])));
  p.closePath();
  return p;
}

/* ---------- a logo ---------- */
const LogoShape = (() => {
  const d = LOGO.dot;
  const dotVerts = [[d.x, d.y, d.r], [d.x + d.w, d.y, d.r], [d.x + d.w, d.y + d.h, d.r], [d.x, d.y + d.h, d.r]];
  const glyph = roundedPolyPath(LOGO.glyph);
  const dot = roundedPolyPath(dotVerts);
  const both = new Path2D();
  both.addPath(glyph);
  both.addPath(dot);
  // Canto quadrado usado na animação de construção (antes do corte a 45°).
  const corner = new Path2D();
  corner.moveTo(346, 0);
  corner.lineTo(397, 0);
  corner.arcTo(409, 0, 409, 12, 12);
  corner.lineTo(409, 63);
  corner.closePath();
  // Linha central do "r" para o tubo de neon.
  const tube = new Path2D();
  tube.moveTo(60, 560);
  tube.lineTo(60, 60);
  tube.lineTo(318, 60);
  tube.lineTo(348, 90);
  tube.lineTo(348, 206);
  const tubeDot = rrectPath(d.x + 22, d.y + 22, d.w - 44, d.h - 44, 14);
  return {
    glyph, dot, both, corner, tube, tubeDot,
    glyphPts: roundedPolyPts(LOGO.glyph, 10),
    dotPts: roundedPolyPts(dotVerts, 10),
  };
})();

// Move o sistema de coordenadas para "unidades de logo": centro (cx, cy), altura h.
function logoSpace(ctx, cx, cy, h) {
  const s = h / LOGO.h;
  ctx.translate(cx - (LOGO.w * s) / 2, cy - (LOGO.h * s) / 2);
  ctx.scale(s, s);
  return s;
}

function drawLogo(ctx, cx, cy, h, glyph = COL.cream, dot = COL.pink, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  logoSpace(ctx, cx, cy, h);
  if (glyph) { ctx.fillStyle = glyph; ctx.fill(LogoShape.glyph); }
  if (dot) { ctx.fillStyle = dot; ctx.fill(LogoShape.dot); }
  ctx.restore();
}

// Pontos da logo transformados para uma caixa (útil para 3D e superfícies curvas).
function logoPts(which, cx, cy, h) {
  const s = h / LOGO.h, ox = cx - (LOGO.w * s) / 2, oy = cy - (LOGO.h * s) / 2;
  return (which === 'dot' ? LogoShape.dotPts : LogoShape.glyphPts).map(([x, y]) => [ox + x * s, oy + y * s]);
}

/* ---------- efeitos ---------- */
function innerShadow(ctx, path, color, blur, dx, dy) {
  ctx.save();
  ctx.clip(path);
  const ring = new Path2D();
  ring.rect(-1e4, -1e4, 2e4, 2e4);
  ring.addPath(path);
  ctx.shadowColor = color;
  ctx.shadowBlur = px(blur);
  ctx.shadowOffsetX = px(dx);
  ctx.shadowOffsetY = px(dy);
  ctx.fillStyle = '#000';
  ctx.fill(ring, 'evenodd');
  ctx.restore();
}

// Desenha apenas a sombra difusa de um caminho (a forma fica fora da tela).
function shadowOnly(ctx, path, color, blur, dx = 0, dy = 0) {
  const m = ctx.getTransform();
  const off = 30000 / (Math.hypot(m.a, m.b) || 1);
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = px(blur);
  ctx.shadowOffsetX = -m.a * off + px(dx);
  ctx.shadowOffsetY = -m.b * off + px(dy);
  ctx.translate(off, 0);
  ctx.fillStyle = '#000';
  ctx.fill(path);
  ctx.restore();
}

function withShadow(ctx, color, blur, dx, dy, fn) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = px(blur);
  ctx.shadowOffsetX = px(dx);
  ctx.shadowOffsetY = px(dy);
  fn();
  ctx.restore();
}

// Faixa de brilho diagonal (verniz, vidro, metal) recortada por um caminho.
function gloss(ctx, path, x0, y0, x1, y1, a = 0.35) {
  ctx.save();
  ctx.clip(path);
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.42, 'rgba(255,255,255,0)');
  g.addColorStop(0.5, `rgba(255,255,255,${a})`);
  g.addColorStop(0.62, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-1e4, -1e4, 2e4, 2e4);
  ctx.restore();
}

/* ---------- 3D mínimo ---------- */
// Câmera em (x, y, -D) olhando para +z: objetos em z = 0 aparecem em escala 1.
const Cam = (D = 2400, x = 0, y = 0, cx = CX, cy = CY) => ({ D, x, y, cx, cy });

function project(cam, p) {
  const zz = p[2] + cam.D;
  const k = cam.D / zz;
  return [cam.cx + (p[0] - cam.x) * k, cam.cy + (p[1] - cam.y) * k, zz];
}

function rotMat(rx, ry, rz) {
  const a = Math.cos(rx), b = Math.sin(rx), c = Math.cos(ry), d = Math.sin(ry), e = Math.cos(rz), f = Math.sin(rz);
  return [
    e * c, e * d * b - f * a, e * d * a + f * b,
    f * c, f * d * b + e * a, f * d * a - e * b,
    -d, c * b, c * a,
  ];
}

// Objeto rígido: coordenadas locais (u, v, w) → mundo → tela.
function Obj(cam, o = {}) {
  const { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1 } = o;
  const m = rotMat(rx, ry, rz);
  const obj = {
    cam, m,
    world(u, v, w = 0) {
      u *= s; v *= s; w *= s;
      return [m[0] * u + m[1] * v + m[2] * w + x, m[3] * u + m[4] * v + m[5] * w + y, m[6] * u + m[7] * v + m[8] * w + z];
    },
    P(u, v, w = 0) { return project(cam, obj.world(u, v, w)); },
    dir(nu, nv, nw) { return [m[0] * nu + m[1] * nv + m[2] * nw, m[3] * nu + m[4] * nv + m[5] * nw, m[6] * nu + m[7] * nv + m[8] * nw]; },
    // A face com normal local (0,0,-1) está voltada para a câmera?
    facing(w = 0) {
      const c = obj.world(0, 0, w), n = obj.dir(0, 0, -1);
      return n[0] * (c[0] - cam.x) + n[1] * (c[1] - cam.y) + n[2] * (c[2] + cam.D) < 0;
    },
    pts(list, w = 0) { return list.map(([u, v]) => obj.P(u, v, w)); },
  };
  return obj;
}

// Iluminação lambertiana simples (luz vinda de cima/esquerda/frente).
const LIGHT = (() => { const l = [-0.45, -0.65, -0.62], n = Math.hypot(...l); return l.map(v => v / n); })();
const lambert = (n, amb = 0.38) => amb + (1 - amb) * Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);

// Placa com espessura: base (verso), laterais sombreadas e frente.
function drawSlab(ctx, obj, pts, depth, frontStyle, sideHex, sideDark = 0.35) {
  const F = obj.pts(pts, 0), B = obj.pts(pts, depth);
  ctx.fillStyle = shade(sideHex, sideDark);
  ctx.fill(polyPath(B));
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [x0, y0] = pts[i], [x1, y1] = pts[j];
    const nrm = obj.dir(y1 - y0, -(x1 - x0), 0);
    const l = Math.hypot(...nrm) || 1;
    const nn = nrm.map(v => v / l);
    const c = obj.world((x0 + x1) / 2, (y0 + y1) / 2, depth / 2);
    const vis = nn[0] * (c[0] - obj.cam.x) + nn[1] * (c[1] - obj.cam.y) + nn[2] * (c[2] + obj.cam.D) < 0;
    if (!vis) continue;
    const q = new Path2D();
    q.moveTo(F[i][0], F[i][1]); q.lineTo(F[j][0], F[j][1]); q.lineTo(B[j][0], B[j][1]); q.lineTo(B[i][0], B[i][1]); q.closePath();
    const col = shade(sideHex, lambert(nn, 0.45));
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.lineWidth = 1 / K;
    ctx.fill(q);
    ctx.stroke(q);
  }
  if (frontStyle) { ctx.fillStyle = frontStyle; ctx.fill(polyPath(F)); }
  return F;
}

// Mapeia uma imagem numa superfície qualquer: map(u, v) → [x, y] na tela.
function drawMapped(ctx, img, map, nx = 8, ny = 8) {
  const iw = img.width, ih = img.height, grid = [];
  for (let j = 0; j <= ny; j++) {
    const row = [];
    for (let i = 0; i <= nx; i++) row.push(map(i / nx, j / ny));
    grid.push(row);
  }
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const u0 = (i / nx) * iw, u1 = ((i + 1) / nx) * iw, v0 = (j / ny) * ih, v1 = ((j + 1) / ny) * ih;
      const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], d = grid[j + 1][i];
      mapTri(ctx, img, a, b, c, u0, v0, u1, v0, u1, v1);
      mapTri(ctx, img, a, c, d, u0, v0, u1, v1, u0, v1);
    }
  }
}

function mapTri(ctx, img, a, b, c, ua, va, ub, vb, uc, vc) {
  const mx = (a[0] + b[0] + c[0]) / 3, my = (a[1] + b[1] + c[1]) / 3;
  const e = 0.8 / K;
  const grow = p => { const dx = p[0] - mx, dy = p[1] - my, l = Math.hypot(dx, dy) || 1; return [p[0] + (dx / l) * e, p[1] + (dy / l) * e]; };
  const A = grow(a), B = grow(b), C = grow(c);
  const den = (ub - ua) * (vc - va) - (uc - ua) * (vb - va);
  if (Math.abs(den) < 1e-9) return;
  const m11 = ((b[0] - a[0]) * (vc - va) - (c[0] - a[0]) * (vb - va)) / den;
  const m12 = ((b[1] - a[1]) * (vc - va) - (c[1] - a[1]) * (vb - va)) / den;
  const m21 = ((c[0] - a[0]) * (ub - ua) - (b[0] - a[0]) * (uc - ua)) / den;
  const m22 = ((c[1] - a[1]) * (ub - ua) - (b[1] - a[1]) * (uc - ua)) / den;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]);
  ctx.closePath();
  ctx.clip();
  ctx.transform(m11, m12, m21, m22, a[0] - m11 * ua - m21 * va, a[1] - m12 * ua - m22 * va);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

/* ---------- texturas procedurais (geradas uma vez, com cache) ---------- */
const TEX = {};
const tex = name => TEX[name] || (TEX[name] = TEX_GEN[name]());

function pixels(w, h, fn) {
  const c = makeCanvas(w, h), g = c.getContext('2d');
  const img = g.createImageData(w, h), d = img.data;
  for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i += 4) fn(d, i, x, y);
  g.putImageData(img, 0, 0);
  return c;
}

// Ruído de baixa frequência suave (gerado pequeno e ampliado).
function softNoise(w, h, cells, seed, lo, hi) {
  const sw = Math.ceil(w / cells), sh = Math.ceil(h / cells);
  const small = pixels(sw, sh, (d, i, x, y) => {
    const v = lerp(lo, hi, fbm2(x * 0.18, y * 0.18, 4, seed));
    d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
  });
  const c = makeCanvas(w, h), g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(small, 0, 0, w, h);
  return c;
}

function addGrainTo(canvas, amt, seed = 1) {
  const g = canvas.getContext('2d');
  const img = g.getImageData(0, 0, canvas.width, canvas.height), d = img.data;
  const rnd = mulberry32(seed);
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() + rnd() - 1) * amt;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  return canvas;
}

const TEX_GEN = {
  grain() {
    const tiles = [];
    for (let k = 0; k < 6; k++) {
      const rnd = mulberry32(900 + k);
      tiles.push(pixels(256, 256, (d, i) => {
        const v = 128 + (rnd() + rnd() + rnd() - 1.5) * 90;
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
      }));
    }
    return tiles;
  },

  // Papel algodão claro, com fibras e manchas sutis.
  paper() {
    const c = makeCanvas(W, H), g = c.getContext('2d');
    g.fillStyle = '#EFE9DF';
    g.fillRect(0, 0, W, H);
    g.globalAlpha = 0.5;
    g.globalCompositeOperation = 'overlay';
    g.drawImage(softNoise(W, H, 12, 3, 90, 165), 0, 0);
    g.globalCompositeOperation = 'source-over';
    const rnd = mulberry32(77);
    for (let i = 0; i < 900; i++) {
      const x = rnd() * W, y = rnd() * H, l = 6 + rnd() * 22, a = rnd() * TAU;
      g.strokeStyle = rnd() < 0.5 ? 'rgba(120,100,80,0.10)' : 'rgba(255,255,255,0.35)';
      g.lineWidth = 0.6 + rnd() * 0.8;
      g.globalAlpha = 1;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.6, y + Math.sin(a + 0.6) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l);
      g.stroke();
    }
    return addGrainTo(c, 9, 5);
  },

  // Sarja escura (algodão preto) — ladrilho 256².
  twill() {
    return pixels(256, 256, (d, i, x, y) => {
      const tw = Math.sin((TAU * (x + y)) / 8) * 5;
      const th = (hash(y * 3 + 1) - 0.5) * 5 + (hash(x * 7 + 5) - 0.5) * 3;
      const v = 23 + tw + th + (hash2(x, y) - 0.5) * 8;
      d[i] = v; d[i + 1] = v; d[i + 2] = v + 1.5; d[i + 3] = 255;
    });
  },

  // Jeans — ladrilho 256².
  denim() {
    return pixels(256, 256, (d, i, x, y) => {
      const tw = Math.sin((TAU * (x - y)) / 8);
      const weft = hash2(x * 3, y * 5) < 0.3 ? 1 : 0;
      const slub = (hash(x + 11) - 0.5) * 16 + (hash(y * 13) - 0.5) * 6;
      const n = (hash2(x, y) - 0.5) * 14;
      const w = weft * 38 * (0.5 + 0.5 * tw);
      d[i] = 40 + w + slub * 0.6 + n + tw * 6;
      d[i + 1] = 64 + w + slub * 0.8 + n + tw * 8;
      d[i + 2] = 108 + w * 0.9 + slub + n + tw * 10;
      d[i + 3] = 255;
    });
  },

  // Aço escovado: riscos horizontais (gerado estreito e esticado na horizontal).
  metal() {
    const sw = 270;
    const small = pixels(sw, H, (d, i, x, y) => {
      const streak = fbm2(x * 0.02, y * 0.9, 3, 21) * 0.7 + hash(y * 17) * 0.3;
      const v = 150 + (streak - 0.5) * 70 + (hash2(x, y) - 0.5) * 10;
      d[i] = v; d[i + 1] = v + 3; d[i + 2] = v + 7; d[i + 3] = 255;
    });
    const c = makeCanvas(W, H), g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(small, 0, 0, W, H);
    return addGrainTo(c, 6, 9);
  },

  // Parede de tijolos escura para o neon (com margem para o zoom).
  bricks() {
    const w = W + 240, h = H + 240;
    const c = makeCanvas(w, h), g = c.getContext('2d');
    g.fillStyle = '#141011';
    g.fillRect(0, 0, w, h);
    const bw = 190, bh = 66, m = 9;
    const rnd = mulberry32(31);
    for (let row = 0, y = 0; y < h; row++, y += bh) {
      const off = row % 2 ? -bw / 2 : 0;
      for (let x = off; x < w; x += bw) {
        const k = rnd();
        const r = 44 + k * 26, gg = 28 + k * 14, b = 26 + k * 10;
        g.fillStyle = `rgb(${r},${gg},${b})`;
        g.fillRect(x + m / 2, y + m / 2, bw - m, bh - m);
        const gr = g.createLinearGradient(0, y, 0, y + bh);
        gr.addColorStop(0, 'rgba(255,255,255,0.06)');
        gr.addColorStop(1, 'rgba(0,0,0,0.25)');
        g.fillStyle = gr;
        g.fillRect(x + m / 2, y + m / 2, bw - m, bh - m);
      }
    }
    g.globalCompositeOperation = 'multiply';
    g.drawImage(softNoise(w, h, 10, 8, 120, 255), 0, 0);
    g.globalCompositeOperation = 'source-over';
    return addGrainTo(c, 22, 13);
  },

  // Máscara de falhas para o carimbo (alpha = onde a tinta falhou).
  grunge() {
    const w = W / 2, h = H / 2;
    const blot = softNoise(w, h, 6, 44, 0, 255);
    const bd = blot.getContext('2d').getImageData(0, 0, w, h).data;
    return pixels(w, h, (d, i, x, y) => {
      const b = bd[i] / 255;
      const speck = hash2(x, y) > (b > 0.66 ? 0.86 : 0.975) ? 1 : 0;
      d[i] = d[i + 1] = d[i + 2] = 0;
      d[i + 3] = Math.max(speck * 220, b > 0.78 ? 90 : 0);
    });
  },

  // Tampa de notebook (alumínio jateado escuro) — ladrilho de ruído fino.
  alu() {
    const rnd = mulberry32(55);
    return pixels(256, 256, (d, i) => {
      const v = 128 + (rnd() - 0.5) * 40;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    });
  },
};

const patternCache = new WeakMap();
function pattern(ctx, name, index = 0) {
  let m = patternCache.get(ctx);
  if (!m) { m = {}; patternCache.set(ctx, m); }
  const key = name + index;
  if (!m[key]) {
    const t = tex(name);
    m[key] = ctx.createPattern(Array.isArray(t) ? t[index] : t, 'repeat');
  }
  return m[key];
}

/* ---------- acabamento: grão e vinheta ---------- */
function drawGrain(ctx, frame, amount = 0.06) {
  const n = 6, i = frame % n;
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = amount;
  ctx.translate(-hash(frame * 3 + 1) * 256, -hash(frame * 7 + 2) * 256);
  ctx.fillStyle = pattern(ctx, 'grain', i);
  ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
}

function drawVignette(ctx, strength = 0.35) {
  if (strength <= 0) return;
  const g = ctx.createRadialGradient(CX, CY, H * 0.28, CX, CY, H * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}
