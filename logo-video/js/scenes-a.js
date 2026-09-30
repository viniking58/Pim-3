'use strict';
/* =====================================================================
   Cenas A — construção da logo e os cortes de "materiais".
   Assinatura de cada cena: draw(ctx, t, dur, env)
     t   = tempo local da cena (s)       env.t = tempo global (s)
   ===================================================================== */

/* ---------- 0. Construção ---------- */
function sceneIntro(ctx, t) {
  ctx.fillStyle = COL.ink;
  ctx.fillRect(0, 0, W, H);

  const z = lerp(1, 1.07, E.inOutQuad(range(t, 0, 3.6)));
  const s = (820 * z) / LOGO.h;
  const ox = CX - (LOGO.w * s) / 2, oy = 940 - (LOGO.h * s) / 2;
  const X = u => ox + u * s, Y = v => oy + v * s;
  const d = LOGO.dot;

  // Guias de construção (grade, diagonal de 45°, raios e cotas).
  const ga = 1 - range(t, 3.05, 3.5);
  if (ga > 0) {
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = rgba(COL.cream, 0.2 * ga);
    [0, 120, 287.5, 409].forEach((u, i) => {
      const p = E.outExpo(range(t, 0.1 + i * 0.07, 0.9 + i * 0.07));
      if (p <= 0) return;
      ctx.beginPath();
      ctx.moveTo(X(u), 940 - 1000 * p);
      ctx.lineTo(X(u), 940 + 1000 * p);
      ctx.stroke();
    });
    [0, 119, 252, 486, 609].forEach((v, i) => {
      const p = E.outExpo(range(t, 0.2 + i * 0.07, 1.0 + i * 0.07));
      if (p <= 0) return;
      ctx.beginPath();
      ctx.moveTo(CX - 620 * p, Y(v));
      ctx.lineTo(CX + 620 * p, Y(v));
      ctx.stroke();
    });
    const pd = E.outExpo(range(t, 0.55, 1.35));
    if (pd > 0) {
      const mx = X(381.75), my = Y(27.25), L = 520 * pd;
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = rgba(COL.pink, 0.55 * ga);
      ctx.beginPath();
      ctx.moveTo(mx - L, my - L);
      ctx.lineTo(mx + L, my + L);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const pc = E.outCubic(range(t, 0.7, 1.3));
    if (pc > 0) {
      ctx.strokeStyle = rgba(COL.cream, 0.35 * ga);
      [[25, 25, 25], [24, 585, 24], [d.x + d.w - 33, d.y + 33, 33], [d.x + 33, d.y + d.h - 33, 33]].forEach(([u, v, r]) => {
        ctx.beginPath();
        ctx.arc(X(u), Y(v), r * s * pc, 0, TAU);
        ctx.stroke();
      });
    }
    const pl = range(t, 0.9, 1.3) * ga;
    if (pl > 0) {
      const o = { size: 18, weight: 400, color: COL.cream, alpha: 0.55 * pl, spacing: 1 };
      const yb = Y(609) + 44;
      ctx.strokeStyle = rgba(COL.cream, 0.4 * pl);
      ctx.beginPath();
      ctx.moveTo(X(0), yb); ctx.lineTo(X(120), yb);
      ctx.moveTo(X(0), yb - 8); ctx.lineTo(X(0), yb + 8);
      ctx.moveTo(X(120), yb - 8); ctx.lineTo(X(120), yb + 8);
      ctx.stroke();
      text(ctx, '1u', X(60), yb + 36, { ...o, align: 'center' });
      text(ctx, '45°', X(409) + 34, Y(0) - 18, o);
      text(ctx, 'r 33', X(410) + 30, Y(486) + 26, o);
      text(ctx, '2,1u', X(409) + 30, Y(252) + 6, o);
    }
    ctx.restore();
  }

  // Construção do "r": haste sobe, barra avança, gancho desce.
  const pStem = E.outCubic(range(t, 0.75, 1.25));
  const pBar = E.outCubic(range(t, 1.25, 1.75));
  const pHook = E.outCubic(range(t, 1.75, 2.2));
  const cutT = 2.5;
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(s, s);
  const clip = new Path2D();
  if (pStem > 0) clip.rect(-5, 614 - 620 * pStem, 125, 620 * pStem);
  if (pBar > 0) clip.rect(-5, -5, 420 * pBar, 130);
  if (pHook > 0) clip.rect(280, -5, 135, 262 * pHook);
  ctx.save();
  ctx.clip(clip);
  ctx.fillStyle = COL.cream;
  ctx.fill(LogoShape.glyph);
  if (t < cutT) ctx.fill(LogoShape.corner);
  ctx.restore();

  // O corte a 45°: lâmina rosa + canto que cai.
  if (t > cutT - 0.14 && t < cutT + 0.32) {
    const k = E.outCubic(range(t, cutT - 0.14, cutT));
    const fade = 1 - range(t, cutT, cutT + 0.32);
    ctx.strokeStyle = rgba(COL.pink, fade);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(330, -24);
    ctx.lineTo(330 + 110 * k, -24 + 110 * k);
    ctx.stroke();
  }
  if (t >= cutT && t < cutT + 0.9) {
    const k = t - cutT;
    const tri = new Path2D();
    tri.moveTo(354.5, 0);
    tri.lineTo(397, 0);
    tri.arcTo(409, 0, 409, 12, 12);
    tri.lineTo(409, 54.5);
    tri.closePath();
    ctx.save();
    ctx.globalAlpha = 1 - range(k, 0.1, 0.55);
    ctx.translate(392 + 320 * k, 18 - 120 * k + 1400 * k * k);
    ctx.rotate(k * 3.2);
    ctx.translate(-392, -18);
    ctx.fillStyle = COL.cream;
    ctx.fill(tri);
    ctx.restore();
  }
  ctx.restore();

  // O ponto cai, amassa e quica.
  const land = 3.0;
  if (t >= 2.62) {
    let dy = 0, sx = 1, sy = 1;
    if (t < land) {
      const k = range(t, 2.62, land);
      dy = -(1 - k * k) * 1500;
      sy = 1 + 0.35 * k;
      sx = 1 - 0.12 * k;
    } else {
      const k = t - land;
      const w = Math.exp(-6 * k) * Math.cos(16 * k);
      sy = 1 - 0.3 * w;
      sx = 1 + 0.22 * w;
    }
    const bx = X(d.x + d.w / 2), by = Y(d.y + d.h);
    ctx.save();
    ctx.translate(bx, by + dy);
    ctx.scale(sx, sy);
    ctx.translate(-bx, -by);
    ctx.translate(ox, oy);
    ctx.scale(s, s);
    ctx.fillStyle = COL.pink;
    ctx.fill(LogoShape.dot);
    ctx.restore();
    if (t >= land && t < land + 0.55) {
      const k = range(t, land, land + 0.55);
      ctx.strokeStyle = rgba(COL.pink, 0.6 * (1 - k));
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(bx, by + 6, 90 + 260 * E.outCubic(k), 14 + 40 * E.outCubic(k), 0, 0, TAU);
      ctx.stroke();
    }
  }

  // Transição: o ponto cresce até cobrir a tela.
  if (t > 3.5) {
    const k = E.inCubic(range(t, 3.5, 3.96));
    const x0 = X(d.x), y0 = Y(d.y), w0 = d.w * s, h0 = d.h * s;
    fillRR(ctx, lerp(x0, -80, k), lerp(y0, -80, k), lerp(w0, W + 160, k), lerp(h0, H + 160, k), lerp(d.r * s, 0, k), COL.pink);
  }
}

/* ---------- Materiais: a logo fica parada, o mundo muda a cada batida ---------- */
const MAT = { cx: CX, cy: 950, h: 720 };
const matZoom = env => 1 + 0.1 * range(env.t, 4, 8);

function matBegin(ctx, env) {
  const z = matZoom(env);
  ctx.save();
  zoomAt(ctx, z, CX, MAT.cy);
  return z;
}

// 1 · Papel com baixo-relevo e hot stamping rosa.
function matPaper(ctx, t, d, env) {
  const z = matBegin(ctx, env);
  ctx.drawImage(tex('paper'), 0, 0);
  const g = ctx.createLinearGradient(0, 0, W * 0.7, H);
  g.addColorStop(0, 'rgba(255,252,245,0.35)');
  g.addColorStop(1, 'rgba(60,40,20,0.12)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const L = LogoShape;
  ctx.save();
  logoSpace(ctx, MAT.cx, MAT.cy, MAT.h);
  ctx.fillStyle = '#E3DACC';
  ctx.fill(L.glyph);
  innerShadow(ctx, L.glyph, 'rgba(70,48,28,0.6)', 16 * z, 8 * z, 10 * z);
  innerShadow(ctx, L.glyph, 'rgba(255,255,255,0.95)', 5 * z, -3 * z, -4 * z);
  const fg = ctx.createLinearGradient(289, 486, 410, 608);
  fg.addColorStop(0, '#FF9AB4');
  fg.addColorStop(0.3, '#FF3A6F');
  fg.addColorStop(0.5, '#FFC2D1');
  fg.addColorStop(0.72, '#E42A5E');
  fg.addColorStop(1, '#BF1B4C');
  ctx.fillStyle = fg;
  ctx.fill(L.dot);
  innerShadow(ctx, L.dot, 'rgba(90,10,35,0.55)', 10 * z, 5 * z, 7 * z);
  innerShadow(ctx, L.dot, 'rgba(255,255,255,0.7)', 4 * z, -2 * z, -3 * z);
  ctx.restore();
  ctx.restore();
}

// 2 · Lacre de cera rosa num envelope.
const SEAL = (() => {
  const R = 500, pts = [];
  for (let i = 0; i < 160; i++) {
    const a = (i / 160) * TAU;
    let r = R * (1 + 0.05 * (vnoise1(a * 1.6, 3) - 0.5) + 0.022 * (vnoise1(a * 6, 9) - 0.5));
    for (const [c, w, h] of [[0.7, 0.16, 0.09], [2.5, 0.12, 0.07], [4.4, 0.2, 0.06]]) {
      let da = Math.abs(a - c);
      da = Math.min(da, TAU - da);
      r += R * h * Math.exp(-(da * da) / (2 * w * w));
    }
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return { R, pts };
})();

function matWax(ctx, t, d, env) {
  const z = matBegin(ctx, env);
  ctx.drawImage(tex('paper'), 0, 0);
  ctx.fillStyle = 'rgba(232,214,188,0.45)';
  ctx.fillRect(0, 0, W, H);
  const cy = MAT.cy;
  const flap = new Path2D();
  flap.moveTo(-60, 300);
  flap.lineTo(CX, cy + 60);
  flap.lineTo(W + 60, 300);
  flap.lineTo(W + 60, -60);
  flap.lineTo(-60, -60);
  flap.closePath();
  shadowOnly(ctx, flap, 'rgba(90,60,30,0.4)', 34 * z, 0, 16 * z);
  ctx.fillStyle = '#F3E9DA';
  ctx.fill(flap);
  ctx.save();
  ctx.clip(flap);
  ctx.globalAlpha = 0.5;
  ctx.drawImage(tex('paper'), 0, 0);
  ctx.restore();

  const blob = polyPath(SEAL.pts.map(([x, y]) => [CX + x, cy + y]));
  shadowOnly(ctx, blob, 'rgba(90,15,30,0.5)', 44 * z, 12 * z, 22 * z);
  const rg = ctx.createRadialGradient(CX - 170, cy - 200, 40, CX, cy, SEAL.R * 1.25);
  rg.addColorStop(0, '#FF7098');
  rg.addColorStop(0.45, '#EE3467');
  rg.addColorStop(0.82, '#C01D4B');
  rg.addColorStop(1, '#8A1134');
  ctx.fillStyle = rg;
  ctx.fill(blob);
  innerShadow(ctx, blob, 'rgba(255,160,190,0.7)', 18 * z, 8 * z, 10 * z);
  innerShadow(ctx, blob, 'rgba(70,0,20,0.6)', 22 * z, -8 * z, -12 * z);

  // Anel elevado e disco prensado.
  const Rd = 418;
  const ring = ctx.createLinearGradient(CX - Rd, cy - Rd, CX + Rd, cy + Rd);
  ring.addColorStop(0, 'rgba(255,190,210,0.9)');
  ring.addColorStop(0.5, 'rgba(230,50,100,0.2)');
  ring.addColorStop(1, 'rgba(90,0,25,0.85)');
  ctx.strokeStyle = ring;
  ctx.lineWidth = 26;
  ctx.beginPath();
  ctx.arc(CX, cy, Rd + 16, 0, TAU);
  ctx.stroke();
  const disc = new Path2D();
  disc.arc(CX, cy, Rd, 0, TAU);
  ctx.fillStyle = '#DE2C5E';
  ctx.fill(disc);
  innerShadow(ctx, disc, 'rgba(80,0,25,0.7)', 18 * z, 8 * z, 10 * z);
  innerShadow(ctx, disc, 'rgba(255,170,195,0.55)', 10 * z, -5 * z, -6 * z);

  // Logo em alto-relevo dentro do disco.
  const L = LogoShape;
  ctx.save();
  logoSpace(ctx, CX, cy, 590);
  withShadow(ctx, 'rgba(70,0,22,0.6)', 12 * z, 7 * z, 9 * z, () => {
    ctx.fillStyle = '#EC3467';
    ctx.fill(L.both);
  });
  const lg = ctx.createLinearGradient(0, 0, 410, 609);
  lg.addColorStop(0, '#FF6B93');
  lg.addColorStop(1, '#D72858');
  ctx.fillStyle = lg;
  ctx.fill(L.both);
  innerShadow(ctx, L.both, 'rgba(255,200,215,0.9)', 5 * z, 4 * z, 5 * z);
  innerShadow(ctx, L.both, 'rgba(90,0,30,0.65)', 7 * z, -4 * z, -5 * z);
  ctx.restore();

  // Brilhos especulares na cera.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  [[-330, -260, 70, 0.5], [-420, 40, 34, 0.35], [250, -380, 40, 0.3]].forEach(([x, y, r, a]) => {
    const sg = ctx.createRadialGradient(CX + x, cy + y, 0, CX + x, cy + y, r);
    sg.addColorStop(0, `rgba(255,255,255,${a})`);
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(CX + x - r, cy + y - r, r * 2, r * 2);
  });
  ctx.restore();
  ctx.restore();
}

// 3 · Bordado em tecido preto.
function satin(ctx, path, [base, hi, lo], angle, gap) {
  ctx.save();
  ctx.clip(path);
  ctx.fillStyle = base;
  ctx.fillRect(-40, -40, 500, 700);
  ctx.translate(205, 304);
  ctx.rotate(angle);
  ctx.lineWidth = gap * 0.5;
  ctx.globalAlpha = 0.6;
  for (let i = -520, k = 0; i < 520; i += gap, k++) {
    const j = (hash(k * 7 + 1) - 0.5) * 2;
    ctx.strokeStyle = k % 2 ? hi : lo;
    ctx.beginPath();
    ctx.moveTo(i + j, -620);
    ctx.lineTo(i - j, 620);
    ctx.stroke();
  }
  ctx.restore();
}

function matEmbroidery(ctx, t, d, env) {
  const z = matBegin(ctx, env);
  ctx.fillStyle = pattern(ctx, 'twill');
  ctx.fillRect(-120, -120, W + 240, H + 240);
  const lg = ctx.createRadialGradient(CX - 120, MAT.cy - 260, 50, CX, MAT.cy, 1100);
  lg.addColorStop(0, 'rgba(255,255,255,0.08)');
  lg.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, W, H);

  const L = LogoShape;
  ctx.save();
  logoSpace(ctx, MAT.cx, MAT.cy, MAT.h);
  shadowOnly(ctx, L.both, 'rgba(0,0,0,0.75)', 12 * z, 4 * z, 7 * z);
  satin(ctx, L.glyph, ['#EFE5D6', '#FFFCF6', '#CDBFAA'], -0.85, 5);
  satin(ctx, L.dot, ['#EF3569', '#FF7A9E', '#B41C48'], 0.85, 5);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(60,45,30,0.35)';
  ctx.stroke(L.glyph);
  ctx.strokeStyle = 'rgba(90,10,35,0.45)';
  ctx.stroke(L.dot);
  innerShadow(ctx, L.both, 'rgba(0,0,0,0.5)', 12 * z, -5 * z, -6 * z);
  innerShadow(ctx, L.both, 'rgba(255,255,255,0.45)', 7 * z, 3 * z, 4 * z);
  ctx.restore();
  ctx.restore();
}

