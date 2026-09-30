'use strict';
/* =====================================================================
   Cenas B — mockups: celular (ícone do app e perfil), cartões de
   visita, camiseta, outdoor e embalagem.
   ===================================================================== */

/* ---------- celular (usado em "app" e "perfil") ---------- */
const PHONE = { w: 740, h: 1540, r: 118, depth: 34, bezel: 26, sr: 94 };
let screenCanvas = null;
const SCREEN = () => screenCanvas || (screenCanvas = makeCanvas(PHONE.w - 2 * PHONE.bezel, PHONE.h - 2 * PHONE.bezel));

function drawPhone(ctx, obj, screen) {
  const P = PHONE, hw = P.w / 2, hh = P.h / 2;
  const body = rrectPts(-hw, -hh, P.w, P.h, P.r, 12);
  shadowOnly(ctx, polyPath(obj.pts(body)), 'rgba(0,0,0,0.5)', 80, 40, 70);
  const F = drawSlab(ctx, obj, body, P.depth, '#0E0E10', '#8C8E95');
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.stroke(polyPath(F));
  ctx.restore();
  const sw = P.w - 2 * P.bezel, sh = P.h - 2 * P.bezel;
  const sp = polyPath(obj.pts(rrectPts(-sw / 2, -sh / 2, sw, sh, P.sr, 12)));
  ctx.save();
  ctx.clip(sp);
  drawMapped(ctx, screen, (u, v) => obj.P(-sw / 2 + u * sw, -sh / 2 + v * sh), 6, 12);
  ctx.fillStyle = '#030303';
  ctx.fill(polyPath(obj.pts(rrectPts(-96, -sh / 2 + 24, 192, 56, 28, 6))));
  const a = obj.P(-sw / 2, -sh / 2), b = obj.P(sw / 2, sh / 2);
  const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
  g.addColorStop(0, 'rgba(255,255,255,0.13)');
  g.addColorStop(0.42, 'rgba(255,255,255,0.03)');
  g.addColorStop(0.421, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fill(sp);
  ctx.restore();
}

function statusBar(g, w, color = '#FFFFFF') {
  text(g, '9:41', 64, 76, { family: FONT_DISPLAY, size: 27, weight: 700, color });
  g.fillStyle = color;
  for (let i = 0; i < 4; i++) g.fillRect(w - 190 + i * 11, 70 - 6 - i * 4, 7, 8 + i * 4);
  g.strokeStyle = color;
  g.lineWidth = 3;
  g.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    g.beginPath();
    g.arc(w - 124, 72, 6 + i * 7, -Math.PI * 0.75, -Math.PI * 0.25);
    g.stroke();
  }
  g.strokeStyle = rgba('#FFFFFF', 0.5);
  g.lineWidth = 2;
  g.strokeRect(w - 96, 58, 40, 19);
  g.fillRect(w - 93, 61, 30, 13);
  g.fillRect(w - 54, 64, 3, 7);
}

/* ---------- 9 · Ícone do app ---------- */
const HOME_LABELS = ['Agenda', 'Fotos', 'Câmera', 'Mapas', 'Clima', 'Relógio', 'Notas', 'Música', 'Livros', null,
  'Saúde', 'Casa', 'Carteira', 'Podcasts', 'Arquivos', 'Ajustes', 'Loja', 'Bolsa', 'Tradutor', 'Contatos'];
const ICON_TONES = ['#2E2E34', '#3A3A42', '#26262C', '#44444D', '#33333A', '#2A2A31'];

function appGlyph(g, kind, x, y, s) {
  g.save();
  g.translate(x + s / 2, y + s / 2);
  g.fillStyle = 'rgba(255,255,255,0.28)';
  g.strokeStyle = 'rgba(255,255,255,0.28)';
  g.lineWidth = s * 0.07;
  const r = s * 0.22;
  switch (kind % 6) {
    case 0: g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); break;
    case 1: g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke(); break;
    case 2: g.fillRect(-r, -r, r * 2, r * 2); break;
    case 3: for (let i = 0; i < 3; i++) g.fillRect(-r + i * r * 0.8, r - (i + 1) * r * 0.6, r * 0.5, (i + 1) * r * 0.6); break;
    case 4: g.beginPath(); g.moveTo(-r, r); g.lineTo(0, -r); g.lineTo(r, r); g.closePath(); g.fill(); break;
    default: g.fillRect(-r, -g.lineWidth / 2, r * 2, g.lineWidth); g.fillRect(-g.lineWidth / 2, -r, g.lineWidth, r * 2);
  }
  g.restore();
}

