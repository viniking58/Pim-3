import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { studioEnv } from '../lib/env.js';
import { maps } from '../lib/tex.js';
import { C, txt, mark, artTexture, WORD, barcode } from '../lib/art.js';
import { E, range, lerp, rng } from '../lib/util.js';

/* Fardos de celulose empilhados em unidades, com carimbo da marca e
   arames de amarração, num armazém. */
function sideArt() {
  return artTexture('baleSide', 1024, 640, (g, w, h) => {
    g.fillStyle = '#E9E6DE';
    g.fillRect(0, 0, w, h);
    const r = rng(12);
    for (let y = 0; y < h; y += 3) {
      g.fillStyle = `rgba(150,140,120,${0.08 + r() * 0.12})`;
      g.fillRect(0, y, w, 1);
    }
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.25})`; g.fillRect(r() * w, r() * h, 20 + r() * 80, 1); }
  });
}
function topArt() {
  return artTexture('baleTop', 1024, 768, (g, w, h) => {
    g.fillStyle = '#EEEBE4';
    g.fillRect(0, 0, w, h);
    g.save();
    g.globalAlpha = 0.88;
    mark(g, w * 0.3, h * 0.36, 150);
    txt(g, 'ACCURACY', w * 0.52, h * 0.33, { size: 64, weight: 800, italic: true, family: WORD, color: C.green });
    txt(g, 'AUTOMATION', w * 0.515, h * 0.43, { size: 64, weight: 800, italic: true, family: WORD, color: C.green });
    txt(g, 'LINHA DE ENFARDAMENTO AUTOMATIZADA', w * 0.5, h * 0.62, { size: 30, weight: 600, color: '#2C3431', align: 'center' });
    txt(g, 'LOTE 2026-0417 · 250 kg · SECO AO AR 90%', w * 0.5, h * 0.7, { size: 26, weight: 500, color: '#4A524F', align: 'center' });
    barcode(g, w * 0.36, h * 0.76, w * 0.28, 60, 9, '#2C3431');
    g.restore();
  });
}

export function createBales(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x5b636a);
  scene.fog = new THREE.Fog(0x5b636a, 5, 20);
  scene.environment = studioEnv(stage.renderer, 'warehouse');
  scene.environmentIntensity = 0.75;
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x8f938f, roughness: 1, ...maps('concrete', [4, 4]) });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat);
  fl.rotation.x = -Math.PI / 2;
  fl.receiveShadow = true;
  scene.add(fl);

  const side = new THREE.MeshStandardMaterial({ map: sideArt(), roughness: 0.95 });
  const top = new THREE.MeshStandardMaterial({ map: topArt(), roughness: 0.9 });
  const plain = new THREE.MeshStandardMaterial({ color: 0xebe8e0, roughness: 0.95 });
  const wire = new THREE.MeshStandardMaterial({ color: 0x55595c, metalness: 0.9, roughness: 0.35 });
  const BW = 0.82, BH = 0.5, BD = 0.62;
  const baleGeo = new RoundedBoxGeometry(BW, BH, BD, 3, 0.02);
  const r = rng(3);
  const bale = (x, y, z, ry, stamped) => {
    const g = new THREE.Group();
    const m = new THREE.Mesh(baleGeo, [side, side, stamped ? top : plain, plain, side, side]);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    [-0.22, 0.22].forEach(wx => {
      const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.006, BH + 0.004, BD + 0.004), wire);
      w1.position.x = wx;
      const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, BD + 0.004), wire);
      w2.position.set(wx, BH / 2 + 0.002, 0);
      g.add(w1, w2);
    });
    g.position.set(x, y + BH / 2, z);
    g.rotation.y = ry;
    scene.add(g);
  };
  // Unidades de 2 colunas × 4 camadas, em fileiras.
  for (let u = 0; u < 5; u++) {
    const z = -u * 1.5;
    [-1.1, 1.1].forEach((x0, side) => {
      for (let c = 0; c < 2; c++) for (let l = 0; l < 4; l++) {
        if (u === 0 && side === 0 && l === 3 && c === 1) continue;
        bale(x0 + (c - 0.5) * (BW + 0.01), l * (BH + 0.004), z + (r() - 0.5) * 0.02, (r() - 0.5) * 0.02, l === 3 || (u === 0 && c === 1 && l === 2));
      }
    });
  }
  const topL = new THREE.DirectionalLight(0xfff1dc, 2.4);
  topL.position.set(-3, 8, 4);
  topL.target.position.set(0, 0, -3);
  topL.castShadow = true;
  topL.shadow.mapSize.set(4096, 4096);
  Object.assign(topL.shadow.camera, { left: -7, right: 7, top: 8, bottom: -8, near: 1, far: 25 });
  topL.shadow.bias = -0.0004;
  topL.shadow.normalBias = 0.02;
  scene.add(topL, topL.target);

  const camera = new THREE.PerspectiveCamera(40, 9 / 16, 0.05, 60);
  return {
    scene, camera,
    post: { toneMap: 1, exposure: 1.05, vignette: 0.32, grain: 0.045, gtao: { radius: 0.25, intensity: 0.9 }, bokeh: { focus: 2.3, aperture: 0.0008, maxblur: 0.005 }, ca: 0.0015 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(0.25, 0.1, k), lerp(2.6, 2.5, k), lerp(1.9, 1.7, k));
      camera.lookAt(lerp(-0.85, -0.9, k), 1.6, lerp(-0.2, -0.3, k));
    },
  };
}