// 4 · Neon numa parede de tijolos.
function neonTube(ctx, path, glow, core, on, z) {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(70,60,58,0.9)';
  ctx.lineWidth = 19;
  ctx.stroke(path);
  if (on > 0) {
    ctx.shadowColor = glow;
    ctx.globalAlpha = 0.3 * on;
    ctx.shadowBlur = px(120 * z);
    ctx.strokeStyle = glow;
    ctx.lineWidth = 40;
    ctx.stroke(path);
    ctx.globalAlpha = 0.8 * on;
    ctx.shadowBlur = px(60 * z);
    ctx.lineWidth = 22;
    ctx.stroke(path);
    ctx.globalAlpha = 0.95 * on;
    ctx.shadowBlur = px(26 * z);
    ctx.lineWidth = 16;
    ctx.stroke(path);
    ctx.globalAlpha = on;
    ctx.shadowBlur = px(6 * z);
    ctx.strokeStyle = core;
    ctx.lineWidth = 7;
    ctx.stroke(path);
  }
  ctx.restore();
}

function matNeon(ctx, t, d, env) {
  const z = matBegin(ctx, env);
  const flick = [1, 0.1, 0.9, 1, 0.25, 1];
  const fi = Math.floor(t * VIDEO.fps);
  const on = fi < flick.length ? flick[fi] : 0.96 + 0.04 * Math.sin(t * 90);
  ctx.drawImage(tex('bricks'), -120, -120);
  ctx.fillStyle = 'rgba(6,4,6,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const glow = (x, y, r, c, a) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(c, a));
    g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  glow(CX - 60, MAT.cy - 120, 760, '#FFE3C4', 0.34 * on);
  glow(CX + 150, MAT.cy + 260, 460, COL.pink, 0.45 * on);
  ctx.restore();

  ctx.save();
  logoSpace(ctx, MAT.cx, MAT.cy, MAT.h);
  ctx.fillStyle = 'rgba(40,36,34,0.9)';
  [[60, 150], [60, 470], [200, 60], [348, 160], [300, 500], [398, 596]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, TAU);
    ctx.fill();
  });
  neonTube(ctx, LogoShape.tube, '#FFE6C8', '#FFFBF4', on, z);
  neonTube(ctx, LogoShape.tubeDot, '#FF3A6F', '#FFD9E3', on, z);
  ctx.restore();
  ctx.restore();
}