function drawHome(g, t) {
  const w = g.canvas.width, h = g.canvas.height;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const launch = E.inOutCubic(range(t, 0.9, 1.35));

  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#1C1B21');
  bg.addColorStop(1, '#0B0B0C');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  const blob = (x, y, r, c, a) => {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, rgba(c, a));
    rg.addColorStop(1, rgba(c, 0));
    g.fillStyle = rg;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  };
  blob(90, h * 0.8, 560, COL.pink, 0.42);
  blob(w * 0.9, h * 0.16, 420, COL.cream, 0.1);

  const is = 118, gap = (w - 104 - 4 * is) / 3;
  const pos = i => [52 + (i % 4) * (is + gap), 150 + Math.floor(i / 4) * 188];
  const [ix, iy] = pos(9);
  const icx = ix + is / 2, icy = iy + is / 2;

  g.save();
  g.globalAlpha = 1 - launch;
  g.translate(icx, icy);
  g.scale(1 + 0.16 * launch, 1 + 0.16 * launch);
  g.translate(-icx, -icy);
  statusBar(g, w);
  HOME_LABELS.forEach((lab, i) => {
    if (!lab) return;
    const [x, y] = pos(i);
    fillRR(g, x, y, is, is, 28, ICON_TONES[(i * 5) % ICON_TONES.length]);
    appGlyph(g, i * 7 + 3, x, y, is);
    text(g, lab, x + is / 2, y + is + 32, { size: 16, weight: 400, color: '#D6D6DB', align: 'center' });
  });
  text(g, BRAND.name, icx, iy + is + 32, { size: 16, weight: 400, color: '#FFFFFF', align: 'center' });
  [0, 1, 2].forEach(i => {
    g.fillStyle = i === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.35)';
    g.beginPath();
    g.arc(w / 2 - 22 + i * 22, 1262, 6, 0, TAU);
    g.fill();
  });
  fillRR(g, 26, 1300, w - 52, 160, 58, 'rgba(255,255,255,0.11)');
  const dg = (w - 52 - 4 * is) / 5;
  for (let i = 0; i < 4; i++) {
    const x = 26 + dg + i * (is + dg);
    fillRR(g, x, 1321, is, is, 28, ICON_TONES[(i * 3 + 1) % ICON_TONES.length]);
    appGlyph(g, i * 5 + 1, x, 1321, is);
  }
  g.restore();

  // Nosso ícone: selo de notificação, toque e abertura do app.
  const press = t > 0.8 && t < 1.02 ? 1 - 0.1 * Math.sin(range(t, 0.8, 1.02) * Math.PI) : 1;
  const x = lerp(ix, 0, launch), y = lerp(iy, 0, launch);
  const ww = lerp(is, w, launch), hh = lerp(is, h, launch);
  g.save();
  g.translate(x + ww / 2, y + hh / 2);
  g.scale(press, press);
  g.translate(-(x + ww / 2), -(y + hh / 2));
  if (launch < 1) {
    g.shadowColor = 'rgba(255,58,111,0.55)';
    g.shadowBlur = 40 * (1 - launch) * range(t, 0.3, 0.8);
  }
  fillRR(g, x, y, ww, hh, lerp(28, 90, launch), COL.ink);
  g.shadowColor = 'transparent';
  if (launch < 0.4) {
    g.strokeStyle = rgba(COL.cream, 0.14 * (1 - launch / 0.4));
    g.lineWidth = 2;
    g.stroke(rrectPath(x + 1, y + 1, ww - 2, hh - 2, lerp(28, 90, launch)));
  }
  drawLogo(g, x + ww / 2, y + hh / 2 - 44 * launch, lerp(74, 300, launch));
  g.restore();

  const badge = spring(t - 0.3, 20, 9) * (1 - launch);
  if (badge > 0) {
    g.save();
    g.translate(ix + is - 6, iy + 6);
    g.scale(badge, badge);
    g.fillStyle = COL.pink;
    g.beginPath();
    g.arc(0, 0, 22, 0, TAU);
    g.fill();
    text(g, '1', 0, 8, { family: FONT_DISPLAY, size: 22, weight: 700, color: '#FFFFFF', align: 'center' });
    g.restore();
  }
  if (t > 0.8 && t < 1.3) {
    const k = range(t, 0.8, 1.3);
    g.strokeStyle = `rgba(255,255,255,${0.7 * (1 - k)})`;
    g.lineWidth = 6;
    g.beginPath();
    g.arc(icx, icy, 40 + 160 * E.outCubic(k), 0, TAU);
    g.stroke();
  }
  if (launch >= 1) {
    const p = range(t, 1.4, 1.95);
    fillRR(g, w / 2 - 110, 1000, 220, 8, 4, 'rgba(254,247,237,0.18)');
    fillRR(g, w / 2 - 110, 1000, 220 * E.inOutCubic(p), 8, 4, COL.pink);
    statusBar(g, w);
  }
}

function sceneApp(ctx, t, d) {
  const bg = ctx.createRadialGradient(CX, 820, 80, CX, CY, 1300);
  bg.addColorStop(0, '#FF5B87');
  bg.addColorStop(1, '#DF2458');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  for (let y = 36; y < H; y += 48) {
    for (let x = 36; x < W; x += 48) {
      ctx.beginPath();
      ctx.arc(x, y, 2.3, 0, TAU);
      ctx.fill();
    }
  }
  const k = E.outCubic(range(t, 0, d));
  const obj = Obj(Cam(2600), {
    x: 0, y: 50, z: lerp(260, 60, k),
    rx: lerp(0.16, 0.07, k), ry: lerp(-0.42, -0.2, k), rz: lerp(0.06, 0.015, k),
  });
  const scr = SCREEN();
  drawHome(scr.getContext('2d'), t);
  drawPhone(ctx, obj, scr);
}

/* ---------- 10 · Cartões de visita ---------- */
const CARD = { w: 880, h: 540, r: 20, depth: 7 };
let cardFaceCanvas = null;

function cardFaceLight() {
  if (cardFaceCanvas) return cardFaceCanvas;
  const c = (cardFaceCanvas = makeCanvas(CARD.w, CARD.h)), g = c.getContext('2d');
  g.fillStyle = '#F5EFE5';
  g.fillRect(0, 0, c.width, c.height);
  g.globalAlpha = 0.5;
  g.drawImage(tex('paper'), 0, 0, c.width * 1.5, c.height * 1.5);
  g.globalAlpha = 1;
  drawLogo(g, 118, 150, 150, COL.ink, COL.pink);
  text(g, BRAND.name, 400, 330, { family: FONT_DISPLAY, size: 40, weight: 700, color: COL.ink });
  text(g, 'Identidade visual', 400, 374, { size: 19, weight: 400, color: '#6F685F' });
  text(g, BRAND.handle, 400, 440, { size: 19, weight: 400, color: COL.ink });
  text(g, '(00) 00000-0000', 400, 472, { size: 19, weight: 400, color: COL.ink });
  fillRR(g, 360, 309, 20, 20, 6, COL.pink);
  return c;
}

