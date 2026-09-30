'use strict';
/* =====================================================================
   Cenas C — padrão, versões de cor, recap e assinatura final em 3D.
   ===================================================================== */

/* ---------- 15 · Padrão ---------- */
function scenePattern(ctx, t, d) {
  const inv = t >= 2 * BEAT;
  ctx.fillStyle = inv ? COL.pink : COL.ink;
  ctx.fillRect(0, 0, W, H);
  const gc = inv ? COL.ink : COL.cream, dc = inv ? COL.cream : COL.pink;
  const punch = inv ? 1 + 0.07 * (1 - E.outCubic(range(t, 2 * BEAT, 2 * BEAT + 0.3))) : 1;
  const cell = lerp(210, 150, E.inOutCubic(range(t, 0, d)));
  const sx = (t * 110) / cell, sy = (t * 55) / cell;
  const oi = Math.floor(sx), oj = Math.floor(sy), fx = sx - oi, fy = sy - oj;
  const n = Math.ceil(1250 / cell) + 1;
  ctx.save();
  ctx.translate(CX, CY);
  ctx.scale(punch, punch);
  ctx.rotate(-0.2);
  for (let j = -n; j <= n; j++) {
    for (let i = -n; i <= n; i++) {
      const x = (i + fx) * cell, y = (j + fy) * cell;
      const rot = ((i - oi + j - oj) & 3) * (Math.PI / 2);
      const pulse = 0.8 + 0.2 * Math.sin(t * 7 - Math.hypot(x, y) * 0.012);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      drawLogo(ctx, 0, 0, cell * 0.6 * pulse, gc, dc);
      ctx.restore();
    }
  }
  ctx.restore();
}

/* ---------- 16 · Versões de cor ---------- */
const COLORWAYS = [
  { name: 'Primária', bg: 'ink', glyph: 'cream', dot: 'pink' },
  { name: 'Negativa', bg: 'cream', glyph: 'ink', dot: 'pink' },
  { name: 'Rosa', bg: 'pink', glyph: 'cream', dot: 'ink' },
  { name: 'Monocromática', bg: 'ink', glyph: 'cream', dot: 'cream' },
  { name: 'Contorno', bg: 'ink', outline: 'cream', dot: 'pink' },
  { name: 'Ícone', bg: 'pink', icon: true },
];

function sceneColors(ctx, t, d) {
  ctx.fillStyle = COL.ink;
  ctx.fillRect(0, 0, W, H);
  const top = 262, ch = (1780 - top) / 3, cw = W / 2;
  const kz = E.inCubic(range(t, 1.5, 2.0));
  ctx.save();
  if (kz > 0) {
    const fx = cw / 2, fy = top + ch / 2;
    ctx.translate(lerp(fx, CX, kz), lerp(fy, CY, kz));
    const z = lerp(1, 3.9, kz);
    ctx.scale(z, z);
    ctx.translate(-fx, -fy);
  }
  COLORWAYS.forEach((c, i) => {
    const x = (i % 2) * cw, y = top + Math.floor(i / 2) * ch;
    const ap = E.outExpo(range(t, i * 0.07 - 0.06, 0.4 + i * 0.07));
    if (ap <= 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 5, y + 5, cw - 10, (ch - 10) * ap);
    ctx.clip();
    fillRR(ctx, x + 5, y + 5, cw - 10, ch - 10, 18, COL[c.bg]);
    const lcx = x + cw / 2, lcy = y + ch / 2 - 16 + (1 - ap) * 40;
    if (c.icon) {
      withShadow(ctx, 'rgba(90,0,30,0.35)', 30, 0, 14, () => fillRR(ctx, lcx - 120, lcy - 120, 240, 240, 56, COL.ink));
      drawLogo(ctx, lcx, lcy, 150);
    } else if (c.outline) {
      ctx.save();
      logoSpace(ctx, lcx, lcy, 250);
      ctx.lineWidth = 9;
      ctx.strokeStyle = COL[c.outline];
      ctx.stroke(LogoShape.glyph);
      ctx.fillStyle = COL[c.dot];
      ctx.fill(LogoShape.dot);
      ctx.restore();
    } else {
      drawLogo(ctx, lcx, lcy, 250, COL[c.glyph], COL[c.dot]);
    }
    const lc = c.bg === 'ink' ? COL.cream : COL.ink;
    text(ctx, pad2(i + 1), x + 36, y + ch - 38, { size: 17, weight: 600, color: lc, alpha: 0.55 });
    text(ctx, c.name.toUpperCase(), x + 84, y + ch - 38, { size: 17, weight: 600, spacing: 3, color: lc });
    ctx.restore();
  });
  ctx.restore();
}

/* ---------- Recap: 8 cortes de meio tempo ---------- */
const RECAP = [['app', 1.55], ['cartao', 1.5], ['camiseta', 0.75], ['outdoor', 1.2], ['embalagem', 1.1], ['perfil', 1.0], ['neon', 0.3], ['cera', 0.25]];