// 5 · Carimbo (tinta preta + rosa, com falhas).
TEX_GEN.stamp = () => {
  const c = makeCanvas(W, H), g = c.getContext('2d');
  g.translate(MAT.cx, MAT.cy);
  g.rotate(-0.05);
  g.translate(-MAT.cx, -MAT.cy);
  g.save();
  logoSpace(g, MAT.cx, MAT.cy, MAT.h);
  g.fillStyle = '#211E1F';
  g.fill(LogoShape.glyph);
  g.fillStyle = '#F0346A';
  g.fill(LogoShape.dot);
  g.lineWidth = 5;
  g.strokeStyle = 'rgba(0,0,0,0.35)';
  g.stroke(LogoShape.glyph);
  g.restore();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'destination-out';
  g.drawImage(tex('grunge'), 0, 0, W, H);
  return c;
};

function matStamp(ctx, t, d, env) {
  matBegin(ctx, env);
  ctx.drawImage(tex('paper'), 0, 0);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.94;
  ctx.drawImage(tex('stamp'), 0, 0);
  ctx.restore();
}

// 6 · Placa de aço escovado com gravação e esmalte.
function screw(ctx, x, y, r, a) {
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, 1, x, y, r);
  g.addColorStop(0, '#F2F3F5');
  g.addColorStop(0.6, '#9A9DA3');
  g.addColorStop(1, '#55585E');
  ctx.save();
  withShadow(ctx, 'rgba(0,0,0,0.45)', 6, 2, 3, () => {
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  });
  ctx.translate(x, y);
  ctx.rotate(a);
  ctx.strokeStyle = 'rgba(40,40,45,0.8)';
  ctx.lineWidth = r * 0.22;
  ctx.beginPath();
  ctx.moveTo(-r * 0.62, 0);
  ctx.lineTo(r * 0.62, 0);
  ctx.stroke();
  ctx.restore();
}

