import * as THREE from 'three';
import { studioEnv } from '../lib/env.js';
import { floor } from '../lib/objects.js';
import { maps } from '../lib/tex.js';
import { C, txt, mark, drawLockup, stripes, drawLogo, artTexture, WORD } from '../lib/art.js';
import { cardFront, cardBack, CARD } from './cards.js';
import { E, range, lerp } from '../lib/util.js';

/* Papelaria vista de cima: papel timbrado, envelope, pasta, cartões,
   crachá com cordão e caneta. */

function letterhead() {
  return artTexture('letterhead', 1240, 1754, (g, w, h) => {
    g.fillStyle = '#FBFBF9';
    g.fillRect(0, 0, w, h);
    drawLockup(g, 90, 150, 62, { fill: C.green, shadow: null, word: C.green, align: 'left' });
    txt(g, 'São Paulo, 17 de abril de 2026', w - 90, 320, { size: 22, weight: 400, color: '#5B625F', align: 'right' });
    g.fillStyle = '#C9CDCB';
    for (let i = 0; i < 16; i++) g.fillRect(90, 420 + i * 44, i % 5 === 4 ? 620 : 1040 - (i % 3) * 60, 12);
    stripes(g, 0, h - 90, w, 90, { bar: 36, gap: 24 });
    txt(g, 'Automação industrial para papel e celulose', 90, h - 130, { size: 22, weight: 500, color: C.green });
  });
}
function envelope() {
  return artTexture('envelope', 2200, 1100, (g, w, h) => {
    g.fillStyle = '#F7F7F4';
    g.fillRect(0, 0, w, h);
    drawLockup(g, 110, 180, 90, { fill: C.green, shadow: null, word: C.green, align: 'left' });
    g.fillStyle = '#D5D9D7';
    for (let i = 0; i < 4; i++) g.fillRect(w * 0.52, h * 0.52 + i * 60, 620 - i * 90, 18);
    stripes(g, w - 360, 0, 360, h, { bar: 70, gap: 48 });
  });
}
function folder() {
  return artTexture('folder', 1100, 1540, (g, w, h) => {
    g.fillStyle = C.green;
    g.fillRect(0, 0, w, h);
    stripes(g, 0, h * 0.7, w, h * 0.3, { color: 'rgba(255,255,255,0.09)', bar: 80, gap: 55 });
    drawLogo(g, w * 0.5, h * 0.42, 200);
  });
}
function badge() {
  return artTexture('badge', 540, 860, (g, w, h) => {
    g.fillStyle = '#FFFFFF';
    g.fillRect(0, 0, w, h);
    g.fillStyle = C.green;
    g.fillRect(0, 0, w, 250);
    drawLogo(g, w / 2, 130, 110);
    g.fillStyle = '#D9DDDB';
    g.fillRect(w / 2 - 110, 310, 220, 250);
    txt(g, 'Nome Sobrenome', w / 2, 640, { size: 40, weight: 600, color: C.ink, align: 'center' });
    txt(g, 'Engenharia', w / 2, 690, { size: 28, weight: 400, color: '#5B625F', align: 'center' });
    stripes(g, 0, h - 60, w, 60, { bar: 24, gap: 16 });
  });
}
function lanyardTex() {
  return artTexture('lanyard', 256, 2048, (g, w, h) => {
    g.fillStyle = C.green;
    g.fillRect(0, 0, w, h);
    for (let y = 60; y < h; y += 280) {
      g.save();
      g.translate(w / 2, y);
      g.rotate(-Math.PI / 2);
      txt(g, 'ACCURACY AUTOMATION', 0, 12, { size: 34, weight: 800, italic: true, family: WORD, color: '#FFFFFF', align: 'center' });
      g.restore();
    }
  });
}

