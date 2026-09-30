import * as THREE from 'three';

/* Símbolo da Accuracy Automation, vetorizado da arte enviada (625 × 625 px).
   Coordenadas em "unidades de logo" com origem no canto superior esquerdo
   da parte branca (caixa de 479,14 × 282,17). Bordas ajustadas por mínimos
   quadrados: erro máximo abaixo de 0,2 px em relação à imagem original. */
export const LOGO = {
  w: 479.14,
  h: 282.17,
  // Deslocamento da sombra cinza em relação ao branco (esquerda e para baixo).
  shadow: [-18, 9],
  shapes: [
    // Barra 1
    [[171.56, 0], [234.84, 0], [68.69, 282.17], [0, 282.17]],
    // Barra 2
    [[278.0, 0], [343.98, 0], [175.13, 282.17], [111.85, 282.17]],
    // "A": perna inclinada, barra do topo, bloco superior, entalhe e cunha.
    [
      [378.52, 0], [453.52, 0], [467.81, 141.1], [401.8, 141.1], [401.8, 72.5],
      [319.15, 201.97], [396.22, 167.79], [471.8, 167.79], [479.14, 282.17],
      [401.8, 282.17], [401.8, 228.62], [270.74, 282.17], [208.43, 282.17],
    ],
  ],
};

export const BRAND = {
  name: 'Accuracy Automation',
  line1: 'ACCURACY',
  line2: 'AUTOMATION',
  tagline: 'Automação industrial para papel e celulose',
  site: 'accuracyautomation.com.br',
  colors: {
    green: '#2C5149',
    greenDeep: '#1D3832',
    greenLight: '#3E6B60',
    white: '#FFFFFF',
    shadow: '#323232',
    paper: '#F2F1ED',
    ink: '#141615',
  },
};

// Caminho 2D do símbolo (unidades de logo), opcionalmente deslocado.
export function logoPath(dx = 0, dy = 0) {
  const p = new Path2D();
  for (const pts of LOGO.shapes) {
    pts.forEach(([x, y], i) => (i ? p.lineTo(x + dx, y + dy) : p.moveTo(x + dx, y + dy)));
    p.closePath();
  }
  return p;
}

/* Desenha o símbolo em 2D centrado em (cx, cy) com altura h.
   opts.shadow: cor da sombra deslocada (null = versão sem sombra). */
export function drawLogo(ctx, cx, cy, h, opts = {}) {
  const { fill = BRAND.colors.white, shadow = BRAND.colors.shadow, alpha = 1 } = opts;
  const s = h / LOGO.h;
  const [sx, sy] = LOGO.shadow;
  // Centraliza a caixa visível (com a sombra, quando houver).
  const x0 = shadow ? sx : 0, bw = shadow ? LOGO.w - sx : LOGO.w, bh = shadow ? LOGO.h + sy : LOGO.h;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(cx - (bw * s) / 2 - x0 * s, cy - (bh * s) / 2);
  ctx.scale(s, s);
  if (shadow) {
    ctx.fillStyle = shadow;
    ctx.fill(logoPath(sx, sy));
  }
  ctx.fillStyle = fill;
  ctx.fill(logoPath());
  ctx.restore();
}

/* Formas do three.js (eixo y para cima), centradas na origem, altura h. */
export function logoShapes3D(h = 1) {
  const s = h / LOGO.h;
  return LOGO.shapes.map(pts => {
    const shape = new THREE.Shape();
    pts.forEach(([x, y], i) => {
      const X = (x - LOGO.w / 2) * s, Y = -(y - LOGO.h / 2) * s;
      i ? shape.lineTo(X, Y) : shape.moveTo(X, Y);
    });
    shape.closePath();
    return shape;
  });
}

// Símbolo extrudado (profundidade e chanfro em proporção à altura).
export function logoGeometry(h = 1, depth = 0.12, bevel = 0.012) {
  const g = new THREE.ExtrudeGeometry(logoShapes3D(h), {
    depth: depth * h,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel * h,
    bevelSize: bevel * h,
    bevelOffset: -bevel * h,
    bevelSegments: 3,
    curveSegments: 1,
  });
  g.translate(0, 0, -(depth * h) / 2);
  g.computeVertexNormals();
  return g;
}