function sceneRecap(ctx, t, d, env) {
  const seg = d / RECAP.length;
  const i = Math.min(RECAP.length - 1, Math.floor(t / seg));
  const [id, at] = RECAP[i];
  const s = TIMELINE.byId[id];
  const lt = t - i * seg;
  env.ui = { label: s.label, theme: s.theme, app: s.app };
  env.sinceCut = lt;
  ctx.save();
  zoomAt(ctx, 1 + 0.08 * (1 - E.outCubic(range(lt, 0, 0.2))));
  s.draw(ctx, at + lt, s.dur, { ...env, t: s.start + at + lt });
  ctx.restore();
}

/* ---------- Assinatura: logo em 3D que pousa plana ---------- */
function extrude(ctx, obj, parts, depth) {
  const quads = [];
  for (const part of parts) {
    const P = part.pts, n = P.length;
    const F = obj.pts(P, 0), B = obj.pts(P, depth);
    part.F = F;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const [x0, y0] = P[i], [x1, y1] = P[j];
      const l = Math.hypot(x1 - x0, y1 - y0) || 1;
      const nrm = obj.dir((y1 - y0) / l, -(x1 - x0) / l, 0);
      const c = obj.world((x0 + x1) / 2, (y0 + y1) / 2, depth / 2);
      const vx = c[0] - obj.cam.x, vy = c[1] - obj.cam.y, vz = c[2] + obj.cam.D;
      if (nrm[0] * vx + nrm[1] * vy + nrm[2] * vz >= 0) continue;
      quads.push({ pts: [F[i], F[j], B[j], B[i]], z: vx * vx + vy * vy + vz * vz, col: shade(part.side, lambert(nrm, 0.3)) });
    }
  }
  quads.sort((a, b) => b.z - a.z);
  ctx.lineWidth = 1 / K;
  for (const q of quads) {
    const p = polyPath(q.pts);
    ctx.fillStyle = q.col;
    ctx.strokeStyle = q.col;
    ctx.fill(p);
    ctx.stroke(p);
  }
  for (const part of parts) {
    ctx.fillStyle = part.front;
    ctx.fill(polyPath(part.F));
  }
}

function sceneFinal(ctx, t, d) {
  ctx.fillStyle = COL.ink;
  ctx.fillRect(0, 0, W, H);
  const k = E.outCubic(range(t, 0, 1.7));
  const gl = ctx.createRadialGradient(CX, 900, 50, CX, 900, 1000);
  gl.addColorStop(0, rgba(COL.pink, 0.14 * k));
  gl.addColorStop(1, rgba(COL.pink, 0));
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, W, H);

  const lh = 560;
  const obj = Obj(Cam(2600), {
    x: 0, y: -60, z: lerp(900, 0, k),
    rx: lerp(-0.55, 0, k), ry: lerp(1.1, 0, k), rz: lerp(0.15, 0, k), s: lh / LOGO.h,
  });
  const center = pts => pts.map(([x, y]) => [x - LOGO.w / 2, y - LOGO.h / 2]);
  const blinkOff = (t > 4 * BEAT && t < 4.5 * BEAT) || (t > 5 * BEAT && t < 5.5 * BEAT);
  const parts = [{ pts: center(LogoShape.glyphPts), front: COL.cream, side: '#D8CAB4' }];
  if (!blinkOff) parts.push({ pts: center(LogoShape.dotPts), front: COL.pink, side: '#C41D50' });
  extrude(ctx, obj, parts, 120 * (1 - E.inQuad(range(t, 1.1, 1.7))));

  // Reflexo que atravessa a logo depois de pousar.
  const sp = range(t, 1.75, 2.35);
  if (sp > 0 && sp < 1) {
    ctx.save();
    logoSpace(ctx, CX, 900, lh);
    ctx.clip(LogoShape.glyph);
    const x = lerp(-300, 700, E.inOutQuad(sp));
    const g = ctx.createLinearGradient(x - 120, 0, x + 120, 120);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.75)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-100, -100, 700, 900);
    ctx.restore();
  }

  if (BRAND.tagline) {
    const a = E.outCubic(range(t, 4 * BEAT, 4 * BEAT + 0.6));
    text(ctx, BRAND.tagline, CX, 1330 + (1 - a) * 30, { family: FONT_DISPLAY, size: 46, weight: 700, color: COL.cream, align: 'center', alpha: a });
  }
  const b = E.outCubic(range(t, 5 * BEAT, 5 * BEAT + 0.6));
  text(ctx, BRAND.handle, CX, 1392, { size: 20, weight: 400, spacing: 3, color: COL.cream, align: 'center', alpha: 0.6 * b });

  const fo = range(t, d - 0.55, d - 0.05);
  if (fo > 0) {
    ctx.fillStyle = `rgba(0,0,0,${fo})`;
    ctx.fillRect(0, 0, W, H);
  }
}
