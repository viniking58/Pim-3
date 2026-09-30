import * as THREE from 'three';
import { studioEnv } from '../lib/env.js';
import { maps } from '../lib/tex.js';
import { C, txt, drawLogo, artTexture, WORD, stripes, barcode, mark } from '../lib/art.js';
import { E, range, lerp, rng } from '../lib/util.js';

/* Galpão de expedição com bobinas de papel embaladas, faixa verde com a
   marca e etiqueta circular no topo. Piso de concreto polido. */

function wrapTexture() {
  return artTexture('rollWrap', 2048, 760, (g, w, h) => {
    g.fillStyle = '#E7E1D3';
    g.fillRect(0, 0, w, h);
    // Fibras do papel kraft.
    const r = rng(9);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = `rgba(${140 + r() * 60},${120 + r() * 50},${90 + r() * 40},${0.05 + r() * 0.06})`;
      g.fillRect(r() * w, r() * h, 1 + r() * 14, 1);
    }
    const by = h * 0.3, bh = h * 0.22;
    g.fillStyle = C.green;
    g.fillRect(0, by, w, bh);
    for (let i = 0; i < 3; i++) {
      const x = i * (w / 3) + 60;
      drawLogo(g, x + 90, by + bh / 2, bh * 0.62);
      txt(g, 'ACCURACY AUTOMATION', x + 200, by + bh * 0.62, { size: bh * 0.34, weight: 800, italic: true, family: WORD, color: '#FFFFFF', spacing: 2 });
    }
    g.fillStyle = 'rgba(44,81,73,0.85)';
    g.fillRect(0, by + bh + 14, w, 5);
    txt(g, 'PAPEL KRAFT 80 g/m² · LARGURA 1.400 mm · LOTE 2026-0417 · MÁQUINA 2', 40, h * 0.86, { size: 30, weight: 500, color: '#5a5347' });
  });
}

function capTexture() {
  return artTexture('rollCap', 1024, 1024, (g, w, h) => {
    g.fillStyle = '#EDE8DC';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#FFFFFF';
    g.beginPath();
    g.arc(w / 2, h / 2, w * 0.3, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = C.green;
    g.lineWidth = 10;
    g.stroke();
    mark(g, w / 2, h / 2 - 50, 110);
    txt(g, 'ACCURACY AUTOMATION', w / 2, h / 2 + 60, { size: 34, weight: 800, italic: true, family: WORD, color: C.green, align: 'center' });
    barcode(g, w / 2 - 120, h / 2 + 90, 240, 60, 4);
    // Anéis concêntricos da sobreposição da embalagem.
    g.strokeStyle = 'rgba(120,105,80,0.25)';
    g.lineWidth = 2;
    for (let r = w * 0.34; r < w * 0.5; r += 18) { g.beginPath(); g.arc(w / 2, h / 2, r, 0, Math.PI * 2); g.stroke(); }
  });
}

export function createRolls(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x59616a);
  scene.fog = new THREE.Fog(0x59616a, 5, 24);
  scene.environment = studioEnv(stage.renderer, 'warehouse');
  scene.environmentIntensity = 0.7;

  const floorMat = new THREE.MeshStandardMaterial({ color: 0x9a9d99, roughness: 1, ...maps('concrete', [4, 4]) });
  floorMat.roughness = 0.9;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat);
  fl.rotation.x = -Math.PI / 2;
  fl.receiveShadow = true;
  scene.add(fl);

  const wrap = wrapTexture();
  const side = new THREE.MeshStandardMaterial({ map: wrap, roughness: 0.85, ...maps('paper', [3, 1]) });
  side.normalScale.set(0.12, 0.12);
  const cap = new THREE.MeshStandardMaterial({ map: capTexture(), roughness: 0.8 });
  const R = 0.62, Hh = 1.4;
  const geo = new THREE.CylinderGeometry(R, R, Hh, 96, 1, false);
  const r = rng(21);
  const place = (x, z, y = 0, rot = r() * Math.PI * 2) => {
    const m = new THREE.Mesh(geo, [side, cap, cap]);
    m.position.set(x, y + Hh / 2, z);
    m.rotation.y = rot;
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
  };
  // Duas fileiras de bobinas ao longo de um corredor, empilhadas em dois níveis.
  for (let i = 0; i < 9; i++) {
    const z = -i * 1.32;
    place(-1.45, z, 0, 0.3 + i);
    place(-1.45, z, Hh, 1.1 + i * 0.7);
    place(1.45, z - 0.3, 0, 2 + i);
    if (i % 3 !== 1) place(1.45, z - 0.3, Hh, 0.5 + i * 1.3);
  }

  // Luz das luminárias do teto e janelas altas.
  const top = new THREE.DirectionalLight(0xfff1dc, 2.6);
  top.position.set(-3, 9, 3);
  top.target.position.set(0, 0, -4);
  top.castShadow = true;
  top.shadow.mapSize.set(4096, 4096);
  Object.assign(top.shadow.camera, { left: -8, right: 8, top: 10, bottom: -10, near: 1, far: 30 });
  top.shadow.bias = -0.0004;
  top.shadow.normalBias = 0.03;
  scene.add(top, top.target);
  // Fundo do galpão: parede com janelas altas iluminadas.
  const back = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), new THREE.MeshStandardMaterial({ color: 0x70787f, roughness: 0.9 }));
  back.position.set(0, 4.5, -13);
  scene.add(back);
  for (let i = -2; i <= 2; i++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.3, 2.5) }));
    w.position.set(i * 2.4, 6.2, -12.95);
    scene.add(w);
  }
  for (let i = 0; i < 4; i++) {
    const p = new THREE.PointLight(0xfff0d8, 9, 9, 1.6);
    p.position.set(0, 4.8, -i * 3.2);
    scene.add(p);
  }

  const camera = new THREE.PerspectiveCamera(44, 9 / 16, 0.05, 60);
  return {
    scene, camera,
    post: { toneMap: 1, exposure: 1.05, vignette: 0.35, grain: 0.045, gtao: { radius: 0.3, intensity: 0.9 }, bokeh: { focus: 3.9, aperture: 0.0007, maxblur: 0.005 }, ca: 0.0015 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(0.3, 0.22, k), lerp(1.05, 1.1, k), lerp(3.7, 3.35, k));
      camera.lookAt(lerp(-0.62, -0.66, k), 1.25, -2.8);
    },
  };
}
