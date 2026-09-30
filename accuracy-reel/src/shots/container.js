import * as THREE from 'three';
import { studioEnv } from '../lib/env.js';
import { floor } from '../lib/objects.js';
import { corrugatedGeometry } from './facade.js';
import { C, drawLogo, txt, artTexture, WORD } from '../lib/art.js';
import { E, range, lerp } from '../lib/util.js';

/* Contêiner de 20 pés pintado no verde da marca, em estúdio branco
   (como no reel de referência). A câmera corre ao longo da lateral. */
export function createContainer(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdedfdd);
  scene.environment = studioEnv(stage.renderer, 'product');
  scene.environmentIntensity = 0.85;
  floor(scene, { color: 0xe4e4e2, repeat: 30, size: 60 });

  const L = 6.06, Hc = 2.59, D = 2.44;
  const art = artTexture('containerSide', 2048, 880, (g, w, h) => {
    g.fillStyle = C.green;
    g.fillRect(0, 0, w, h);
    drawLogo(g, w * 0.2, h * 0.47, h * 0.34);
    txt(g, 'ACCURACY', w * 0.36, h * 0.44, { size: h * 0.2, weight: 800, italic: true, family: WORD, color: '#FFFFFF' });
    txt(g, 'AUTOMATION', w * 0.355, h * 0.64, { size: h * 0.2, weight: 800, italic: true, family: WORD, color: '#FFFFFF' });
    txt(g, 'AAUU 204 117 3  22G1', w * 0.84, h * 0.12, { size: h * 0.045, weight: 600, color: 'rgba(255,255,255,0.85)', align: 'center' });
  });
  const paint = new THREE.MeshStandardMaterial({ map: art, roughness: 0.55, metalness: 0.25 });
  const plain = new THREE.MeshStandardMaterial({ color: C.green, roughness: 0.55, metalness: 0.25 });
  const frame = new THREE.MeshStandardMaterial({ color: 0x223f39, roughness: 0.5, metalness: 0.35 });

  const box = new THREE.Group();
  // Laterais corrugadas (nervuras verticais).
  const WH = 2.36, WY = 1.31;
  const sideGeo = corrugatedGeometry(WH, L - 0.3, { pitch: 0.278, rib: 0.036, top: 0.07 });
  const front = new THREE.Mesh(sideGeo, paint);
  front.rotation.z = -Math.PI / 2;
  front.position.set(-(L - 0.3) / 2, WY, D / 2 - 0.04);
  // Corrige a orientação da arte (u ao longo do comprimento).
  const uv = sideGeo.attributes.uv;
  for (let i = 0; i < uv.count; i++) { const u = uv.getX(i), v = uv.getY(i); uv.setXY(i, v, 1 - u); }
  front.rotation.set(0, 0, -Math.PI / 2);
  box.add(front);
  const back = new THREE.Mesh(corrugatedGeometry(WH, L - 0.3, { pitch: 0.278, rib: 0.036, top: 0.07 }), plain);
  back.rotation.set(0, Math.PI, -Math.PI / 2);
  back.position.set((L - 0.3) / 2, WY, -D / 2 + 0.04);
  box.add(back);
  // Teto, piso e portas (simplificados) e a estrutura.
  const roof = new THREE.Mesh(new THREE.BoxGeometry(L - 0.2, 0.05, D - 0.1), plain);
  roof.position.y = Hc - 0.05;
  box.add(roof);
  const endGeo = new THREE.BoxGeometry(0.06, Hc - 0.3, D - 0.2);
  const doors = new THREE.Mesh(endGeo, plain);
  doors.position.set(L / 2 - 0.08, Hc / 2, 0);
  box.add(doors);
  const rear = doors.clone();
  rear.position.x = -L / 2 + 0.08;
  box.add(rear);
  const bar = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frame); m.position.set(x, y, z); box.add(m); };
  [-1, 1].forEach(sx => [-1, 1].forEach(sz => bar(0.16, Hc, 0.16, sx * (L / 2 - 0.08), Hc / 2, sz * (D / 2 - 0.08))));
  [-1, 1].forEach(sz => { bar(L, 0.16, 0.14, 0, 0.08, sz * (D / 2 - 0.07)); bar(L, 0.12, 0.14, 0, Hc - 0.06, sz * (D / 2 - 0.07)); });
  // Barras de travamento nas portas.
  for (let i = 0; i < 4; i++) {
    const z = -0.85 + i * 0.56;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, Hc - 0.35, 12), new THREE.MeshStandardMaterial({ color: 0xa5aaa8, metalness: 0.8, roughness: 0.4 }));
    rod.position.set(L / 2 - 0.02, Hc / 2, z);
    box.add(rod);
  }
  box.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  box.rotation.y = -0.18;
  scene.add(box);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-6, 9, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.03;
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(34, 9 / 16, 0.1, 100);
  return {
    scene, camera,
    post: { toneMap: 2, exposure: 1.0, vignette: 0.18, grain: 0.035, gtao: { radius: 0.25, intensity: 1 }, ca: 0.001 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      const x = lerp(-2.6, 1.6, k);
      camera.position.set(x, 1.05, 9.4);
      camera.lookAt(x + 0.5, 1.45, 0);
    },
  };
}