function drawCard(ctx, obj, frontHex, backHex, drawFront, drawBack) {
  const { w, h, r, depth } = CARD;
  const outline = rrectPts(-w / 2, -h / 2, w, h, r, 6);
  const front = obj.facing(0);
  const nearW = front ? 0 : depth, farW = front ? depth : 0;
  const N = obj.pts(outline, nearW), Fr = obj.pts(outline, farW);
  const np = polyPath(N);
  shadowOnly(ctx, np, 'rgba(70,50,30,0.38)', 60, 40, 70);
  const edge = shade(front ? frontHex : backHex, 0.55);
  ctx.fillStyle = edge;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1 / K;
  ctx.fill(polyPath(Fr));
  for (let i = 0; i < N.length; i++) {
    const j = (i + 1) % N.length;
    const q = polyPath([N[i], N[j], Fr[j], Fr[i]]);
    ctx.fill(q);
    ctx.stroke(q);
  }
  const lit = lambert(obj.dir(0, 0, front ? -1 : 1), 0.5);
  ctx.fillStyle = shade(front ? frontHex : backHex, 0.8 + 0.28 * lit);
  ctx.fill(np);
  ctx.save();
  ctx.clip(np);
  (front ? drawFront : drawBack)(nearW);
  const a = N[0], b = N[Math.floor(N.length / 2)];
  const sh = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
  sh.addColorStop(0, 'rgba(255,255,255,0.10)');
  sh.addColorStop(1, 'rgba(0,0,0,0.10)');
  ctx.fillStyle = sh;
  ctx.fill(np);
  ctx.restore();
}

function sceneCards(ctx, t, d) {
  ctx.fillStyle = '#E4DDD1';
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.55;
  ctx.drawImage(tex('paper'), 0, 0);
  ctx.globalAlpha = 1;
  const lg = ctx.createRadialGradient(300, 300, 50, CX, CY, 1500);
  lg.addColorStop(0, 'rgba(255,255,255,0.35)');
  lg.addColorStop(1, 'rgba(90,60,30,0.18)');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, W, H);

  const cam = Cam(2400);
  const cw = CARD.w, chh = CARD.h;
  const B = Obj(cam, { x: 70, y: 420 + Math.sin(t * 2.2) * 8, z: 80, rx: 0.3, ry: 0.26, rz: 0.2 });
  const face = cardFaceLight();
  drawCard(ctx, B, '#F5EFE5', '#F5EFE5',
    w => drawMapped(ctx, face, (u, v) => B.P(-cw / 2 + u * cw, -chh / 2 + v * chh, w), 6, 4),
    () => {});

  const k = E.inOutCubic(range(t, 0.45, 1.35));
  const A = Obj(cam, { x: -40, y: -300 - Math.sin(t * 2) * 10, z: -20, rx: 0.28, ry: lerp(-0.4, Math.PI - 0.35, k), rz: -0.16 });
  const vec = (pts, w, mirror = false) => polyPath(pts.map(([u, v]) => A.P(mirror ? -u : u, v, w)));
  drawCard(ctx, A, '#131315', COL.pink,
    w => {
      ctx.fillStyle = COL.cream;
      ctx.fill(vec(logoPts('glyph', 0, 0, 290), w));
      ctx.fillStyle = COL.pink;
      ctx.fill(vec(logoPts('dot', 0, 0, 290), w));
    },
    w => {
      ctx.fillStyle = COL.cream;
      ctx.fill(vec(logoPts('glyph', -60, 230, 1150), w, true));
      ctx.fillStyle = COL.ink;
      ctx.fill(vec(logoPts('dot', 330, 150, 150).map(([u, v]) => [u, v]), w, true));
    });
}

/* ---------- 11 · Camiseta ---------- */
const TEE = (() => {
  const p = new Path2D();
  p.moveTo(-120, 0);
  p.bezierCurveTo(-80, 70, 80, 70, 120, 0);
  p.bezierCurveTo(190, 18, 250, 30, 305, 48);
  p.lineTo(488, 210);
  p.bezierCurveTo(470, 270, 440, 330, 410, 372);
  p.lineTo(330, 318);
  p.bezierCurveTo(338, 560, 336, 800, 344, 1030);
  p.bezierCurveTo(120, 1052, -120, 1052, -344, 1030);
  p.bezierCurveTo(-336, 800, -338, 560, -330, 318);
  p.lineTo(-410, 372);
  p.bezierCurveTo(-440, 330, -470, 270, -488, 210);
  p.lineTo(-305, 48);
  p.bezierCurveTo(-250, 30, -190, 18, -120, 0);
  p.closePath();
  return p;
})();

function softStroke(ctx, draw, color, widths = [80, 50, 26], a = 0.035) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  for (const w of widths) {
    ctx.globalAlpha = a;
    ctx.lineWidth = w;
    ctx.beginPath();
    draw();
    ctx.stroke();
  }
  ctx.restore();
}

