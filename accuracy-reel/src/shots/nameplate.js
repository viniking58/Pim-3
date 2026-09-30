import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { studioEnv } from '../lib/env.js';
import { maps } from '../lib/tex.js';
import { C, txt, drawLockup, artTexture } from '../lib/art.js';
import { E, range, lerp } from '../lib/util.js';

/* Plaqueta de identificação em aço inox escovado, rebitada numa máquina. */
function plateArt() {
  return artTexture('nameplate', 1400, 700, (g, w, h) => {
    g.fillStyle = '#B9BDBF';
    g.fillRect(0, 0, w, h);
    drawLockup(g, 70, 118, 78, { fill: C.green, shadow: null, word: '#1E2221', align: 'left' });
    g.strokeStyle = '#2A2E2D';
    g.lineWidth = 3;
    g.strokeRect(60, 210, w - 120, h - 270);
    const rows = [['Equipamento', 'Sistema de controle distribuído'], ['Modelo', 'AA-DCS 4000'], ['Nº de série', 'AA-2026-0417'], ['Alimentação', '24 Vcc · 5 A'], ['Fabricação', '03/2026 · Brasil']];
    rows.forEach(([a, b], i) => {
      const y = 262 + i * 76;
      txt(g, a, 90, y, { size: 30, weight: 500, color: '#2A2E2D' });
      txt(g, b, 470, y, { size: 32, weight: 600, color: '#141716' });
      if (i < rows.length - 1) { g.fillStyle = 'rgba(40,44,43,0.35)'; g.fillRect(80, y + 26, w - 160, 2); }
    });
  }, { anisotropy: 16 });
}

export function createNameplate(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1d1c);
  scene.environment = studioEnv(stage.renderer, 'product');
  scene.environmentIntensity = 0.7;

  // Chapa da máquina pintada (verde industrial) com textura de pintura.
  const paint = new THREE.MeshStandardMaterial({ color: 0x48554f, roughness: 1, ...maps('powder', [6, 6]) });
  paint.normalScale.set(0.35, 0.35);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), paint);
  wall.receiveShadow = true;
  scene.add(wall);

  const steel = new THREE.MeshPhysicalMaterial({ map: plateArt(), metalness: 0.85, roughness: 0.32, anisotropy: 0.8, anisotropyRotation: 0, ...{ normalMap: maps('brushed', [2, 2]).normalMap }, normalScale: new THREE.Vector2(0.4, 0.4) });
  const plate = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.07, 0.0016, 3, 0.0008), [steel, steel, steel, steel, steel, steel]);
  plate.position.z = 0.0012;
  plate.castShadow = true;
  plate.receiveShadow = true;
  scene.add(plate);
  const rivetMat = new THREE.MeshPhysicalMaterial({ color: 0xc9cdd0, metalness: 1, roughness: 0.25 });
  [[-0.063, 0.028], [0.063, 0.028], [-0.063, -0.028], [0.063, -0.028]].forEach(([x, y]) => {
    const r = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), rivetMat);
    r.rotation.x = Math.PI / 2;
    r.scale.set(1, 0.45, 1);
    r.position.set(x, y, 0.002);
    r.castShadow = true;
    scene.add(r);
  });

  const key = new THREE.SpotLight(0xfff4e6, 3.5, 0, 0.5, 0.9, 1.4);
  key.position.set(-0.35, 0.3, 0.28);
  key.target.position.set(0, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0001;
  key.shadow.normalBias = 0.001;
  scene.add(key, key.target);

  const camera = new THREE.PerspectiveCamera(30, 9 / 16, 0.005, 10);
  return {
    scene, camera,
    post: { toneMap: 1, exposure: 1.1, vignette: 0.4, grain: 0.04, gtao: { radius: 0.006, intensity: 0.8 }, bokeh: { focus: 0.22, aperture: 0.005, maxblur: 0.01 }, ca: 0.0015 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(-0.12, -0.105, k), lerp(0.04, 0.042, k), lerp(0.2, 0.185, k));
      camera.lookAt(lerp(-0.036, -0.03, k), 0.012, 0);
    },
  };
}
