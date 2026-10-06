// ACC Drive Insight — motion reel
// Everything is drawn on one 1920x1080 canvas from a single time value,
// so any frame can be rendered deterministically (live playback or export).
const REEL = (() => {
  const W = 1920, H = 1080;
  const C = {
    ink: '#0B0B0D', paper: '#F1F0EB', orange: '#FF5B1F', lime: '#C8FF2E',
    blue: '#1B2CFF', ice: '#E3ECF0', cream: '#FFF1E6', green: '#22C96E',
    red: '#FF3434', amber: '#FFB52E',
  };
  const F = {
    sans: '"Archivo", "Inter", sans-serif',
    serif: '"Instrument Serif", Georgia, serif',
    mono: '"JetBrains Mono", "DejaVu Sans Mono", monospace',
  };
  const TAU = Math.PI * 2;

  // ---------- helpers ----------
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const ease = {
    outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inExpo: t => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    inOutExpo: t => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
    outCubic: t => 1 - Math.pow(1 - t, 3),
    inCubic: t => t * t * t,
    inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outQuart: t => 1 - Math.pow(1 - t, 4),
    outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  };
  const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };
  const mixRGB = (a, b, t) => { const A = hex(a), B = hex(b); return A.map((v, i) => Math.round(v + (B[i] - v) * t)); };
  const mix = (a, b, t) => `rgb(${mixRGB(a, b, t).join(',')})`;
  const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const fmt = (v, d) => v.toFixed(d).replace('.', ',');

  let ctx = null;
  const font = (weight, size, fam, stretch = 'normal', ls = 0) => {
    ctx.font = `${weight} ${size}px ${fam}`;
    ctx.fontStretch = stretch;
    ctx.letterSpacing = ls + 'px';
  };
  const mono = (size, weight = 500, ls = 0.12) => font(weight, size, F.mono, 'normal', size * ls);
  const serif = size => { ctx.font = `italic 400 ${size}px ${F.serif}`; ctx.fontStretch = 'normal'; ctx.letterSpacing = '0px'; };

  // Letters rising out of a mask, one by one.
  function reveal(str, x, y, size, t, t0, { stagger = 0.032, dur = 0.7, stretch = 'expanded', weight = 900, track = -0.01 } = {}) {
    font(weight, size, F.sans, stretch);
    ctx.save();
    ctx.beginPath(); ctx.rect(x - size, y - size * 0.92, W * 2, size * 1.1); ctx.clip();
    let cx = x;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const w = ctx.measureText(ch).width;
      const p = ease.outExpo(prog(t, t0 + i * stagger, t0 + i * stagger + dur));
      if (p > 0 && ch !== ' ') ctx.fillText(ch, cx, y + (1 - p) * size * 1.02);
      cx += w + size * track;
    }
    ctx.restore();
    return cx - x;
  }
  function textWidth(str, size, { stretch = 'expanded', weight = 900, track = -0.01 } = {}) {
    font(weight, size, F.sans, stretch);
    let w = 0;
    for (const ch of str) w += ctx.measureText(ch).width + size * track;
    return w;
  }

  // The ACC Drive Insight mark: a 270° gauge with a needle and hub.
  function mark(x, y, size, pArc, pNeedle, pDot, col, acc) {
    const r = size / 2, A0 = Math.PI * 0.75, SW = Math.PI * 1.5;
    ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round';
    if (pArc > 0) { ctx.beginPath(); ctx.arc(0, 0, r, A0, A0 + SW * pArc); ctx.strokeStyle = col; ctx.lineWidth = size * 0.12; ctx.stroke(); }
    if (pNeedle > 0) {
      const a = A0 + SW * 0.8 * pNeedle;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.66, Math.sin(a) * r * 0.66);
      ctx.strokeStyle = acc; ctx.lineWidth = size * 0.11; ctx.stroke();
    }
    if (pDot > 0) { ctx.beginPath(); ctx.arc(0, 0, size * 0.105 * pDot, 0, TAU); ctx.fillStyle = col; ctx.fill(); }
    ctx.restore();
  }

  function arrow(x, y, len, col, w = 2.5) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y);
    ctx.moveTo(x + len - 9, y - 8); ctx.lineTo(x + len, y); ctx.lineTo(x + len - 9, y + 8); ctx.stroke(); ctx.restore();
  }

  function vignette(strength = 0.55) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${strength})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  // ---------- data: circuit ----------
  const TRACK = (() => {
    const P = [
      [820, 262], [1140, 246], [1460, 240], [1600, 256], [1676, 318], [1660, 398], [1560, 440],
      [1450, 488], [1440, 570], [1540, 628], [1690, 690], [1740, 790], [1690, 896], [1540, 940],
      [1300, 940], [1180, 900], [1110, 820], [1010, 800], [940, 860], [880, 940], [760, 950],
      [690, 880], [700, 780], [780, 700], [740, 600], [690, 470], [720, 340],
    ];
    const SEG = 36, pts = [], n0 = P.length;
    for (let i = 0; i < n0; i++) {
      const p0 = P[(i - 1 + n0) % n0], p1 = P[i], p2 = P[(i + 1) % n0], p3 = P[(i + 2) % n0];
      for (let k = 0; k < SEG; k++) {
        const t = k / SEG, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        pts.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    const n = pts.length, T = [], N = [], K = [];
    let total = 0;
    for (let i = 0; i < n; i++) total += Math.hypot(pts[(i + 1) % n][0] - pts[i][0], pts[(i + 1) % n][1] - pts[i][1]);
    for (let i = 0; i < n; i++) {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty);
      T.push([tx / l, ty / l]); N.push([-ty / l, tx / l]);
    }
    for (let i = 0; i < n; i++) {
      const t0 = T[(i - 1 + n) % n], t1 = T[(i + 1) % n];
      const ds = Math.hypot(pts[(i + 1) % n][0] - pts[(i - 1 + n) % n][0], pts[(i + 1) % n][1] - pts[(i - 1 + n) % n][1]);
      K.push((t0[0] * t1[1] - t0[1] * t1[0]) / ds);
    }
    const smooth = (arr, w) => arr.map((_, i) => { let s = 0; for (let k = -w; k <= w; k++) s += arr[(i + k + n) % n]; return s / (2 * w + 1); });
    const k1 = smooth(K, 9), k2 = smooth(K, 34);
    const raw = k1.map((v, i) => v - 0.8 * k2[i]);
    const G = 1 / (Math.max(...raw.map(Math.abs)) * 0.55);
    const HW = 17;
    const ideal = smooth(raw.map(v => clamp(v * G, -1, 1) * HW * 0.8), 6);
    const you = ideal.map((v, i) => clamp(v * 0.55 + HW * 0.42 * Math.sin(i / n * TAU * 5 + 1.1) * Math.sin(i / n * TAU * 2 + 0.4), -HW * 0.9, HW * 0.9));
    // corners = peaks of |curvature|
    const corners = [];
    for (let i = 0; i < n; i++) {
      const v = Math.abs(k1[i]);
      if (v < 0.0042) continue;
      let peak = true;
      for (let k = -14; k <= 14; k++) if (k && Math.abs(k1[(i + k + n) % n]) > v) { peak = false; break; }
      if (peak && !corners.some(c => Math.min(Math.abs(c - i), n - Math.abs(c - i)) < 30)) corners.push(i);
    }
    corners.sort((a, b) => a - b);
    return { pts, n, N, k1, total, ideal, you, corners, HW };
  })();

  function trackPath(off, from = 0, to = TRACK.n) {
    const { pts, N, n } = TRACK;
    ctx.beginPath();
    for (let j = from; j <= to; j++) {
      const i = ((j % n) + n) % n, o = off ? off[i] : 0;
      const x = pts[i][0] + N[i][0] * o, y = pts[i][1] + N[i][1] * o;
      j === from ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
  }
  const trackPoint = (off, j) => {
    const { pts, N, n } = TRACK; const i = ((Math.floor(j) % n) + n) % n; const o = off ? off[i] : 0;
    return [pts[i][0] + N[i][0] * o, pts[i][1] + N[i][1] * o];
  };

  // ---------- data: a synthetic lap ----------
  const LAP = (() => {
    const corners = [[0.10, 92], [0.24, 148], [0.33, 78], [0.5, 176], [0.63, 104], [0.76, 152], [0.88, 118]];
    const ghostDelta = [5, 8, 4, 7, 9, 3, 6];
    const B = 2.4e6, A = 6.2e5, VMAX = 286, NS = 700;
    const at = (x, mins) => {
      let v = VMAX, branch = 'top', vmin = 0;
      corners.forEach(([c], i) => {
        for (const off of [-1, 0, 1]) {
          const d = x - (c + off), m = mins[i];
          const vv = d < 0 ? Math.sqrt(m * m + B * -d) : Math.sqrt(m * m + A * d);
          if (vv < v) { v = vv; branch = d < 0 ? 'brake' : 'accel'; vmin = m; }
        }
      });
      return { v, branch, vmin };
    };
    const sp = [], gh = [], th = [], br = [];
    for (let i = 0; i < NS; i++) {
      const x = i / (NS - 1);
      const a = at(x, corners.map(c => c[1]));
      sp.push(a.v);
      gh.push(at(x, corners.map((c, j) => c[1] - ghostDelta[j])).v);
      if (a.branch === 'brake') { br.push(100 * Math.pow(clamp((a.v - a.vmin) / 120), 0.55)); th.push(0); }
      else if (a.branch === 'accel') { br.push(0); th.push(100 * clamp((a.v - a.vmin) / 34) ** 0.8); }
      else { br.push(0); th.push(100); }
    }
    const sm = (arr, w) => arr.map((_, i) => { let a = 0, c = 0; for (let k = -w; k <= w; k++) { const v = arr[i + k]; if (v !== undefined) { a += v; c++; } } return a / c; });
    return { sp: sm(sp, 7), gh: sm(gh, 7), th: sm(th, 2), br: sm(br, 2), NS };
  })();

  // ---------- scenes ----------
  const S = [];
  const scene = o => S.push(o);

  // 01 — speedometer
  scene({
    id: 'gauge', dur: 2.0, bg: '#0A0B0D', fg: '#ECECE6', accent: C.orange, label: 'VELOCIDADE',
    draw(t) {
      const fg = this.fg, cx = 960, cy = 548, R = 286;
      const A0 = Math.PI * 0.75, SW = Math.PI * 1.5, VM = 300;
      const z = 1 + 0.04 * ease.inOutSine(prog(t, 1.25, 2.0));
      ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z);
      const rings = [[R + 48, 1, 0.2, TAU], [R, 1.5, 0.5, SW], [R - 80, 1, 0.22, SW], [58, 1, 0.3, TAU]];
      rings.forEach(([r, w, a, sw], i) => {
        const p = ease.outExpo(prog(t, 0.04 + i * 0.07, 0.8 + i * 0.07)); if (p <= 0) return;
        ctx.beginPath(); sw === TAU ? ctx.arc(0, 0, r * (0.75 + 0.25 * p), 0, TAU) : ctx.arc(0, 0, r * (0.75 + 0.25 * p), A0, A0 + sw * p);
        ctx.strokeStyle = rgba(fg, a * p); ctx.lineWidth = w; ctx.stroke();
      });
      for (let i = 0; i <= 60; i++) {
        const st = 0.14 + i * 0.008, p = ease.outCubic(prog(t, st, st + 0.3)); if (p <= 0) continue;
        const major = i % 6 === 0, a = A0 + (SW * i) / 60, r1 = R - 8, r0 = r1 - (major ? 30 : 13) * p;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.strokeStyle = rgba(fg, major ? 0.9 : 0.4); ctx.lineWidth = major ? 3 : 1.5; ctx.stroke();
        if (major) {
          mono(17, 500, 0.02); ctx.fillStyle = rgba(fg, 0.7 * p); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(i * 5), Math.cos(a) * (R - 64), Math.sin(a) * (R - 64));
        }
      }
      let v = 287 * ease.inOutCubic(prog(t, 0.55, 1.55));
      if (t > 1.55) v += Math.sin(t * 47) * 0.8 + Math.sin(t * 29) * 0.5;
      const va = A0 + (SW * v) / VM;
      if (v > 0.5) {
        ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R + 22, A0, va); ctx.strokeStyle = C.orange; ctx.lineWidth = 7; ctx.lineCap = 'round';
        ctx.shadowColor = C.orange; ctx.shadowBlur = 26; ctx.stroke(); ctx.restore();
        // red zone
        ctx.beginPath(); ctx.arc(0, 0, R + 22, A0 + SW * 0.9, A0 + SW); ctx.strokeStyle = rgba(fg, 0.18); ctx.lineWidth = 7; ctx.stroke();
      }
      const np = ease.outExpo(prog(t, 0.32, 0.8));
      if (np > 0) {
        ctx.save(); ctx.rotate(va); ctx.globalAlpha = np; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-36, 0); ctx.lineTo((R - 34) * np, 0); ctx.strokeStyle = fg; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
        ctx.beginPath(); ctx.arc(0, 0, 13 * np, 0, TAU); ctx.fillStyle = C.orange; ctx.fill();
      }
      const rp = ease.outExpo(prog(t, 0.45, 0.95));
      if (rp > 0) {
        ctx.globalAlpha = rp; font(900, 92, F.sans, 'expanded'); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillText(pad(Math.round(v), 3), 0, 196 + (1 - rp) * 24);
        mono(15, 500, 0.35); ctx.fillStyle = rgba(fg, 0.55); ctx.fillText('KM/H', 0, 232); ctx.globalAlpha = 1;
      }
      ctx.restore();
      // side telemetry
      const side = [
        [300, 'MARCHA', String(Math.min(6, 1 + Math.floor(v / 52)))], [300, 'RPM', (6200 + Math.round((v % 52) / 52 * 2100)).toLocaleString('pt-BR')], [300, 'ACEL.', fmt(1.1 + 0.25 * Math.sin(t * 3), 2) + ' G'],
        [1620, 'VOLTA', '03 / 18'], [1620, 'SETOR', 'S1'], [1620, 'DELTA', '−0,12 s'],
      ];
      side.forEach(([x, k, val], i) => {
        const p = ease.outExpo(prog(t, 0.6 + (i % 3) * 0.08, 1.2 + (i % 3) * 0.08)); if (p <= 0) return;
        const y = 470 + (i % 3) * 72; ctx.globalAlpha = p;
        ctx.textAlign = x < 960 ? 'left' : 'right'; ctx.textBaseline = 'alphabetic';
        mono(12, 500, 0.25); ctx.fillStyle = rgba(fg, 0.45); ctx.fillText(k, x + (x < 960 ? -1 : 1) * (1 - p) * 30, y);
        mono(26, 500, 0.02); ctx.fillStyle = k === 'DELTA' ? C.orange : fg; ctx.fillText(val, x + (x < 960 ? -1 : 1) * (1 - p) * 30, y + 34);
        ctx.globalAlpha = 1;
      });
      vignette(0.5);
    },
  });

  // 02 — light streak
  scene({
    id: 'streak', dur: 1.0, bg: '#06080F', fg: '#DCE3F0', accent: C.orange, label: 'ACELERAÇÃO',
    draw(t) {
      const cy = 540;
      ctx.strokeStyle = 'rgba(220,227,240,0.07)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = 0; x <= W; x += 60) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
      for (let y = 0; y <= H; y += 60) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
      ctx.stroke();
      const sp = ease.outExpo(prog(t, 0.18, 0.5));
      if (t < 0.24) {
        const r = 6 + 3 * Math.sin(t * 50);
        ctx.save(); ctx.shadowColor = C.orange; ctx.shadowBlur = 30; ctx.fillStyle = '#FFE9DC';
        ctx.beginPath(); ctx.arc(960, cy, r, 0, TAU); ctx.fill(); ctx.restore();
      }
      if (sp > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const fade = 1 - 0.35 * prog(t, 0.6, 1.0);
        const glow = (sx, sy, stops) => {
          ctx.save(); ctx.translate(960, cy); ctx.scale(sx / 100, sy / 100);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
          stops.forEach(([o, c]) => g.addColorStop(o, c)); ctx.fillStyle = g; ctx.fillRect(-100, -100, 200, 200); ctx.restore();
        };
        glow(W * 0.75 * sp, lerp(10, 150, sp) * fade, [[0, 'rgba(255,120,60,0.85)'], [0.45, 'rgba(255,91,31,0.35)'], [1, 'rgba(255,91,31,0)']]);
        glow(W * 0.62 * sp, lerp(4, 34, sp) * fade, [[0, 'rgba(255,248,240,1)'], [0.5, 'rgba(255,190,150,0.7)'], [1, 'rgba(255,140,90,0)']]);
        const R = rng(7);
        for (let i = 0; i < 150; i++) {
          const g0 = R() - 0.5, g1 = R();
          const y = cy + g0 * g1 * 760, len = 80 + R() * 560, v = 2600 + R() * 3600, x0 = R() * (W + 900);
          const warm = R() < 0.3, thick = R() < 0.2, al = 0.15 + 0.6 * R();
          const x = (((x0 - v * t) % (W + 900)) + (W + 900)) % (W + 900) - 450;
          const a = al * sp * Math.exp(-Math.abs(y - cy) / 260);
          const col = warm ? '255,130,70' : '230,236,255';
          const g = ctx.createLinearGradient(x, 0, x + len, 0);
          g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
          ctx.strokeStyle = g; ctx.lineWidth = thick ? 2 : 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
        }
        ctx.restore();
      }
      const tp = ease.outExpo(prog(t, 0.32, 0.8));
      if (tp > 0) {
        ctx.globalAlpha = tp; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        mono(14, 500, 0.3); ctx.fillStyle = rgba(this.fg, 0.6); ctx.fillText('0 — 100 KM/H', 150, 790 + (1 - tp) * 20);
        font(900, 150, F.sans, 'expanded'); ctx.fillStyle = this.fg; ctx.fillText('2,9', 142, 930 + (1 - tp) * 40);
        const w = ctx.measureText('2,9').width; serif(110); ctx.fillStyle = C.orange; ctx.fillText('s', 142 + w + 10, 930 + (1 - tp) * 40);
        ctx.textAlign = 'right'; mono(14, 500, 0.3); ctx.fillStyle = rgba(this.fg, 0.6);
        ctx.fillText('LARGADA · CONTROLE DE TRAÇÃO ATIVO', 1770, 930); ctx.globalAlpha = 1;
      }
      vignette(0.6);
    },
  });

  // 03 — title card
  scene({
    id: 'title', dur: 2.0, bg: C.orange, fg: '#150A05', accent: '#150A05', label: 'IDENTIDADE',
    draw(t) {
      const z = 1 + 0.025 * prog(t, 0.6, 2.0);
      ctx.save(); ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-960, -540);
      const size = 196, opts = { stretch: 'expanded' };
      const w1 = textWidth('ACC DRIVE', size, opts), w2 = textWidth('INSIGHT.', size, opts);
      const x0 = (W - Math.max(w1, w2)) / 2, y1 = 520, y2 = 700;
      ctx.fillStyle = this.fg; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      const mp = ease.outExpo(prog(t, 0.0, 0.5));
      ctx.globalAlpha = mp; mono(16, 500, 0.3);
      ctx.fillText('TELEMETRIA', x0 + 4, 330);
      const lw = ctx.measureText('TELEMETRIA').width;
      ctx.fillRect(x0 + lw + 24, 324, 120 * mp, 1.5);
      ctx.fillText('2026', x0 + lw + 160, 330); ctx.globalAlpha = 1;
      reveal('ACC DRIVE', x0, y1, size, t, 0.06, opts);
      reveal('INSIGHT.', x0, y2, size, t, 0.24, opts);
      const sp = ease.outExpo(prog(t, 0.75, 1.4));
      if (sp > 0) {
        serif(104); ctx.fillStyle = C.cream; ctx.textAlign = 'right'; ctx.globalAlpha = sp;
        ctx.fillText('seu copiloto de dados', x0 + Math.max(w1, w2) + (1 - sp) * 60, y2 + 104); ctx.globalAlpha = 1;
      }
      ctx.restore();
    },
  });

  // 04 — circuit + racing line
  scene({
    id: 'track', dur: 2.0, bg: C.ice, fg: '#0E1A22', accent: C.orange, label: 'TRAÇADO',
    draw(t) {
      const fg = this.fg, { n, HW, corners, ideal, you, N, k1, pts } = TRACK;
      const hp = ease.outExpo(prog(t, 0.0, 0.55));
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.globalAlpha = hp; serif(76); ctx.fillStyle = fg; ctx.fillText('Cada curva,', 140 - (1 - hp) * 40, 250); ctx.fillText('decifrada.', 140 - (1 - hp) * 40, 326);
      ctx.globalAlpha = 1;
      // legend
      const lg = [['IDEAL', C.blue, 'dash'], ['VOCÊ', C.orange, 'solid'], ['FRENAGEM', C.red, 'tick']];
      lg.forEach(([k, col, kind], i) => {
        const p = ease.outExpo(prog(t, 0.2 + i * 0.07, 0.7 + i * 0.07)); if (p <= 0) return;
        const y = 410 + i * 36; ctx.globalAlpha = p;
        ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash(kind === 'dash' ? [8, 6] : []);
        ctx.beginPath();
        if (kind === 'tick') { for (let k = 0; k < 3; k++) { ctx.moveTo(146 + k * 9, y - 9); ctx.lineTo(146 + k * 9, y + 3); } } else { ctx.moveTo(144, y - 3); ctx.lineTo(180, y - 3); }
        ctx.stroke(); ctx.setLineDash([]);
        mono(13, 500, 0.2); ctx.fillStyle = rgba(fg, 0.75); ctx.fillText(k, 198, y + 2); ctx.globalAlpha = 1;
      });
      // road
      const rp = ease.inOutCubic(prog(t, 0.0, 0.8));
      const L = TRACK.total;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.setLineDash([L * rp, L * 2]);
      trackPath(null); ctx.strokeStyle = fg; ctx.lineWidth = HW * 2 + 6; ctx.stroke();
      trackPath(null); ctx.strokeStyle = '#C9D7DE'; ctx.lineWidth = HW * 2 - 2; ctx.stroke();
      ctx.setLineDash([]);
      // start / finish
      if (rp > 0.02) {
        const [x, y] = pts[0], nn = N[0];
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(nn[1], nn[0]));
        for (let a = 0; a < 6; a++) for (let b = 0; b < 2; b++) { ctx.fillStyle = (a + b) % 2 ? fg : '#fff'; ctx.fillRect(-HW + a * (HW / 3), -6 + b * 6, HW / 3, 6); }
        ctx.restore();
      }
      // lines
      const ip = ease.inOutCubic(prog(t, 0.45, 1.25)), yp = ease.inOutCubic(prog(t, 0.55, 1.35));
      if (ip > 0) { ctx.setLineDash([10, 8]); trackPath(ideal, 0, Math.floor(n * ip)); ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]); }
      if (yp > 0) { trackPath(you, 0, Math.floor(n * yp)); ctx.strokeStyle = C.orange; ctx.lineWidth = 3.5; ctx.stroke(); }
      // corners
      corners.forEach((c, i) => {
        const p = ease.outBack(prog(t, 0.55 + i * 0.045, 0.85 + i * 0.045)); if (p <= 0) return;
        const s = -Math.sign(k1[c]);
        const x = pts[c][0] + N[c][0] * s * (HW + 36), y = pts[c][1] + N[c][1] * s * (HW + 36);
        ctx.beginPath(); ctx.arc(x, y, 16 * p, 0, TAU); ctx.fillStyle = fg; ctx.fill();
        if (p > 0.6) { mono(13, 700, 0); ctx.fillStyle = C.ice; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), x, y + 1); }
        // brake markers before the corner
        ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.lineCap = 'butt'; ctx.beginPath();
        for (let k = 0; k < 3; k++) {
          const j = (c - 16 - k * 4 + n) % n; const [px, py] = pts[j], [nx, ny] = N[j], q = HW * 0.75 * clamp(p);
          ctx.moveTo(px - nx * q, py - ny * q); ctx.lineTo(px + nx * q, py + ny * q);
        }
        ctx.stroke(); ctx.lineCap = 'round';
      });
      // car + trail
      const cp = prog(t, 0.8, 2.0);
      if (cp > 0) {
        const head = n * 0.08 + cp * n * 0.42;
        for (let k = 0; k < 70; k++) {
          const a = trackPoint(you, head - k - 1), b = trackPoint(you, head - k);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.strokeStyle = rgba(C.orange, 1 - k / 70); ctx.lineWidth = 7 * (1 - k / 90); ctx.stroke();
        }
        const [x, y] = trackPoint(you, head);
        ctx.save(); ctx.shadowColor = C.orange; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
        ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fillStyle = C.orange; ctx.fill();
      }
      // delta tag
      const dp = ease.outBack(prog(t, 1.25, 1.6));
      if (dp > 0 && corners.length > 2) {
        const c = corners[2], [x, y] = pts[c];
        ctx.save(); ctx.translate(x - 230, y - 20); ctx.scale(dp, dp);
        ctx.fillStyle = fg; ctx.beginPath(); ctx.roundRect(-10, -26, 196, 44, 22); ctx.fill();
        mono(15, 600, 0.06); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('CURVA 3', 10, -3);
        ctx.fillStyle = C.lime; ctx.fillText('−0,18 s', 98, -3); ctx.restore();
      }
      // lap time
      const lp = ease.outExpo(prog(t, 0.9, 1.4));
      if (lp > 0) {
        ctx.globalAlpha = lp; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        mono(13, 500, 0.3); ctx.fillStyle = rgba(fg, 0.6); ctx.fillText('MELHOR VOLTA', 144, 852);
        font(900, 74, F.sans, 'expanded'); ctx.fillStyle = fg; ctx.fillText('1:47.218', 140, 930 + (1 - lp) * 24); ctx.globalAlpha = 1;
      }
    },
  });

  // 05 — telemetry traces
  scene({
    id: 'traces', dur: 2.0, bg: C.paper, fg: '#121212', accent: C.orange, label: 'TELEMETRIA',
    draw(t) {
      const fg = this.fg, x0 = 170, x1 = 1750, { NS } = LAP;
      const hp = ease.outExpo(prog(t, 0, 0.5));
      ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = hp;
      serif(68); ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.fillText('Cada metro, medido.', x0 - (1 - hp) * 30, 190);
      mono(13, 500, 0.25); ctx.textAlign = 'right'; ctx.fillStyle = rgba(fg, 0.6); ctx.fillText('VOLTA 14  vs.  VOLTA 09', x1, 132);
      ctx.globalAlpha = 1;
      const rev = ease.inOutCubic(prog(t, 0.2, 1.8));
      const rows = [
        { k: 'sp', g: 'gh', label: 'VELOCIDADE · KM/H', y0: 250, h: 300, min: 60, max: 300, col: fg, area: false, unit: '' },
        { k: 'th', label: 'ACELERADOR · %', y0: 610, h: 140, min: 0, max: 100, col: C.green, area: true, unit: '%' },
        { k: 'br', label: 'FREIO · %', y0: 800, h: 140, min: 0, max: 100, col: C.red, area: true, unit: '%' },
      ];
      const cur = Math.max(1, Math.floor(rev * (NS - 1)));
      const X = i => lerp(x0, x1, i / (NS - 1));
      rows.forEach((r, ri) => {
        const ap = ease.outExpo(prog(t, 0.05 + ri * 0.08, 0.6 + ri * 0.08)); if (ap <= 0) return;
        const Y = v => r.y0 + r.h - ((v - r.min) / (r.max - r.min)) * r.h;
        ctx.globalAlpha = ap;
        mono(12, 600, 0.22); ctx.fillStyle = rgba(fg, 0.55); ctx.textAlign = 'left'; ctx.fillText(r.label, x0, r.y0 - 16);
        ctx.strokeStyle = rgba(fg, 0.14); ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(x0, r.y0 + r.h + 0.5); ctx.lineTo(x0 + (x1 - x0) * ap, r.y0 + r.h + 0.5); ctx.stroke();
        ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.moveTo(x0, r.y0 + 0.5); ctx.lineTo(x0 + (x1 - x0) * ap, r.y0 + 0.5); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        const data = LAP[r.k];
        if (r.g) {
          ctx.beginPath(); for (let i = 0; i <= Math.min(NS - 1, cur + 40); i++) i ? ctx.lineTo(X(i), Y(LAP[r.g][i])) : ctx.moveTo(X(i), Y(LAP[r.g][i]));
          ctx.setLineDash([6, 6]); ctx.strokeStyle = rgba(fg, 0.3); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.beginPath(); for (let i = 0; i <= cur; i++) i ? ctx.lineTo(X(i), Y(data[i])) : ctx.moveTo(X(i), Y(data[i]));
        if (r.area) {
          ctx.strokeStyle = r.col; ctx.lineWidth = 2; ctx.stroke();
          ctx.lineTo(X(cur), r.y0 + r.h); ctx.lineTo(X(0), r.y0 + r.h); ctx.closePath(); ctx.fillStyle = rgba(r.col, 0.22); ctx.fill();
        } else { ctx.strokeStyle = r.col; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke(); }
        // cursor dot + tag
        if (rev > 0.01) {
          const x = X(cur), y = Y(data[cur]);
          ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fillStyle = r.col === fg ? C.orange : r.col; ctx.fill();
          ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
          const label = Math.round(data[cur]) + r.unit;
          mono(14, 600, 0.04); const tw = ctx.measureText(label).width + 20;
          const tx = Math.min(x + 14, x1 - tw), ty = clamp(y - 32, r.y0 - 6, r.y0 + r.h - 30);
          ctx.fillStyle = fg; ctx.beginPath(); ctx.roundRect(tx, ty, tw, 26, 6); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, tx + 10, ty + 14); ctx.textBaseline = 'alphabetic';
        }
      });
      if (rev > 0.01) {
        const x = X(cur);
        ctx.strokeStyle = rgba(fg, 0.35); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 0.5, 236); ctx.lineTo(x + 0.5, 950); ctx.stroke();
      }
      // running delta
      const dlt = -0.412 * rev;
      ctx.globalAlpha = hp; font(900, 50, F.sans, 'expanded'); ctx.fillStyle = C.orange; ctx.textAlign = 'right';
      const dtxt = (dlt < 0 ? '−' : '') + fmt(Math.abs(dlt), 3) + ' s'; ctx.fillText(dtxt, x1, 192); const dw = ctx.measureText(dtxt).width;
      mono(13, 500, 0.25); ctx.fillStyle = rgba(fg, 0.55); ctx.fillText('DELTA', x1 - dw - 24, 186); ctx.globalAlpha = 1;
    },
  });

  // 06 — shift lights
  scene({
    id: 'shift', dur: 1.5, bg: C.blue, fg: '#F2F4FF', accent: C.lime, label: 'TROCA DE MARCHA',
    draw(t) {
      const fg = this.fg;
      let rpm, gear = 4;
      if (t < 1.05) rpm = lerp(4300, 8450, ease.inCubic(prog(t, 0.05, 1.05)));
      else if (t < 1.22) rpm = 8450 + Math.sin(t * 90) * 40;
      else { gear = 5; rpm = lerp(6150, 6900, prog(t, 1.22, 1.5)); }
      rpm += Math.sin(t * 61) * 25;
      const lit = Math.floor(15 * clamp((rpm - 5100) / (8300 - 5100)));
      const flash = t >= 1.05 && t < 1.22 && Math.floor(t * 24) % 2 === 0;
      const N = 15, sp = 96, x0 = 960 - ((N - 1) * sp) / 2, y = 700;
      for (let i = 0; i < N; i++) {
        const x = x0 + i * sp, on = flash || (t < 1.05 && i < lit) || (t >= 1.22 && i < lit);
        const col = flash ? '#FFFFFF' : i < 5 ? C.lime : i < 10 ? C.amber : C.red;
        const ap = ease.outBack(prog(t, i * 0.012, 0.3 + i * 0.012));
        ctx.save(); ctx.translate(x, y); ctx.scale(ap, ap);
        ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.fillStyle = '#1320C8'; ctx.fill();
        ctx.strokeStyle = rgba(fg, 0.3); ctx.lineWidth = 1.5; ctx.stroke();
        if (on) { ctx.shadowColor = col; ctx.shadowBlur = 36; ctx.beginPath(); ctx.arc(0, 0, 24, 0, TAU); ctx.fillStyle = col; ctx.fill(); }
        ctx.restore();
      }
      // gear
      const punch = t >= 1.22 ? 1 + 0.28 * (1 - ease.outCubic(prog(t, 1.22, 1.42))) : 1;
      const shake = t >= 1.22 && t < 1.32 ? Math.sin(t * 160) * 8 : 0;
      ctx.save(); ctx.translate(960 + shake, 470); ctx.scale(punch, punch);
      font(900, 330, F.sans, 'expanded'); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      const gp = ease.outExpo(prog(t, 0.0, 0.45)); ctx.globalAlpha = gp;
      ctx.fillText(String(gear), 0, 110 + (1 - gp) * 60); ctx.restore();
      ctx.globalAlpha = 1;
      mono(14, 500, 0.35); ctx.textAlign = 'center'; ctx.fillStyle = rgba(fg, 0.65); ctx.fillText('MARCHA', 960, 230);
      mono(30, 500, 0.06); ctx.fillStyle = fg; ctx.fillText(Math.round(rpm).toLocaleString('pt-BR') + ' RPM', 960, 815);
      if (t >= 1.05 && t < 1.3) { mono(16, 700, 0.4); ctx.fillStyle = C.lime; ctx.fillText('SHIFT', 960, 860); }
    },
  });

  // 07 — checkered flag
  scene({
    id: 'flag', dur: 1.0, bg: '#08080A', fg: '#EDEDED', accent: C.orange, label: 'VOLTA CONCLUÍDA',
    draw(t) {
      const cols = 26, rows = 15, cs = 70, gx = (W - cols * cs) / 2, gy = (H - rows * cs) / 2;
      const V = [];
      for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
        const ph = i * 0.42 - t * 10 + j * 0.16, amp = i / cols * 0.85 + 0.15;
        V.push([gx + i * cs + Math.cos(j * 0.35 - t * 6) * 7 * amp, gy + j * cs + Math.sin(ph) * 26 * amp, Math.cos(ph)]);
      }
      const bx = lerp(-500, W + 500, ease.inOutCubic(prog(t, 0.0, 0.95)));
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const a = V[j * (cols + 1) + i], b = V[j * (cols + 1) + i + 1], c = V[(j + 1) * (cols + 1) + i + 1], d = V[(j + 1) * (cols + 1) + i];
        const shade = 0.5 + 0.5 * a[2], light = (i + j) % 2 === 0;
        const m = Math.exp(-(((a[0] - bx) / 240) ** 2));
        let col;
        if (light) col = mixRGB('#F2F2F0', '#6E6E6E', (1 - shade) * 0.7), col = col.map((v, k) => Math.round(v + (hex(C.orange)[k] - v) * m));
        else col = mixRGB('#121214', '#2E2E30', shade).map((v, k) => Math.round(v + (hex('#3A1406')[k] - v) * m * 0.8));
        const cstr = `rgb(${col.join(',')})`;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
        ctx.fillStyle = cstr; ctx.fill(); ctx.strokeStyle = cstr; ctx.lineWidth = 0.8; ctx.stroke();
      }
      vignette(0.65);
      const p = ease.outExpo(prog(t, 0.15, 0.6));
      ctx.globalAlpha = p; ctx.fillStyle = '#08080A'; ctx.beginPath(); ctx.roundRect(960 - 250, 512, 500, 56, 28); ctx.fill();
      mono(17, 600, 0.3); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('VOLTA 14 · 1:47.218', 960, 541);
      ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';
    },
  });

  // 08 — tyre temperature surface
  scene({
    id: 'heat', dur: 1.5, bg: '#0C0E12', fg: '#E6E8EC', accent: C.orange, label: 'PNEUS',
    draw(t) {
      const fg = this.fg, n = 22, s = 30, ox = 1080, oy = 300;
      const stops = ['#1B2CFF', '#7B3CFF', '#FF5B1F', '#FFE2C8'];
      const ramp = v => { v = clamp(v) * (stops.length - 1); const i = Math.min(stops.length - 2, Math.floor(v)); return mixRGB(stops[i], stops[i + 1], v - i); };
      const hf = (i, j) => {
        const u = i / (n - 1) - 0.5, v = j / (n - 1) - 0.5, r = Math.hypot(u, v);
        return 10 + 150 * Math.exp(-(((u - 0.18 * Math.sin(t * 2.4)) ** 2 + (v + 0.12 * Math.cos(t * 2)) ** 2) / 0.028)) + 48 * (0.5 + 0.5 * Math.sin(r * 17 - t * 7));
      };
      const shadeRGB = (c, k) => `rgb(${c.map(v => Math.round(v * k)).join(',')})`;
      const q = 0.86;
      for (let d = 0; d <= 2 * (n - 1); d++) for (let i = 0; i < n; i++) {
        const j = d - i; if (j < 0 || j >= n) continue;
        const g = ease.outExpo(prog(t, (i + j) * 0.012, 0.55 + (i + j) * 0.012)); if (g <= 0) continue;
        const h = hf(i, j) * g, X = ox + (i - j) * s * 0.866, Y = oy + (i + j) * s * 0.5;
        const dx = s * 0.866 * q, dy = s * 0.5 * q;
        const col = ramp((h / g - 10) / 190);
        const Nn = [X, Y - dy], E = [X + dx, Y], So = [X, Y + dy], Wt = [X - dx, Y];
        ctx.beginPath(); ctx.moveTo(Wt[0], Wt[1]); ctx.lineTo(So[0], So[1]); ctx.lineTo(So[0], So[1] - h); ctx.lineTo(Wt[0], Wt[1] - h); ctx.closePath(); ctx.fillStyle = shadeRGB(col, 0.55); ctx.fill();
        ctx.beginPath(); ctx.moveTo(So[0], So[1]); ctx.lineTo(E[0], E[1]); ctx.lineTo(E[0], E[1] - h); ctx.lineTo(So[0], So[1] - h); ctx.closePath(); ctx.fillStyle = shadeRGB(col, 0.75); ctx.fill();
        ctx.beginPath(); ctx.moveTo(Nn[0], Nn[1] - h); ctx.lineTo(E[0], E[1] - h); ctx.lineTo(So[0], So[1] - h); ctx.lineTo(Wt[0], Wt[1] - h); ctx.closePath(); ctx.fillStyle = shadeRGB(col, 1); ctx.fill();
      }
      const hp = ease.outExpo(prog(t, 0, 0.5));
      ctx.globalAlpha = hp; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      serif(70); ctx.fillStyle = fg; ctx.fillText('Pneus na', 140 - (1 - hp) * 30, 260); ctx.fillText('janela ideal.', 140 - (1 - hp) * 30, 336);
      mono(13, 500, 0.25); ctx.fillStyle = rgba(fg, 0.55); ctx.fillText('TEMPERATURA DA BANDA · °C', 144, 392);
      // legend
      const lgx = 144, lgy = 470, lgw = 300, grad = ctx.createLinearGradient(lgx, 0, lgx + lgw, 0);
      stops.forEach((c, i) => grad.addColorStop(i / (stops.length - 1), c));
      ctx.fillStyle = grad; ctx.fillRect(lgx, lgy, lgw * hp, 8);
      mono(12, 500, 0.1); ctx.fillStyle = rgba(fg, 0.6);
      ['70°', '85°', '100°', '115°'].forEach((l, i) => { ctx.textAlign = i === 0 ? 'left' : i === 3 ? 'right' : 'center'; ctx.fillText(l, lgx + (lgw * i) / 3, lgy + 32); });
      ctx.globalAlpha = 1;
      const tyres = [['DE', 86], ['DD', 91], ['TE', 83], ['TD', 88]];
      tyres.forEach(([k, v], i) => {
        const p = ease.outExpo(prog(t, 0.3 + i * 0.07, 0.8 + i * 0.07)); if (p <= 0) return;
        const x = 144 + (i % 2) * 170, y = 640 + Math.floor(i / 2) * 150;
        ctx.globalAlpha = p;
        ctx.strokeStyle = rgba(fg, 0.25); ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x, y, 150, 124, 10); ctx.stroke();
        mono(12, 600, 0.25); ctx.fillStyle = rgba(fg, 0.55); ctx.textAlign = 'left'; ctx.fillText(k, x + 16, y + 30);
        font(900, 46, F.sans, 'expanded'); ctx.fillStyle = v > 90 ? C.orange : fg;
        ctx.fillText(Math.round(v + Math.sin(t * 5 + i) * 1.2) + '°', x + 14, y + 96);
        ctx.globalAlpha = 1;
      });
      vignette(0.45);
    },
  });

  // 09 — kinetic type
  scene({
    id: 'apex', dur: 1.0, bg: C.lime, fg: '#0A0A0A', accent: '#0A0A0A', label: 'PONTO DE TANGÊNCIA',
    draw(t) {
      const size = 150; font(900, size, F.sans, 'expanded');
      const word = 'APEX', ww = ctx.measureText(word).width + size * 0.45;
      const zoom = lerp(1.18, 1, ease.outExpo(prog(t, 0, 0.7)));
      ctx.save(); ctx.translate(960, 540); ctx.scale(zoom, zoom); ctx.transform(1, 0, -0.14, 1, 0, 0); ctx.translate(-960, -540);
      const rows = 7, rh = 152, y0 = 540 - 3 * rh + 54;
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
      for (let r = 0; r < rows; r++) {
        const y = y0 + r * rh, dir = r % 2 ? 1 : -1;
        const speed = 420 + Math.abs(r - 3) * 90;
        const off = (((r * 173 + dir * t * speed) % ww) + ww) % ww;
        for (let x = -ww * 2 + off; x < W + ww * 2; x += ww) {
          if (r === 3) { ctx.fillStyle = this.fg; ctx.fillText(word, x, y); }
          else { ctx.strokeStyle = rgba(this.fg, 0.85); ctx.lineWidth = 2.2; ctx.strokeText(word, x, y); }
        }
      }
      ctx.restore();
      // pill
      const p = ease.outBack(prog(t, 0.25, 0.6));
      if (p > 0) {
        ctx.save(); ctx.translate(960, 800); ctx.scale(p, p);
        ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.roundRect(-230, -30, 460, 60, 30); ctx.fill();
        mono(17, 600, 0.25); ctx.fillStyle = C.lime; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CURVA 4 · 92 KM/H', 0, 1); ctx.restore();
      }
    },
  });

  // 10 — dashboard
  scene({
    id: 'dash', dur: 2.0, bg: C.paper, fg: '#111', accent: C.orange, label: 'DESEMPENHO',
    draw(t) {
      const fg = this.fg;
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      const a0 = ease.outExpo(prog(t, 0, 0.4));
      ctx.globalAlpha = a0; mono(14, 500, 0.25); ctx.fillStyle = rgba(fg, 0.55); ctx.fillText('GANHO POR VOLTA — STINT 2', 150, 250); ctx.globalAlpha = 1;
      const cnt = 0.412 * ease.outExpo(prog(t, 0.15, 1.15));
      font(900, 170, F.sans, 'expanded'); ctx.fillStyle = fg;
      const num = '−' + fmt(cnt, 3); ctx.fillText(num, 140, 420);
      const nw = ctx.measureText(num).width; font(900, 170, F.sans, 'expanded'); ctx.fillStyle = C.orange; ctx.fillText('s', 140 + nw + 12, 420);
      ctx.globalAlpha = a0; mono(14, 500, 0.15); ctx.fillStyle = rgba(fg, 0.5); ctx.fillText('vs. sua média das últimas 10 voltas', 150, 470); ctx.globalAlpha = 1;
      // ring
      const rp = ease.outCubic(prog(t, 0.35, 1.35)), rx = 330, ry = 730, rr = 112;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(rx, ry, rr, 0, TAU); ctx.strokeStyle = rgba(fg, 0.1); ctx.lineWidth = 20; ctx.stroke();
      if (rp > 0) { ctx.beginPath(); ctx.arc(rx, ry, rr, -Math.PI / 2, -Math.PI / 2 + TAU * 0.92 * rp); ctx.strokeStyle = C.orange; ctx.lineWidth = 20; ctx.stroke(); }
      font(900, 54, F.sans, 'expanded'); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.fillText(Math.round(92 * rp) + '%', rx, ry + 12);
      mono(11, 600, 0.3); ctx.fillStyle = rgba(fg, 0.55); ctx.fillText('CONSISTÊNCIA', rx, ry + 42);
      // bar chart
      const laps = [109.8, 109.2, 108.9, 108.4, 108.6, 108.0, 107.8, 107.9, 107.5, 107.6, 107.4, 107.218];
      const cx0 = 780, cx1 = 1760, cy0 = 300, cy1 = 860, bw = 46, gap = (cx1 - cx0 - bw * laps.length) / (laps.length - 1);
      ctx.textAlign = 'left'; mono(13, 500, 0.25); ctx.fillStyle = rgba(fg, 0.55); ctx.globalAlpha = a0; ctx.fillText('RITMO POR VOLTA', cx0, cy0 - 40);
      ctx.strokeStyle = rgba(fg, 0.1); ctx.lineWidth = 1;
      for (let k = 0; k <= 4; k++) { const y = cy0 + ((cy1 - cy0) * k) / 4 + 0.5; ctx.beginPath(); ctx.moveTo(cx0, y); ctx.lineTo(cx1, y); ctx.stroke(); }
      ctx.globalAlpha = 1;
      const tops = [];
      laps.forEach((lt, i) => {
        const p = ease.outExpo(prog(t, 0.2 + i * 0.05, 0.85 + i * 0.05));
        const h = ((111 - lt) / (111 - 107)) * (cy1 - cy0) * 0.92 * p, x = cx0 + i * (bw + gap);
        ctx.fillStyle = i === laps.length - 1 ? C.orange : fg; ctx.fillRect(x, cy1 - h, bw, h);
        tops.push([x + bw / 2, cy1 - h - 26]);
        mono(11, 500, 0.1); ctx.fillStyle = rgba(fg, 0.5); ctx.textAlign = 'center'; ctx.fillText('V' + (i + 1), x + bw / 2, cy1 + 28);
      });
      const lp = ease.inOutCubic(prog(t, 0.7, 1.5));
      if (lp > 0) {
        const upto = lp * (tops.length - 1);
        ctx.beginPath(); ctx.moveTo(tops[0][0], tops[0][1]);
        for (let i = 1; i <= Math.ceil(upto); i++) {
          const f = Math.min(1, upto - (i - 1)), a = tops[i - 1], b = tops[i];
          const mx = lerp(a[0], b[0], f), my = lerp(a[1], b[1], f);
          ctx.bezierCurveTo(lerp(a[0], b[0], 0.5 * f), a[1], lerp(a[0], b[0], 0.5 * f), my, mx, my);
        }
        ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.stroke();
      }
      const tp = ease.outBack(prog(t, 1.35, 1.7));
      if (tp > 0) {
        const [x, y] = tops[tops.length - 1];
        ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fillStyle = C.blue; ctx.fill();
        ctx.save(); ctx.translate(x - 20, y - 50); ctx.scale(tp, tp);
        ctx.fillStyle = fg; ctx.beginPath(); ctx.roundRect(-200, -24, 220, 46, 23); ctx.fill();
        mono(15, 600, 0.05); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('1:47.218 · RECORDE', -90, 0);
        ctx.restore(); ctx.textBaseline = 'alphabetic';
      }
    },
  });

  // 11 — aero flow around the car
  const CAR = { x: 560, ground: 720, len: 760 };
  const carTop = [[0, -40], [16, -72], [110, -96], [250, -112], [330, -140], [400, -172], [480, -188], [570, -178], [650, -150], [720, -128], [760, -120]];
  const carHeight = lx => {
    if (lx <= 0 || lx >= CAR.len) return 0;
    for (let i = 1; i < carTop.length; i++) if (lx <= carTop[i][0]) {
      const [x0, y0] = carTop[i - 1], [x1, y1] = carTop[i]; return -lerp(y0, y1, (lx - x0) / (x1 - x0));
    }
    return 0;
  };
  const BODY = (() => {
    const from = CAR.x - 260, to = CAR.x + CAR.len + 520, arr = [];
    for (let x = from; x <= to; x++) arr.push(carHeight(x - CAR.x));
    const dil = arr.map((_, i) => { let m = 0; for (let k = -50; k <= 30; k++) m = Math.max(m, arr[clamp(i + k, 0, arr.length - 1)] || 0); return m; });
    const bl = dil.map((_, i) => { let s = 0, c = 0; for (let k = -70; k <= 70; k++) { const v = dil[i + k]; if (v !== undefined) { s += v; c++; } } return s / c; });
    const fin = bl.map((v, i) => Math.max(v, arr[i] + 16));
    // gentle decay of the wake behind the tail
    const tail = CAR.x + CAR.len - from;
    for (let i = tail; i < fin.length; i++) fin[i] = Math.max(fin[i], 120 * Math.exp(-(i - tail) / 260));
    return { from, fin };
  })();
  const bodyAt = x => { const i = Math.round(x - BODY.from); return i < 0 || i >= BODY.fin.length ? 0 : BODY.fin[i]; };
  function carPath() {
    const { x, ground: g } = CAR;
    ctx.beginPath(); ctx.moveTo(x + 10, g - 40);
    ctx.bezierCurveTo(x + 12, g - 70, x + 40, g - 90, x + 110, g - 96);
    ctx.lineTo(x + 250, g - 112);
    ctx.bezierCurveTo(x + 300, g - 118, x + 340, g - 150, x + 390, g - 170);
    ctx.bezierCurveTo(x + 440, g - 190, x + 525, g - 192, x + 575, g - 177);
    ctx.bezierCurveTo(x + 625, g - 160, x + 665, g - 140, x + 722, g - 128);
    ctx.lineTo(x + 744, g - 154); ctx.lineTo(x + 760, g - 154); ctx.lineTo(x + 752, g - 120);
    ctx.lineTo(x + 760, g - 62); ctx.bezierCurveTo(x + 760, g - 46, x + 752, g - 40, x + 740, g - 40);
    ctx.lineTo(x + 652, g - 40); ctx.arc(x + 590, g - 40, 62, 0, Math.PI, true);
    ctx.lineTo(x + 214, g - 40); ctx.arc(x + 152, g - 40, 62, 0, Math.PI, true);
    ctx.closePath();
  }
  scene({
    id: 'aero', dur: 1.5, bg: '#07080A', fg: '#E8EAEE', accent: C.orange, label: 'AERODINÂMICA',
    draw(t) {
      const fg = this.fg, g = CAR.ground, R = rng(42), NP = 1500, span = W + 500;
      const fade = ease.outCubic(prog(t, 0, 0.35));
      const pos = (x0, v, y0, tt) => {
        const x = (((x0 + v * tt) % span) + span) % span - 250;
        const hy = g - 4 - y0, bh = bodyAt(x);
        let y = g - 4 - Math.sqrt(hy * hy + bh * bh);
        const tailX = CAR.x + CAR.len;
        if (x > tailX - 40) y += Math.sin(x * 0.021 - tt * 22 + y0 * 0.07) * 16 * clamp((x - tailX + 40) / 220) * Math.exp(-hy / 140);
        return [x, y];
      };
      const paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      for (let i = 0; i < NP; i++) {
        const r0 = R(), y0 = g - 6 - Math.pow(r0, 1.5) * (g - 140), v = 1100 + R() * 900, x0 = R() * span, bucket = R();
        const a = pos(x0, v, y0, t - 0.022), b = pos(x0, v, y0, t);
        if (b[0] < a[0]) continue;
        const near = g - y0 < 330;
        paths[(near ? 2 : 0) + (bucket < 0.3 ? 1 : 0)].moveTo(a[0], a[1]), paths[(near ? 2 : 0) + (bucket < 0.3 ? 1 : 0)].lineTo(b[0], b[1]);
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      ctx.lineWidth = 1.4; ctx.strokeStyle = rgba(fg, 0.35 * fade); ctx.stroke(paths[0]);
      ctx.strokeStyle = rgba(fg, 0.75 * fade); ctx.stroke(paths[1]);
      ctx.strokeStyle = rgba(C.orange, 0.5 * fade); ctx.stroke(paths[2]);
      ctx.strokeStyle = rgba('#FFB08A', 0.9 * fade); ctx.lineWidth = 1.8; ctx.stroke(paths[3]);
      ctx.restore();
      // ground + car
      ctx.strokeStyle = rgba(fg, 0.2); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, g + 22.5); ctx.lineTo(W, g + 22.5); ctx.stroke();
      const cp = ease.inOutCubic(prog(t, 0.0, 0.7));
      carPath(); ctx.fillStyle = this.bg; ctx.fill();
      ctx.setLineDash([2600 * cp, 2600]); carPath(); ctx.strokeStyle = fg; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.stroke(); ctx.setLineDash([]);
      [[CAR.x + 152], [CAR.x + 590]].forEach(([wx]) => {
        const sp = ease.outBack(prog(t, 0.3, 0.7)); if (sp <= 0) return;
        ctx.beginPath(); ctx.arc(wx, g - 40, 50 * sp, 0, TAU); ctx.fillStyle = '#121418'; ctx.fill(); ctx.strokeStyle = fg; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(wx, g - 40, 28 * sp, 0, TAU); ctx.strokeStyle = rgba(fg, 0.5); ctx.stroke();
        ctx.save(); ctx.translate(wx, g - 40); ctx.rotate(-t * 30); ctx.strokeStyle = rgba(fg, 0.5); ctx.beginPath();
        for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); ctx.lineTo(Math.cos(a) * 27 * sp, Math.sin(a) * 27 * sp); }
        ctx.stroke(); ctx.restore();
      });
      // callouts
      const callouts = [[CAR.x + 470, g - 192, 'Cx 0,31', -120], [CAR.x + 752, g - 156, 'DOWNFORCE +12%', -90]];
      callouts.forEach(([x, y, txt, dy], i) => {
        const p = ease.outExpo(prog(t, 0.55 + i * 0.12, 1.0 + i * 0.12)); if (p <= 0) return;
        ctx.globalAlpha = p; ctx.strokeStyle = rgba(fg, 0.6); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + dy * p); ctx.lineTo(x + 40, y + dy * p); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fillStyle = C.orange; ctx.fill();
        mono(15, 600, 0.15); ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x + 52, y + dy * p);
        ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';
      });
      vignette(0.55);
    },
  });

  // 12 — live radar
  scene({
    id: 'radar', dur: 1.0, bg: '#0A0B0D', fg: '#ECECE6', accent: C.orange, label: 'AO VIVO',
    draw(t) {
      const fg = this.fg, cx = 960, cy = 548, th = -Math.PI / 2 + t * 5.2;
      const p0 = ease.outExpo(prog(t, 0, 0.5));
      ctx.save(); ctx.translate(cx, cy);
      if (ctx.createConicGradient) {
        const g = ctx.createConicGradient(th - 1.1, 0, 0);
        g.addColorStop(0, 'rgba(255,91,31,0)'); g.addColorStop(1.1 / TAU, 'rgba(255,91,31,0.32)'); g.addColorStop(1.1 / TAU + 0.001, 'rgba(255,91,31,0)'); g.addColorStop(1, 'rgba(255,91,31,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 470 * p0, 0, TAU); ctx.fill();
      }
      ctx.strokeStyle = C.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(th) * 470 * p0, Math.sin(th) * 470 * p0); ctx.stroke();
      ctx.fillStyle = fg;
      for (let k = 1; k <= 9; k++) {
        const r = k * 52 * p0, cnt = Math.round((TAU * k * 52) / 15), sz = 1.3 + 2.4 * Math.max(0, Math.sin(k * 0.9 - t * 12));
        ctx.globalAlpha = 0.25 + 0.6 * Math.max(0, Math.sin(k * 0.9 - t * 12));
        ctx.beginPath();
        for (let i = 0; i < cnt; i++) { const a = (i / cnt) * TAU + k * 0.2; const x = Math.cos(a) * r, y = Math.sin(a) * r; ctx.moveTo(x + sz, y); ctx.arc(x, y, sz, 0, TAU); }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      const blips = [[150, -2.3, 'P1', '+0,0'], [260, -0.6, 'P2', '+0,8'], [330, 0.9, 'VOCÊ', '+1,4'], [410, 2.5, 'P4', '+2,1'], [220, 2.0, 'P5', '+3,0']];
      blips.forEach(([r, a, k, gap]) => {
        const since = (((th - a) % TAU) + TAU) % TAU, glow = Math.exp(-since * 1.6) * p0;
        const x = Math.cos(a) * r, y = Math.sin(a) * r, me = k === 'VOCÊ';
        ctx.beginPath(); ctx.arc(x, y, me ? 9 : 6, 0, TAU); ctx.fillStyle = me ? C.orange : fg; ctx.globalAlpha = 0.35 + 0.65 * glow; ctx.fill();
        mono(13, 600, 0.12); ctx.fillStyle = me ? C.orange : fg; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(`${k} ${gap}`, x + 16, y);
        ctx.globalAlpha = 1;
      });
      ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fillStyle = C.orange; ctx.fill();
      ctx.restore();
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.globalAlpha = p0;
      mono(13, 500, 0.3); ctx.fillStyle = rgba(fg, 0.55); ctx.fillText('GAP AO VIVO · 20 CARROS', 144, 880);
      serif(64); ctx.fillStyle = fg; ctx.fillText('Saiba quem vem atrás.', 140, 950);
      ctx.globalAlpha = 1;
      vignette(0.5);
    },
  });

  // 13 — insight cards
  scene({
    id: 'cards', dur: 2.5, bg: C.blue, fg: '#F2F4FF', accent: C.lime, label: 'INSIGHTS',
    draw(t) {
      const cx = 960, cy = 548, cw = 720, ch = 520;
      ctx.translate(960, 548); ctx.scale(1.22, 1.22); ctx.translate(-960, -548);
      // back cards
      [[-1, 0.22, -7], [1, 0.34, 6]].forEach(([side, al, rot], i) => {
        const p = ease.outExpo(prog(t, 0.0 + i * 0.06, 0.6 + i * 0.06)); if (p <= 0) return;
        ctx.save(); ctx.translate(cx + side * 120 * p, cy + 20 + (1 - p) * 300); ctx.rotate((rot * Math.PI) / 180 * p);
        ctx.fillStyle = `rgba(255,255,255,${al})`; ctx.beginPath(); ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 26); ctx.fill(); ctx.restore();
      });
      const mp = ease.outBack(prog(t, 0.12, 0.72)); if (mp <= 0) return;
      ctx.save(); ctx.translate(cx, cy + (1 - mp) * 420);
      ctx.shadowColor = 'rgba(0,0,30,0.35)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 26); ctx.fill();
      ctx.shadowColor = 'transparent';
      const L = -cw / 2 + 40, Rt = cw / 2 - 40, top = -ch / 2;
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      mono(13, 600, 0.22); ctx.fillStyle = '#6B6F80'; ctx.fillText('INSIGHTS DA VOLTA 14', L, top + 54);
      ctx.textAlign = 'right'; ctx.fillStyle = C.orange; ctx.fillText('AO VIVO', Rt, top + 54);
      const blink = Math.floor(t * 4) % 2 ? 1 : 0.35; ctx.globalAlpha = blink;
      ctx.beginPath(); ctx.arc(Rt - ctx.measureText('AO VIVO').width - 14, top + 49, 5, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      ctx.textAlign = 'left'; font(800, 38, F.sans, 'normal', -0.5); ctx.fillStyle = '#0D0F1A';
      ctx.fillText('3 ajustes para ganhar 0,38 s', L, top + 108);
      const rows = [['T3', 'Freie 12 m mais tarde', 'CURVA 3 · FRENAGEM', '−0,18 s'], ['T7', 'Acelere 0,2 s antes', 'CURVA 7 · SAÍDA', '−0,11 s'], ['S2', 'Use mais zebra na entrada', 'SETOR 2 · TRAÇADO', '−0,09 s']];
      rows.forEach(([tag, title, sub, gain], i) => {
        const p = ease.outExpo(prog(t, 0.55 + i * 0.16, 1.05 + i * 0.16)); if (p <= 0) return;
        const y = top + 150 + i * 92; ctx.globalAlpha = p; ctx.save(); ctx.translate((1 - p) * 40, 0);
        ctx.fillStyle = '#F2F3F8'; ctx.beginPath(); ctx.roundRect(L - 12, y, cw - 56, 78, 16); ctx.fill();
        ctx.fillStyle = '#0D0F1A'; ctx.beginPath(); ctx.arc(L + 28, y + 39, 24, 0, TAU); ctx.fill();
        mono(14, 700, 0.02); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(tag, L + 28, y + 40);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        font(700, 22, F.sans, 'normal'); ctx.fillStyle = '#0D0F1A'; ctx.fillText(title, L + 68, y + 36);
        mono(11, 600, 0.2); ctx.fillStyle = '#7A7E8F'; ctx.fillText(sub, L + 68, y + 58);
        mono(15, 700, 0.02); const gw = ctx.measureText(gain).width + 22;
        ctx.fillStyle = '#D9F7E6'; ctx.beginPath(); ctx.roundRect(Rt - 74 - gw, y + 24, gw, 30, 15); ctx.fill();
        ctx.fillStyle = '#0F8A47'; ctx.textBaseline = 'middle'; ctx.fillText(gain, Rt - 74 - gw + 11, y + 40); ctx.textBaseline = 'alphabetic';
        const on = ease.outCubic(prog(t, 1.15 + i * 0.13, 1.35 + i * 0.13));
        const sx = Rt - 56, sy = y + 25;
        ctx.fillStyle = on > 0.5 ? C.blue : '#C8CBD6'; ctx.beginPath(); ctx.roundRect(sx, sy, 52, 28, 14); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx + 14 + on * 24, sy + 14, 10, 0, TAU); ctx.fill();
        ctx.restore(); ctx.globalAlpha = 1;
      });
      // button + cursor click
      const bp = ease.outExpo(prog(t, 1.0, 1.4));
      if (bp > 0) {
        const press = t > 2.0 && t < 2.12 ? 0.96 : 1, done = t >= 2.06;
        const by = top + ch - 96; ctx.globalAlpha = bp;
        ctx.save(); ctx.translate(0, by + 30); ctx.scale(press, press);
        ctx.fillStyle = done ? C.orange : '#0D0F1A'; ctx.beginPath(); ctx.roundRect(-cw / 2 + 28, -30, cw - 56, 60, 30); ctx.fill();
        font(700, 21, F.sans, 'normal'); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const label = done ? 'Aplicado ao próximo stint' : 'Aplicar no próximo stint';
        ctx.fillText(label, -14, 1); arrow(ctx.measureText(label).width / 2 + 2, 1, 26, '#fff', 2.4);
        ctx.restore(); ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';
      }
      ctx.restore();
      // cursor
      const cp = ease.inOutCubic(prog(t, 1.55, 2.0));
      if (cp > 0) {
        const x = lerp(1500, 1040, cp), y = lerp(980, cy + ch / 2 - 62, cp);
        const s = t > 2.0 && t < 2.12 ? 0.85 : 1;
        ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 34); ctx.lineTo(9, 26); ctx.lineTo(16, 41); ctx.lineTo(22, 38); ctx.lineTo(15, 24); ctx.lineTo(27, 24); ctx.closePath();
        ctx.fillStyle = '#111'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
        if (t > 2.0) { const rp = prog(t, 2.0, 2.4); ctx.beginPath(); ctx.arc(x, y, 10 + rp * 50, 0, TAU); ctx.strokeStyle = `rgba(255,255,255,${1 - rp})`; ctx.lineWidth = 2; ctx.stroke(); }
      }
    },
  });

  // 14 — end card
  scene({
    id: 'end', dur: 2.5, bg: C.orange, fg: '#150A05', accent: '#150A05', label: 'ACC DRIVE INSIGHT',
    draw(t) {
      const fg = this.fg, size = 112, opts = { stretch: 'expanded' };
      const wordW = textWidth('ACC DRIVE INSIGHT', size, opts), ms = 176, gap = 52;
      const total = ms + gap + wordW, x0 = (W - total) / 2, cy = 500;
      const z = 1 + 0.02 * prog(t, 0.8, 2.5);
      ctx.save(); ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-960, -540);
      mark(x0 + ms / 2, cy, ms, ease.inOutCubic(prog(t, 0.0, 0.55)), ease.outBack(prog(t, 0.25, 0.8)), ease.outBack(prog(t, 0.45, 0.75)), fg, C.cream);
      ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      const wx = x0 + ms + gap;
      reveal('ACC DRIVE INSIGHT', wx, cy + size * 0.36, size, t, 0.2, { stagger: 0.025, ...opts });
      const sp = ease.outExpo(prog(t, 0.75, 1.35));
      if (sp > 0) { ctx.globalAlpha = sp; serif(92); ctx.fillStyle = C.cream; ctx.fillText('pilote com dados.', wx + (1 - sp) * 40, cy + 150); ctx.globalAlpha = 1; }
      const mp = ease.outExpo(prog(t, 1.0, 1.5));
      if (mp > 0) {
        ctx.globalAlpha = mp; ctx.fillStyle = fg; ctx.fillRect(wx, cy + 196, wordW * mp, 1.5);
        mono(15, 600, 0.3); ctx.fillText('TELEMETRIA  ·  TRAÇADO  ·  PNEUS  ·  INSIGHTS AO VIVO', wx, cy + 236); ctx.globalAlpha = 1;
      }
      ctx.restore();
    },
  });

  // 15 — outro glow
  scene({
    id: 'outro', dur: 1.0, bg: '#050506', fg: '#ECECE6', accent: C.orange, label: 'FIM',
    draw(t) {
      const p = 1 - ease.inExpo(prog(t, 0.55, 1.0)), pulse = 1 + 0.25 * Math.sin(t * 14);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(960, 540, 0, 960, 540, 260 * pulse * p + 1);
      g.addColorStop(0, `rgba(255,140,80,${0.9 * p})`); g.addColorStop(0.08, `rgba(255,91,31,${0.55 * p})`); g.addColorStop(1, 'rgba(255,91,31,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.beginPath(); ctx.arc(960, 540, 7 * p, 0, TAU); ctx.fillStyle = `rgba(255,240,230,${p})`; ctx.fill();
      ctx.restore();
    },
  });

  const TOTAL = S.reduce((a, s) => a + s.dur, 0);
  const STARTS = S.reduce((a, s, i) => (a.push(i ? a[i - 1] + S[i - 1].dur : 0), a), []);

  function hud(sc, idx, T) {
    const a = sc.id === 'outro' ? 0.3 : 0.8;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = sc.fg; ctx.strokeStyle = sc.fg;
    const m = 34, L = 16; ctx.lineWidth = 1.5;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.beginPath(); ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke();
    });
    mono(13, 500, 0.16); ctx.textBaseline = 'middle';
    ctx.fillStyle = sc.accent; ctx.beginPath(); ctx.arc(72, 66, 5, 0, TAU); ctx.fill();
    ctx.fillStyle = sc.fg; ctx.textAlign = 'left'; ctx.fillText('ACC DRIVE INSIGHT — MOTION REEL 2026', 88, 67);
    ctx.textAlign = 'right'; ctx.fillText(`${pad(idx + 1)} / ${pad(S.length)}`, W - 72, 67);
    const pw = 150; ctx.globalAlpha = a * 0.25; ctx.fillRect(W - 72 - pw, 86, pw, 2); ctx.globalAlpha = a; ctx.fillRect(W - 72 - pw, 86, (pw * T) / TOTAL, 2);
    ctx.textAlign = 'left'; ctx.fillText(`${pad(idx + 1)} / ${sc.label}`, 72, H - 66);
    ctx.textAlign = 'right'; ctx.fillText(`TC 00:00:${pad(Math.floor(T))}:${pad(Math.floor(T * 30) % 30)}`, W - 72, H - 66);
    ctx.restore();
  }

  function draw(context, T, scale = 1) {
    ctx = context;
    T = clamp(T, 0, TOTAL - 1e-4);
    let idx = 0; while (idx < S.length - 1 && T >= STARTS[idx + 1]) idx++;
    const sc = S[idx], t = T - STARTS[idx];
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.setLineDash([]);
    ctx.fillStyle = sc.bg; ctx.fillRect(0, 0, W, H);
    ctx.save(); sc.draw(t, sc.dur); ctx.restore();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0; ctx.setLineDash([]);
    hud(sc, idx, T);
    return sc;
  }

  const fontsReady = () => Promise.all([
    document.fonts.load(`900 100px ${F.sans}`), document.fonts.load(`italic 400 100px ${F.serif}`), document.fonts.load(`500 100px ${F.mono}`),
  ]);

  return { W, H, TOTAL, STARTS, scenes: S, draw, fontsReady };
})();