function matMetal(ctx, t, d, env) {
  const z = matBegin(ctx, env);
  ctx.drawImage(tex('metal'), 0, 0);
  const sw = lerp(-200, W + 200, range(t, 0, d));
  const g = ctx.createLinearGradient(sw - 520, 0, sw + 520, H * 0.2);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.32)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const v = ctx.createLinearGradient(0, 0, 0, H);
  v.addColorStop(0, 'rgba(0,0,0,0.25)');
  v.addColorStop(0.5, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);

  const L = LogoShape;
  ctx.save();
  logoSpace(ctx, MAT.cx, MAT.cy, MAT.h);
  ctx.fillStyle = 'rgba(28,30,34,0.62)';
  ctx.fill(L.glyph);
  innerShadow(ctx, L.glyph, 'rgba(0,0,0,0.75)', 7 * z, 6 * z, 7 * z);
  innerShadow(ctx, L.glyph, 'rgba(255,255,255,0.6)', 3 * z, -3 * z, -3 * z);
  const pg = ctx.createLinearGradient(289, 486, 410, 608);
  pg.addColorStop(0, '#FF6690');
  pg.addColorStop(1, '#D62458');
  ctx.fillStyle = pg;
  ctx.fill(L.dot);
  innerShadow(ctx, L.dot, 'rgba(60,0,20,0.7)', 7 * z, 5 * z, 6 * z);
  gloss(ctx, L.dot, 289, 486, 410, 608, 0.5);
  ctx.restore();
  [[150, 330], [930, 330], [150, 1570], [930, 1570]].forEach(([x, y], i) => screw(ctx, x, y, 26, 0.4 + i * 1.1));
  ctx.restore();
}