// Fita plana seguindo uma curva (cordão do crachá).
function ribbon(points, width, mat) {
  const curve = new THREE.CatmullRomCurve3(points);
  const N = 120, pos = [], uv = [], idx = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= N; i++) {
    const p = curve.getPointAt(i / N), tng = curve.getTangentAt(i / N);
    const side = new THREE.Vector3().crossVectors(up, tng).normalize().multiplyScalar(width / 2);
    pos.push(p.x - side.x, p.y, p.z - side.z, p.x + side.x, p.y, p.z + side.z);
    uv.push(0, i / N, 1, i / N);
    if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function createStationery(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdfe0dd);
  scene.environment = studioEnv(stage.renderer, 'product');
  scene.environmentIntensity = 0.9;
  floor(scene, { color: 0xdcdedb, repeat: 16 });
  const key = new THREE.DirectionalLight(0xfffaf2, 2.4);
  key.position.set(-1.0, 2.4, -0.6);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -0.45, right: 0.45, top: 0.45, bottom: -0.45, near: 0.5, far: 6 });
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.002;
  scene.add(key);

  const paperMat = map => new THREE.MeshStandardMaterial({ map, roughness: 0.85, ...{ normalMap: maps('paper', [2, 2]).normalMap }, normalScale: new THREE.Vector2(0.3, 0.3) });
  const sheet = (w, d, th, map, x, y, z, ry) => {
    const edge = new THREE.MeshStandardMaterial({ color: 0xf2f2ef, roughness: 0.9 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, th, d), [edge, edge, paperMat(map), edge, edge, edge]);
    m.position.set(x, y + th / 2, z);
    m.rotation.y = ry;
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
    return m;
  };
  sheet(0.22, 0.31, 0.003, folder(), 0.12, 0, -0.1, -0.2);
  sheet(0.21, 0.297, 0.0006, letterhead(), -0.05, 0.003, -0.02, 0.1);
  sheet(0.22, 0.11, 0.002, envelope(), 0.02, 0.0036, 0.2, -0.08);
  sheet(CARD.w, CARD.h, 0.0004, cardFront(), 0.15, 0.0056, 0.13, 0.35);
  sheet(CARD.w, CARD.h, 0.0004, cardBack(), 0.12, 0.0006, 0.22, -0.5);
  const b = sheet(0.054, 0.086, 0.0008, badge(), -0.14, 0.0016, 0.2, 0.25);
  const lanyard = ribbon([
    new THREE.Vector3(-0.14 + 0.01, 0.003, 0.155), new THREE.Vector3(-0.17, 0.0025, 0.08), new THREE.Vector3(-0.24, 0.0025, 0.0),
    new THREE.Vector3(-0.2, 0.0025, -0.12), new THREE.Vector3(-0.08, 0.0025, -0.22), new THREE.Vector3(0.05, 0.0025, -0.28),
  ], 0.02, new THREE.MeshStandardMaterial({ map: lanyardTex(), roughness: 0.7, side: THREE.DoubleSide }));
  scene.add(lanyard);
  void b;
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.14, 24), new THREE.MeshPhysicalMaterial({ color: 0x1c1e1f, metalness: 0.4, roughness: 0.3, clearcoat: 0.8 }));
  pen.rotation.set(0, 0.6, Math.PI / 2);
  pen.position.set(0.06, 0.0059, 0.06);
  pen.castShadow = true;
  scene.add(pen);

  const camera = new THREE.PerspectiveCamera(30, 9 / 16, 0.01, 20);
  return {
    scene, camera,
    post: { toneMap: 2, exposure: 1.02, vignette: 0.15, grain: 0.03, gtao: { radius: 0.02, intensity: 1 }, ca: 0.001 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(0.02, 0.0, k), lerp(1.6, 1.5, k), lerp(0.12, 0.1, k));
      camera.up.set(Math.sin(lerp(-0.1, -0.04, k)), 0, -Math.cos(lerp(-0.1, -0.04, k)));
      camera.lookAt(0.0, 0, 0.02);
    },
  };
}
