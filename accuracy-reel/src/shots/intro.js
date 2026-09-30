import * as THREE from 'three';
import { logoGeometry, logoShapes3D } from '../logo.js';
import { studioEnv } from '../lib/env.js';
import { E, range, lerp } from '../lib/util.js';

/* Abertura: o símbolo alterna entre cromo líquido (3D) e branco chapado,
   em cortes de poucos quadros no ritmo da batida. */
export function createIntro(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.environment = studioEnv(stage.renderer, 'chrome');

  const time = { value: 0 };
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.035, envMapIntensity: 1.25 });
  // Reflexos "líquidos": a normal ondula lentamente com o tempo.
  chrome.onBeforeCompile = sh => {
    sh.uniforms.uTime = time;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nuniform float uTime;')
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        vec3 w = vWPos * 2.6;
        normal = normalize(normal + 0.16 * vec3(
          sin(w.y * 2.3 + uTime * 2.1) + 0.5 * sin(w.x * 4.1 - uTime * 1.3),
          sin(w.x * 1.9 - uTime * 1.7) + 0.5 * sin(w.y * 3.7 + uTime * 2.6),
          0.0));`);
  };
  const logo = new THREE.Mesh(logoGeometry(1, 0.22, 0.03), chrome);
  scene.add(logo);

  const flat = new THREE.Mesh(new THREE.ShapeGeometry(logoShapes3D(1)), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
  scene.add(flat);

  const camera = new THREE.PerspectiveCamera(24, 9 / 16, 0.1, 100);
  camera.position.set(0, 0, 9.4);

  // Alternância cromo/chapado (em segundos dentro do plano).
  const CHROME = [[0, 0.12], [0.24, 0.3], [0.48, 0.6]];
  const shot = {
    scene, camera,
    post: {},
    update(t) {
      const isChrome = CHROME.some(([a, b]) => t >= a && t < b);
      logo.visible = isChrome;
      flat.visible = !isChrome;
      time.value = t * 3 + 1.3;
      logo.rotation.set(-0.18 + 0.12 * Math.sin(t * 4), 0.42 - t * 0.9, 0.05);
      logo.scale.setScalar(lerp(1.0, 1.06, E.outCubic(range(t, 0, 0.7))));
      flat.scale.setScalar(lerp(1.0, 1.04, range(t, 0, 0.7)));
      shot.post = isChrome
        ? { toneMap: 1, exposure: 1.2, vignette: 0.35, grain: 0.04, bloom: 0.12, bloomThreshold: 1.1, bloomRadius: 0.3, ca: 0.002 }
        : { toneMap: 0, vignette: 0, grain: 0.03, ca: 0 };
    },
  };
  return shot;
}