function sceneShirt(ctx, t, d) {
  const bg = ctx.createRadialGradient(CX, 700, 100, CX, CY, 1400);
  bg.addColorStop(0, '#FF5282');
  bg.addColorStop(1, '#D92153');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const kz = E.outExpo(range(t, 1.0, 1.3));
  const drift = range(t, 0, d);
  const z = lerp(1 + 0.05 * drift, 2.25 + 0.1 * drift, kz);
  const F = [CX, lerp(880, 690, kz)], T = [CX, lerp(880, 930, kz)];
  ctx.save();
  ctx.translate(T[0], T[1]);
  ctx.scale(z, z);
  ctx.translate(-F[0], -F[1]);

  ctx.save();
  ctx.translate(CX, 360);
  shadowOnly(ctx, TEE, 'rgba(110,8,40,0.55)', 50 * z, 0, 26 * z);
  ctx.save();
  ctx.clip(TEE);
  ctx.fillStyle = '#19191C';
  ctx.fillRect(-520, -20, 1040, 1100);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = pattern(ctx, 'twill');
  ctx.fillRect(-520, -20, 1040, 1100);
  ctx.globalAlpha = 1;
  const sg = ctx.createLinearGradient(-500, 0, 500, 0);
  sg.addColorStop(0, 'rgba(0,0,0,0.45)');
  sg.addColorStop(0.3, 'rgba(255,255,255,0.03)');
  sg.addColorStop(0.55, 'rgba(255,255,255,0.05)');
  sg.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = sg;
  ctx.fillRect(-520, -20, 1040, 1100);
  const light = ctx.createRadialGradient(-220, 200, 40, -100, 400, 900);
  light.addColorStop(0, 'rgba(255,255,255,0.07)');
  light.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = light;
  ctx.fillRect(-520, -20, 1040, 1100);
  softStroke(ctx, () => { ctx.moveTo(-250, 140); ctx.bezierCurveTo(-210, 320, -250, 600, -215, 960); }, '#FFFFFF', [150, 100, 60], 0.018);
  softStroke(ctx, () => { ctx.moveTo(235, 180); ctx.bezierCurveTo(200, 420, 250, 700, 225, 970); }, '#FFFFFF', [150, 100, 60], 0.014);
  softStroke(ctx, () => { ctx.moveTo(-310, 340); ctx.bezierCurveTo(-250, 390, -265, 470, -305, 530); }, '#000000', [90, 50], 0.07);
  softStroke(ctx, () => { ctx.moveTo(310, 340); ctx.bezierCurveTo(255, 400, 272, 480, 305, 550); }, '#000000', [90, 50], 0.07);
  // Estampa: logo com textura do tecido por cima.
  ctx.save();
  logoSpace(ctx, 0, 330, 300);
  ctx.fillStyle = '#F6EEE2';
  ctx.fill(LogoShape.glyph);
  ctx.fillStyle = COL.pink;
  ctx.fill(LogoShape.dot);
  ctx.clip(LogoShape.both);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = pattern(ctx, 'twill');
  ctx.fillRect(-100, -100, 700, 900);
  ctx.restore();
  ctx.restore();

  // Gola, costuras e barra.
  const inner = new Path2D();
  inner.moveTo(-120, 0);
  inner.bezierCurveTo(-80, 70, 80, 70, 120, 0);
  inner.bezierCurveTo(80, 18, -80, 18, -120, 0);
  ctx.fillStyle = '#0B0B0C';
  ctx.fill(inner);
  ctx.strokeStyle = '#232327';
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.moveTo(-126, -2);
  ctx.bezierCurveTo(-84, 76, 84, 76, 126, -2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([7, 7]);
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-340, 990);
  ctx.bezierCurveTo(-120, 1010, 120, 1010, 340, 990);
  ctx.moveTo(470, 262);
  ctx.bezierCurveTo(455, 300, 430, 335, 402, 360);
  ctx.moveTo(-470, 262);
  ctx.bezierCurveTo(-455, 300, -430, 335, -402, 360);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  ctx.restore();
}

/* ---------- 12 · Outdoor ---------- */
function cityLayer(seed, o) {
  const w = W + 700, h = 1300;
  const c = makeCanvas(w, h), g = c.getContext('2d');
  const rnd = mulberry32(seed);
  let x = 0;
  while (x < w) {
    const bw = o.minW + rnd() * (o.maxW - o.minW), bh = o.minH + rnd() * (o.maxH - o.minH);
    const top = h - bh;
    if (o.skip && x > o.skip[0] && x < o.skip[1]) { x += bw; continue; }
    g.fillStyle = o.color;
    g.fillRect(x, top, bw + 1, bh);
    if (rnd() < 0.35) g.fillRect(x + bw * 0.2, top - 26, bw * 0.45, 27);
    if (rnd() < 0.3) g.fillRect(x + bw * 0.55, top - 90 - rnd() * 60, 4, 120);
    for (let wy = top + 20; wy < h - 12; wy += 30) {
      for (let wx = x + 12; wx < x + bw - 16; wx += 22) {
        if (rnd() < o.win) {
          g.fillStyle = rnd() < 0.8 ? `rgba(255,206,140,${o.winA * (0.45 + rnd() * 0.55)})` : `rgba(160,200,255,${o.winA * (0.45 + rnd() * 0.55)})`;
          g.fillRect(wx, wy, 9, 13);
        }
      }
    }
    x += bw + rnd() * 10;
  }
  return c;
}
TEX_GEN.cityFar = () => cityLayer(11, { minW: 70, maxW: 170, minH: 220, maxH: 560, color: '#241A30', win: 0.22, winA: 0.3 });
TEX_GEN.cityMid = () => cityLayer(23, { minW: 110, maxW: 240, minH: 300, maxH: 760, color: '#150F1D', win: 0.28, winA: 0.6 });
TEX_GEN.cityNear = () => cityLayer(37, { minW: 200, maxW: 330, minH: 850, maxH: 1250, color: '#08070B', win: 0.12, winA: 0.8, skip: [520, 1280] });

