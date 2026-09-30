import * as THREE from 'three';
import { studioEnv } from '../lib/env.js';
import { floor } from '../lib/objects.js';
import { logoGeometry } from '../logo.js';
import { E, range, lerp } from '../lib/util.js';

/* Símbolos extrudados em branco, em grade, sob sol duro (luz rasante). */
export function createBlocks(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe6e6e4);
  scene.environment = studioEnv(stage.renderer, 'product');
  scene.environmentIntensity = 0.55;
  floor(scene, { color: 0xededeb, repeat: 20 });

  const sun = new THREE.DirectionalLight(0xfff6ea, 4.4);
  sun.position.set(-2.2, 2.0, -1.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 12 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.01;
  scene.add(sun);

  const geo = logoGeometry(0.42, 0.42, 0.012);
  const mat = new THREE.MeshStandardMaterial({ color: 0xf2f2ef, roughness: 0.62 });
  for (let row = -3; row <= 3; row++) {
    for (let col = -2; col <= 2; col++) {
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(col * 0.92 + (row % 2) * 0.46, 0.42 * 0.42 / 2, row * 0.52);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
    }
  }

  const camera = new THREE.PerspectiveCamera(32, 9 / 16, 0.05, 50);
  return {
    scene, camera,
    post: { toneMap: 2, exposure: 1.0, vignette: 0.2, grain: 0.035, gtao: { radius: 0.12, intensity: 1 }, ca: 0.001 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      const a = lerp(0.62, 0.72, k);
      camera.position.set(Math.sin(a) * 2.4, 3.7, Math.cos(a) * 2.4);
      camera.lookAt(0.15, 0, 0.1);
    },
  };
}