// 7 · Pin esmaltado num jeans.
function matPin(ctx, t, d, env) {
  const z = matBegin(ctx, env);
  ctx.fillStyle = pattern(ctx, 'denim');
  ctx.fillRect(-120, -120, W + 240, H + 240);
  const fold = ctx.createLinearGradient(0, H * 0.15, W, H * 0.85);
  fold.addColorStop(0, 'rgba(255,255,255,0.10)');
  fold.addColorStop(0.45, 'rgba(0,0,0,0)');
  fold.addColorStop(0.62, 'rgba(0,0,20,0.35)');
  fold.addColorStop(0.75, 'rgba(255,255,255,0.06)');
  fold.addColorStop(1, 'rgba(0,0,20,0.4)');
  ctx.fillStyle = fold;
  ctx.fillRect(0, 0, W, H);

  const L = LogoShape;
  ctx.save();
  logoSpace(ctx, MAT.cx, MAT.cy, MAT.h);
  ctx.lineJoin = 'round';
  const thick = new Path2D();
  thick.addPath(L.both);
  ctx.save();
  ctx.shadowColor = 'rgba(0,5,25,0.65)';
  ctx.shadowBlur = px(22 * z);
  ctx.shadowOffsetX = px(12 * z);
  ctx.shadowOffsetY = px(18 * z);
  ctx.translate(4, 6);
  ctx.fillStyle = '#6E4B14';
  ctx.strokeStyle = '#6E4B14';
  ctx.lineWidth = 24;
  ctx.stroke(thick);
  ctx.fill(thick);
  ctx.restore();
  ctx.fillStyle = COL.cream;
  ctx.fill(L.glyph);
  ctx.fillStyle = COL.pink;
  ctx.fill(L.dot);
  innerShadow(ctx, L.both, 'rgba(110,70,20,0.4)', 9 * z, 3 * z, 4 * z);
  const gold = ctx.createLinearGradient(0, 0, 410, 609);
  gold.addColorStop(0, '#FFF1B8');
  gold.addColorStop(0.22, '#E0AC45');
  gold.addColorStop(0.45, '#FFE38F');
  gold.addColorStop(0.7, '#B3822A');
  gold.addColorStop(1, '#F2CC6A');
  ctx.strokeStyle = gold;
  ctx.lineWidth = 22;
  ctx.stroke(L.both);
  ctx.save();
  ctx.translate(-2.5, -2.5);
  ctx.strokeStyle = 'rgba(255,255,240,0.55)';
  ctx.lineWidth = 3;
  ctx.stroke(L.both);
  ctx.restore();
  gloss(ctx, L.both, 30, 0, 380, 609, 0.42);
  ctx.restore();
  ctx.restore();
}