let boardCanvas = null;
function boardContent() {
  if (boardCanvas) return boardCanvas;
  const c = (boardCanvas = makeCanvas(1300, 680)), g = c.getContext('2d');
  g.fillStyle = COL.pink;
  g.fillRect(0, 0, c.width, c.height);
  const lines = BRAND.tagline ? BRAND.tagline.split(' ') : [];
  if (lines.length) {
    drawLogo(g, 300, 340, 500, COL.cream, COL.ink);
    const half = Math.ceil(lines.length / 2);
    const l1 = lines.slice(0, half).join(' '), l2 = lines.slice(half).join(' ');
    let size = 118;
    g.font = `700 ${size}px "${FONT_DISPLAY}"`;
    const wmax = Math.max(g.measureText(l1).width, g.measureText(l2).width);
    if (wmax > 660) size *= 660 / wmax;
    text(g, l1, 570, 330, { family: FONT_DISPLAY, size, weight: 700, color: COL.ink });
    text(g, l2, 570, 330 + size * 1.12, { family: FONT_DISPLAY, size, weight: 700, color: COL.ink });
  } else {
    drawLogo(g, 650, 340, 520, COL.cream, COL.ink);
  }
  text(g, BRAND.handle, 1240, 80, { size: 24, weight: 600, color: COL.ink, align: 'right', alpha: 0.75 });
  return c;
}

