import * as THREE from 'three';
import { studioEnv } from '../lib/env.js';
import { maps } from '../lib/tex.js';
import { lockup3D } from '../lib/text3d.js';
import { E, range, lerp } from '../lib/util.js';

/* Assinatura em acrílico branco numa parede branca, com luz rasante. */
export function createWallSign(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdedede);
  scene.environment = studioEnv(stage.renderer, 'product');
  scene.environmentIntensity = 0.5;

  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 5),
    new THREE.MeshStandardMaterial({ color: 0xedece9, roughness: 1, ...maps('plaster', [6, 4]) }),
  );
  wall.position.set(0.8, 1.6, 0);
  wall.receiveShadow = true;
  scene.add(wall);

  const light = new THREE.SpotLight(0xfff5ea, 60, 0, 0.5, 0.6, 1.4);
  light.position.set(-1.3, 3.4, 0.9);
  light.target.position.set(0.3, 1.5, 0);
  light.castShadow = true;
  light.shadow.mapSize.set(4096, 4096);
  light.shadow.bias = -0.0002;
  light.shadow.normalBias = 0.004;
  light.shadow.radius = 4;
  scene.add(light, light.target);

  const acrylic = new THREE.MeshPhysicalMaterial({ color: 0xfbfbf9, roughness: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.2 });
  const sign = lockup3D(0.42, acrylic, { depth: 0.1, bevel: 0.003 });
  sign.position.set(0.25, 1.62, 0.045);
  scene.add(sign);

  const camera = new THREE.PerspectiveCamera(30, 9 / 16, 0.05, 30);
  return {
    scene, camera,
    post: { toneMap: 2, exposure: 1.02, vignette: 0.22, grain: 0.035, gtao: { radius: 0.04, intensity: 1 }, ca: 0.001 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(-1.75, -1.62, k), lerp(1.42, 1.48, k), lerp(1.95, 1.8, k));
      camera.lookAt(lerp(-0.12, -0.05, k), 1.6, 0);
    },
  };
}
