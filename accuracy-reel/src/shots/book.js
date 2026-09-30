import * as THREE from 'three';
import { studioEnv } from '../lib/env.js';
import { maps } from '../lib/tex.js';
import { C, txt, drawLogo, mark, stripes, artTexture, drawLockup, WORD, TEXT, LOGO } from '../lib/art.js';
import { E, range, lerp } from '../lib/util.js';

/* Manual da marca aberto sobre mesa escura, com a moldura verde que se
   fecha em volta (como a moldura vermelha do reel de referência). */

function spreadLeft() {
  return artTexture('bookL', 1050, 1400, (g, w, h) => {
    g.fillStyle = C.green;
    g.fillRect(0, 0, w, h);
    txt(g, '02', 80, 120, { size: 30, weight: 600, color: 'rgba(255,255,255,0.6)' });
    txt(g, 'Símbolo', 80, 170, { size: 44, weight: 700, color: '#FFFFFF' });
    drawLogo(g, w / 2, h / 2, 300);
    txt(g, 'Três barras a 59°: precisão, ritmo e movimento.', 80, h - 110, { size: 26, weight: 400, color: 'rgba(255,255,255,0.8)' });
  });
}
function spreadRight() {
  return artTexture('bookR', 1050, 1400, (g, w, h) => {
    g.fillStyle = '#F8F8F6';
    g.fillRect(0, 0, w, h);
    txt(g, '03', 80, 120, { size: 30, weight: 600, color: '#8A918E' });
    txt(g, 'Cores', 80, 170, { size: 44, weight: 700, color: C.ink });
    const sw = [[C.green, 'Verde Accuracy', '#2C5149', 'Pantone 5535 C'], [C.shadow, 'Grafite', '#323232', 'Pantone 447 C'], ['#FFFFFF', 'Branco', '#FFFFFF', '—']];
    sw.forEach(([col, name, hex, pms], i) => {
      const y = 260 + i * 330;
      g.fillStyle = col;
      g.fillRect(80, y, w - 160, 220);
      if (col === '#FFFFFF') { g.strokeStyle = '#D5D8D6'; g.lineWidth = 3; g.strokeRect(80, y, w - 160, 220); }
      txt(g, name, 80, y + 262, { size: 28, weight: 600, color: C.ink });
      txt(g, `${hex} · ${pms}`, w - 80, y + 262, { size: 24, weight: 400, color: '#6B7370', align: 'right' });
    });
  });
}

// Página levemente curvada perto da lombada.
function pageGeometry(w, d, side) {
  const g = new THREE.PlaneGeometry(w, d, 40, 1);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const u = side < 0 ? (x + w / 2) / w : 1 - (x - -w / 2) / w; // 0 = borda externa, 1 = lombada
    const lift = 0.012 * (1 - Math.pow(u, 6)) - 0.004 * Math.pow(u, 12);
    pos.setY(i, lift);
  }
  g.translate(side * w / 2, 0, 0);
  g.computeVertexNormals();
  return g;
}

export function createBook(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0e0f);
  scene.environment = studioEnv(stage.renderer, 'dark');
  scene.environmentIntensity = 1.2;
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshStandardMaterial({ color: 0x19191a, roughness: 1, ...maps('plaster', [12, 12]) }));
  desk.material.normalScale.set(0.25, 0.25);
  desk.rotation.x = -Math.PI / 2;
  desk.receiveShadow = true;
  scene.add(desk);

  const W = 0.21, D = 0.28;
  const cover = new THREE.Mesh(new THREE.BoxGeometry(2 * W + 0.02, 0.004, D + 0.014), new THREE.MeshStandardMaterial({ color: 0x1f3a33, roughness: 0.65 }));
  cover.position.y = 0.002;
  cover.castShadow = cover.receiveShadow = true;
  scene.add(cover);
  const block = new THREE.MeshStandardMaterial({ color: 0xf1f1ee, roughness: 0.9 });
  [-1, 1].forEach(side => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(W - 0.004, 0.009, D - 0.004), block);
    b.position.set(side * (W / 2 - 0.002), 0.0085, 0);
    b.castShadow = b.receiveShadow = true;
    scene.add(b);
    const pg = new THREE.Mesh(pageGeometry(W, D, side), new THREE.MeshStandardMaterial({ map: side < 0 ? spreadLeft() : spreadRight(), roughness: 0.82 }));
    pg.position.y = 0.0132;
    pg.receiveShadow = true;
    scene.add(pg);
  });
  const book = new THREE.Group();
  scene.children.slice(1).forEach(o => book.add(o));
  book.rotation.y = 0.12;
  scene.add(book);

  // Moldura verde (quatro barras finas) que se fecha em volta do livro.
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x3fa387 });
  const frame = new THREE.Group();
  const bars = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 0.0015, 0.0015), frameMat); frame.add(m); return m; });
  frame.position.y = 0.03;
  frame.rotation.y = 0.12;
  scene.add(frame);

  const key = new THREE.SpotLight(0xfff5ea, 7, 0, 0.55, 0.85, 1.5);
  key.position.set(-0.7, 1.4, 0.4);
  key.target.position.set(0, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0002;
  scene.add(key, key.target);

  const camera = new THREE.PerspectiveCamera(30, 9 / 16, 0.01, 20);
  return {
    scene, camera,
    post: { toneMap: 1, exposure: 1.1, vignette: 0.4, grain: 0.04, gtao: { radius: 0.02, intensity: 1 }, ca: 0.0015 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(0.36, 0.3, k), lerp(0.62, 0.55, k), lerp(0.62, 0.55, k));
      camera.lookAt(0.02, 0, 0.0);
      // Moldura: começa larga e fecha no livro.
      const f = E.outCubic(range(t, 0.05, 0.7));
      const fw = lerp(0.9, 2 * W + 0.06, f), fd = lerp(1.1, D + 0.06, f);
      bars[0].scale.set(fw, 1, 1); bars[0].position.set(0, 0, -fd / 2);
      bars[1].scale.set(fw, 1, 1); bars[1].position.set(0, 0, fd / 2);
      bars[2].scale.set(fd, 1, 1); bars[2].rotation.y = Math.PI / 2; bars[2].position.set(-fw / 2, 0, 0);
      bars[3].scale.set(fd, 1, 1); bars[3].rotation.y = Math.PI / 2; bars[3].position.set(fw / 2, 0, 0);
    },
  };
}