function sceneBillboard(ctx, t, d) {
  const k = E.inOutQuad(range(t, 0, d));
  const camX = lerp(-90, 90, k), camY = lerp(30, -30, k);

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#06060C');
  sky.addColorStop(0.5, '#171027');
  sky.addColorStop(0.7, '#3A1532');
  sky.addColorStop(1, '#14090F');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 80; i++) {
    const x = hash(i * 3 + 1) * W, y = hash(i * 5 + 2) * H * 0.45;
    ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * hash(i * 7) * (0.6 + 0.4 * Math.sin(t * 4 + i))})`;
    ctx.fillRect(x - camX * 0.05, y, 2, 2);
  }
  const haze = ctx.createRadialGradient(CX, 1250, 50, CX, 1250, 900);
  haze.addColorStop(0, 'rgba(255,58,111,0.28)');
  haze.addColorStop(1, 'rgba(255,58,111,0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(tex('cityFar'), -350 - camX * 0.25, H - 1300 + 120);
  ctx.drawImage(tex('cityMid'), -350 - camX * 0.5, H - 1300 + 260);

  const cam = Cam(2000, camX, camY);
  const bw = 1300, bh = 680;
  const B = Obj(cam, { x: 40, y: -230, z: 700, rx: 0.04, ry: -0.5 });
  // Poste e passarela.
  const pole = [[-45, bh / 2 + 40], [45, bh / 2 + 40], [45, 2600], [-45, 2600]];
  drawSlab(ctx, B, pole, 90, '#1D1C22', '#34333B');
  ctx.strokeStyle = '#26252C';
  ctx.lineWidth = 10;
  [[-bw / 2 + 80, 1], [bw / 2 - 80, -1]].forEach(([u, s]) => {
    const a = B.P(u, bh / 2, 40), b2 = B.P(s * 40, bh / 2 + 420, 40);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
  });
  drawSlab(ctx, B, rrectPts(-bw / 2 - 26, -bh / 2 - 26, bw + 52, bh + 52, 6, 2), 40, '#141418', '#3B3A42');
  const on = t < 0.1 ? 0.15 : t < 0.14 ? 0.8 : t < 0.17 ? 0.3 : 1;
  const face = polyPath(B.pts(rrectPts(-bw / 2, -bh / 2, bw, bh, 2, 1)));
  ctx.save();
  ctx.clip(face);
  drawMapped(ctx, boardContent(), (u, v) => B.P(-bw / 2 + u * bw, -bh / 2 + v * bh), 10, 6);
  ctx.globalCompositeOperation = 'multiply';
  const dim = B.P(0, bh / 2), top = B.P(0, -bh / 2);
  const lg = ctx.createLinearGradient(top[0], top[1], dim[0], dim[1]);
  lg.addColorStop(0, 'rgba(255,255,255,1)');
  lg.addColorStop(1, 'rgba(120,110,120,1)');
  ctx.fillStyle = lg;
  ctx.fill(face);
  ctx.globalCompositeOperation = 'source-over';
  if (on < 1) {
    ctx.fillStyle = `rgba(8,6,10,${0.85 * (1 - on)})`;
    ctx.fill(face);
  }
  ctx.restore();
  // Passarela com guarda-corpo e luminárias.
  const walk = [[-bw / 2 - 10, 0], [bw / 2 + 10, 0], [bw / 2 + 10, -130], [-bw / 2 - 10, -130]].map(([u, w]) => B.P(u, bh / 2 + 48, w));
  ctx.fillStyle = '#23222A';
  ctx.fill(polyPath(walk));
  ctx.strokeStyle = '#2E2D35';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let u = -bw / 2; u <= bw / 2; u += 130) {
    const a = B.P(u, bh / 2 + 48, -130), b2 = B.P(u, bh / 2 - 22, -130);
    ctx.moveTo(a[0], a[1]); ctx.lineTo(b2[0], b2[1]);
  }
  const r0 = B.P(-bw / 2, bh / 2 - 22, -130), r1 = B.P(bw / 2, bh / 2 - 22, -130);
  ctx.moveTo(r0[0], r0[1]); ctx.lineTo(r1[0], r1[1]);
  ctx.stroke();
  [-0.33, 0, 0.33].forEach(f => {
    const u = f * bw;
    const a = B.P(u, -bh / 2 - 26, 0), b2 = B.P(u, -bh / 2 - 120, -170);
    ctx.strokeStyle = '#2B2A31';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke();
    ctx.fillStyle = '#3A3942';
    ctx.fill(polyPath([B.P(u - 40, -bh / 2 - 130, -190), B.P(u + 40, -bh / 2 - 130, -190), B.P(u + 34, -bh / 2 - 108, -150), B.P(u - 34, -bh / 2 - 108, -150)]));
    if (on >= 1) {
      ctx.save();
      ctx.clip(face);
      ctx.globalCompositeOperation = 'screen';
      const c = B.P(u, -bh / 2 + 60, 0);
      const rg = ctx.createRadialGradient(c[0], c[1], 10, c[0], c[1], 420);
      rg.addColorStop(0, 'rgba(255,245,225,0.4)');
      rg.addColorStop(1, 'rgba(255,245,225,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(c[0] - 420, c[1] - 420, 840, 840);
      ctx.restore();
      const lamp = B.P(u, -bh / 2 - 112, -160);
      const lg2 = ctx.createRadialGradient(lamp[0], lamp[1], 0, lamp[0], lamp[1], 60);
      lg2.addColorStop(0, 'rgba(255,250,235,0.95)');
      lg2.addColorStop(1, 'rgba(255,250,235,0)');
      ctx.fillStyle = lg2;
      ctx.fillRect(lamp[0] - 60, lamp[1] - 60, 120, 120);
    }
  });
  if (on >= 1) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const c = B.P(0, 0);
    const glow = ctx.createRadialGradient(c[0], c[1], 200, c[0], c[1], 1000);
    glow.addColorStop(0, 'rgba(255,58,111,0.22)');
    glow.addColorStop(1, 'rgba(255,58,111,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  ctx.drawImage(tex('cityNear'), -350 - camX * 0.9, H - 1300 + 420);
}

/* ---------- 13 · Embalagem: sacola + copo ---------- */
function drawBag(ctx) {
  const x0 = 150, x1 = 690, y0 = 560, y1 = 1360, gw = 120, gr = 32;
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(400, 548);
  ctx.bezierCurveTo(400, 400, 590, 400, 590, 540);
  ctx.stroke();
  const shadow = polyPath([[x1, y1], [x1 + gw, y1 - 24], [x1 + gw + 330, y1 + 70], [x0 + 250, y1 + 90]]);
  shadowOnly(ctx, shadow, 'rgba(90,60,30,0.35)', 60, 0, 0);
  const inside = polyPath([[x0, y0], [x1, y0], [x1 + gw, y0 - gr], [x0 + 110, y0 - gr]]);
  ctx.fillStyle = '#7E1233';
  ctx.fill(inside);
  const side = polyPath([[x1, y0], [x1 + gw, y0 - gr], [x1 + gw, y1 - 24], [x1, y1]]);
  const sg = ctx.createLinearGradient(x1, 0, x1 + gw, 0);
  sg.addColorStop(0, '#B81B4A');
  sg.addColorStop(0.5, '#D42A5B');
  sg.addColorStop(0.51, '#A8163F');
  sg.addColorStop(1, '#C0204E');
  ctx.fillStyle = sg;
  ctx.fill(side);
  const front = rrectPath(x0, y0, x1 - x0, y1 - y0, 3);
  const fg = ctx.createLinearGradient(x0, y0, x1, y1);
  fg.addColorStop(0, '#FF4D7E');
  fg.addColorStop(1, '#E52D60');
  ctx.fillStyle = fg;
  ctx.fill(front);
  ctx.save();
  ctx.clip(front);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.25;
  ctx.drawImage(tex('paper'), 0, 0);
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(x0, y0, x1 - x0, 64);
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.fillRect(x0, y0 + 64, x1 - x0, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(x0, y1 - 90, x1 - x0, 90);
  drawLogo(ctx, (x0 + x1) / 2, 990, 330, COL.cream, COL.ink);
  ctx.fillStyle = '#5C0E26';
  [[330, 606], [510, 606]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); });
  ctx.strokeStyle = '#141414';
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(330, 606);
  ctx.bezierCurveTo(330, 420, 510, 420, 510, 606);
  ctx.stroke();
}

function drawCup(ctx, t) {
  const cx = 790, yT = 1000, yB = 1530, rT = 165, rB = 124, e = 0.16;
  const R = y => lerp(rT, rB, (y - yT) / (yB - yT));
  shadowOnly(ctx, polyPath(ellipsePts(cx + 60, yB + 6, rB * 1.5, rB * e * 2.2)), 'rgba(80,55,30,0.45)', 40, 0, 0);
  const body = new Path2D();
  body.moveTo(cx - rT, yT);
  body.lineTo(cx - rB, yB);
  body.ellipse(cx, yB, rB, rB * e, 0, Math.PI, 0, true);
  body.lineTo(cx + rT, yT);
  body.ellipse(cx, yT, rT, rT * e, 0, 0, Math.PI, false);
  body.closePath();
  const g = ctx.createLinearGradient(cx - rT, 0, cx + rT, 0);
  g.addColorStop(0, '#DCD3C5');
  g.addColorStop(0.22, '#FFFFFF');
  g.addColorStop(0.6, '#EFE8DD');
  g.addColorStop(1, '#AFA597');
  ctx.fillStyle = g;
  ctx.fill(body);
  // Logo envolvendo o cilindro.
  const ly = 1290, lh = 220, Rm = R(ly);
  const wrap = pts => polyPath(pts.map(([x, y]) => {
    const r = R(y), th = (x - cx) / Rm;
    return [cx + r * Math.sin(th), y + e * r * Math.cos(th) - e * Rm];
  }));
  ctx.save();
  ctx.clip(body);
  ctx.fillStyle = COL.ink;
  ctx.fill(wrap(logoPts('glyph', cx, ly, lh)));
  ctx.fillStyle = COL.pink;
  ctx.fill(wrap(logoPts('dot', cx, ly, lh)));
  const shadeG = ctx.createLinearGradient(cx - rT, 0, cx + rT, 0);
  shadeG.addColorStop(0, 'rgba(0,0,0,0.10)');
  shadeG.addColorStop(0.25, 'rgba(255,255,255,0.12)');
  shadeG.addColorStop(0.7, 'rgba(0,0,0,0)');
  shadeG.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = shadeG;
  ctx.fillRect(cx - rT, yT - 40, rT * 2, yB - yT + 80);
  ctx.restore();
  // Tampa.
  const rl = rT + 12, lt = yT - 26;
  const rim = new Path2D();
  rim.moveTo(cx - rl, lt);
  rim.lineTo(cx - rl, yT + 6);
  rim.ellipse(cx, yT + 6, rl, rl * e, 0, Math.PI, 0, true);
  rim.lineTo(cx + rl, lt);
  rim.closePath();
  const lg = ctx.createLinearGradient(cx - rl, 0, cx + rl, 0);
  lg.addColorStop(0, '#2A2A2C');
  lg.addColorStop(0.25, '#4A4A4E');
  lg.addColorStop(1, '#101011');
  ctx.fillStyle = lg;
  ctx.fill(rim);
  ctx.fillStyle = '#1C1C1E';
  ctx.beginPath();
  ctx.ellipse(cx, lt, rl, rl * e, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#2B2B2E';
  ctx.beginPath();
  ctx.ellipse(cx, lt - 16, rl * 0.84, rl * e * 0.84, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#0A0A0B';
  ctx.beginPath();
  ctx.ellipse(cx + 70, lt - 18, 26, 8, 0, 0, TAU);
  ctx.fill();
  // Vapor.
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const ph = t * 1.6 + i * 0.9;
    const a = 0.16 * Math.sin(Math.PI * ((ph % 1.8) / 1.8));
    ctx.strokeStyle = `rgba(255,255,255,${a})`;
    ctx.lineWidth = 16;
    ctx.beginPath();
    const bx = cx + 40 + i * 24, by = lt - 40 - ((ph % 1.8) / 1.8) * 120;
    ctx.moveTo(bx, by);
    ctx.bezierCurveTo(bx - 30, by - 60, bx + 30, by - 110, bx, by - 170);
    ctx.stroke();
  }
  ctx.restore();
}

function scenePackaging(ctx, t, d) {
  const k = E.inOutQuad(range(t, 0, d));
  const wall = ctx.createLinearGradient(0, 0, 0, 1330);
  wall.addColorStop(0, '#F1E9DD');
  wall.addColorStop(1, '#E4D9C9');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, 1330);
  const floor = ctx.createLinearGradient(0, 1330, 0, H);
  floor.addColorStop(0, '#D8CBB7');
  floor.addColorStop(1, '#C7B8A2');
  ctx.fillStyle = floor;
  ctx.fillRect(0, 1330, W, H - 1330);
  const edge = ctx.createLinearGradient(0, 1300, 0, 1360);
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(0.5, 'rgba(80,60,40,0.18)');
  edge.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 1300, W, 60);
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(tex('paper'), 0, 0);
  ctx.restore();
  const lt = ctx.createRadialGradient(160, 420, 60, 160, 420, 1200);
  lt.addColorStop(0, 'rgba(255,255,255,0.35)');
  lt.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = lt;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  zoomAt(ctx, lerp(1, 1.07, k), CX, 1050);
  ctx.translate(lerp(14, -14, k), 0);
  drawBag(ctx);
  drawCup(ctx, t);
  ctx.restore();
}

/* ---------- 14 · Redes sociais ---------- */
function drawTile(g, x, y, s, i) {
  g.save();
  g.beginPath();
  g.rect(x, y, s, s);
  g.clip();
  const c = COL;
  switch (i % 9) {
    case 0: g.fillStyle = c.pink; g.fillRect(x, y, s, s); drawLogo(g, x + s / 2, y + s / 2, s * 0.6, c.cream, c.ink); break;
    case 1: g.fillStyle = c.ink; g.fillRect(x, y, s, s); drawLogo(g, x + s * 0.18, y + s * 1.05, s * 2.3, c.cream, c.pink); break;
    case 2: g.fillStyle = c.cream; g.fillRect(x, y, s, s); drawLogo(g, x + s / 2, y + s / 2, s * 0.6, c.ink, c.pink); break;
    case 3:
      g.fillStyle = c.ink; g.fillRect(x, y, s, s);
      for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) drawLogo(g, x + (k + 0.5) * s / 4, y + (j + 0.5) * s / 4, s / 6.5, c.cream, c.pink);
      break;
    case 4: g.fillStyle = c.ink; g.fillRect(x, y, s, s); fillRR(g, x + s * 0.3, y + s * 0.3, s * 0.4, s * 0.4, s * 0.11, c.pink); break;
    case 5:
      g.fillStyle = c.cream; g.fillRect(x, y, s, s);
      g.strokeStyle = rgba(c.ink, 0.25); g.lineWidth = 1;
      for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(x + (k * s) / 6, y); g.lineTo(x + (k * s) / 6, y + s); g.moveTo(x, y + (k * s) / 6); g.lineTo(x + s, y + (k * s) / 6); g.stroke(); }
      g.save(); logoSpace(g, x + s / 2, y + s / 2, s * 0.62); g.lineWidth = 7; g.strokeStyle = c.ink; g.stroke(LogoShape.glyph); g.fillStyle = c.pink; g.fill(LogoShape.dot); g.restore();
      break;
    case 6: g.fillStyle = c.pink; g.fillRect(x, y, s, s); drawLogo(g, x + s * 0.72, y + s * 0.12, s * 1.9, c.ink, c.cream); break;
    case 7:
      g.fillStyle = c.ink; g.fillRect(x, y, s, s);
      g.save(); logoSpace(g, x + s / 2, y + s / 2, s * 0.62); g.lineWidth = 8; g.strokeStyle = c.cream; g.stroke(LogoShape.glyph); g.fillStyle = c.pink; g.fill(LogoShape.dot); g.restore();
      break;
    default: {
      const gr = g.createLinearGradient(x, y, x + s, y + s);
      gr.addColorStop(0, '#2A0F1A'); gr.addColorStop(1, '#FF3A6F');
      g.fillStyle = gr; g.fillRect(x, y, s, s);
      drawLogo(g, x + s / 2, y + s / 2, s * 0.42, c.cream, c.ink);
    }
  }
  g.restore();
}

function drawProfileScreen(g, t) {
  const w = g.canvas.width, h = g.canvas.height;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#0E0E0F';
  g.fillRect(0, 0, w, h);
  const followed = t > 0.72;
  const scroll = E.inOutCubic(range(t, 0.85, 1.95)) * 430;
  g.save();
  g.translate(0, -scroll);
  const ring = g.createLinearGradient(40, 210, 220, 390);
  ring.addColorStop(0, COL.pink);
  ring.addColorStop(1, '#FFB36B');
  g.strokeStyle = ring;
  g.lineWidth = 8;
  g.beginPath();
  g.arc(130, 300, 90, 0, TAU);
  g.stroke();
  g.fillStyle = COL.ink;
  g.beginPath();
  g.arc(130, 300, 80, 0, TAU);
  g.fill();
  drawLogo(g, 130, 300, 96);
  [['248', 'posts', 322], [followed ? '12,5 mil' : '12,4 mil', 'seguidores', 462], ['180', 'seguindo', 606]].forEach(([n, l, x]) => {
    text(g, n, x, 298, { family: FONT_DISPLAY, size: 28, weight: 700, color: '#FFFFFF', align: 'center' });
    text(g, l, x, 334, { size: 16, weight: 400, color: '#9A9AA2', align: 'center' });
  });
  text(g, BRAND.name, 40, 456, { family: FONT_DISPLAY, size: 26, weight: 700, color: '#FFFFFF' });
  text(g, 'Identidade visual · ' + BRAND.year, 40, 496, { size: 18, weight: 400, color: '#C9C9CF' });
  text(g, 'design · marca · aplicações', 40, 528, { size: 18, weight: 400, color: '#9A9AA2' });
  fillRR(g, 40, 566, 296, 70, 18, followed ? '#2A2A2E' : COL.pink);
  text(g, followed ? 'Seguindo' : 'Seguir', 188, 611, { family: FONT_DISPLAY, size: 22, weight: 700, color: '#FFFFFF', align: 'center' });
  fillRR(g, 352, 566, 296, 70, 18, '#2A2A2E');
  text(g, 'Mensagem', 500, 611, { family: FONT_DISPLAY, size: 22, weight: 700, color: '#FFFFFF', align: 'center' });
  if (t > 0.62 && t < 1.1) {
    const k = range(t, 0.62, 1.1);
    g.fillStyle = `rgba(255,255,255,${0.3 * (1 - k)})`;
    g.beginPath();
    g.arc(188, 601, 20 + 170 * E.outCubic(k), 0, TAU);
    g.fill();
  }
  g.fillStyle = '#FFFFFF';
  g.fillRect(0, 700, w / 3, 3);
  g.fillStyle = '#2A2A2E';
  g.fillRect(w / 3, 701, (w * 2) / 3, 1);
  const s = (w - 4) / 3;
  for (let i = 0; i < 18; i++) drawTile(g, (i % 3) * (s + 2), 710 + Math.floor(i / 3) * (s + 2), s, i);
  g.restore();
  g.fillStyle = '#0E0E0F';
  g.fillRect(0, 0, w, 190);
  statusBar(g, w);
  text(g, '‹', 36, 168, { family: FONT_DISPLAY, size: 44, weight: 500, color: '#FFFFFF' });
  text(g, BRAND.handle, 96, 160, { family: FONT_DISPLAY, size: 26, weight: 700, color: '#FFFFFF' });
  [0, 1, 2].forEach(i => { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(w - 88 + i * 16, 150, 4.5, 0, TAU); g.fill(); });
}

function sceneProfile(ctx, t, d) {
  ctx.fillStyle = COL.ink;
  ctx.fillRect(0, 0, W, H);
  const glow = (x, y, r, c, a) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(c, a));
    g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  glow(160, 1500, 900, COL.pink, 0.45);
  glow(980, 360, 700, COL.cream, 0.08);
  const k = E.outCubic(range(t, 0, d));
  const obj = Obj(Cam(2600), {
    x: 0, y: 50, z: lerp(220, 50, k),
    rx: lerp(0.1, 0.05, k), ry: lerp(0.4, 0.18, k), rz: lerp(-0.05, -0.012, k),
  });
  const scr = SCREEN();
  drawProfileScreen(scr.getContext('2d'), t);
  drawPhone(ctx, obj, scr);
  const pop = spring(t - 0.75, 16, 8) * (1 - range(t, 1.7, 1.95));
  if (pop > 0) {
    ctx.save();
    ctx.translate(840, 640);
    ctx.scale(pop, pop);
    withShadow(ctx, 'rgba(0,0,0,0.4)', 30, 0, 14, () => fillRR(ctx, -150, -44, 300, 88, 44, COL.pink));
    text(ctx, '+1 seguidor', 0, 10, { family: FONT_DISPLAY, size: 26, weight: 700, color: '#FFFFFF', align: 'center' });
    ctx.restore();
  }
}