// 8 · Adesivo recortado na tampa do notebook.
function matSticker(ctx, t, d, env) {
  const z = matBegin(ctx, env);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#45474D');
  g.addColorStop(0.55, '#2A2B30');
  g.addColorStop(1, '#1B1C1F');
  ctx.fillStyle = g;
  ctx.fillRect(-120, -120, W + 240, H + 240);
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = pattern(ctx, 'alu');
  ctx.fillRect(-120, -120, W + 240, H + 240);
  ctx.restore();
  const refl = ctx.createLinearGradient(0, H * 0.1, W, H * 0.5);
  refl.addColorStop(0, 'rgba(255,255,255,0)');
  refl.addColorStop(0.5, 'rgba(255,255,255,0.08)');
  refl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = refl;
  ctx.fillRect(0, 0, W, H);

  const L = LogoShape;
  ctx.save();
  logoSpace(ctx, MAT.cx, MAT.cy, MAT.h);
  ctx.lineJoin = 'round';
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = px(16 * z);
  ctx.shadowOffsetX = px(4 * z);
  ctx.shadowOffsetY = px(10 * z);
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 92;
  ctx.stroke(L.both);
  ctx.restore();
  ctx.fillStyle = '#FFFFFF';
  ctx.fill(L.both);
  ctx.fillStyle = COL.ink;
  ctx.strokeStyle = COL.ink;
  ctx.lineWidth = 44;
  ctx.stroke(L.both);
  ctx.fill(L.both);
  ctx.fillStyle = COL.cream;
  ctx.fill(L.glyph);
  ctx.fillStyle = COL.pink;
  ctx.fill(L.dot);
  gloss(ctx, L.both, -60, 0, 470, 609, 0.16);
  ctx.restore();
  ctx.restore();
}
