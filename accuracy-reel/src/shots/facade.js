import * as THREE from 'three';
import { gradientSky } from '../lib/env.js';
import { maps } from '../lib/tex.js';
import { logoGeometry } from '../logo.js';
import { E, range, lerp } from '../lib/util.js';

/* Perfil trapezoidal de telha metálica (nervuras horizontais), como
   geometria de verdade para que o sol crie sombras entre as nervuras. */
export function corrugatedGeometry(width, height, { pitch = 0.2, rib = 0.035, top = 0.04, depthAxis = 'z' } = {}) {
  const prof = [];
  const n = Math.ceil(height / pitch);
  for (let i = 0; i <= n; i++) {
    const y0 = i * pitch;
    const a = (pitch - top) / 2;
    prof.push([y0, 0], [y0 + a * 0.35, 0], [y0 + a, rib], [y0 + a + top, rib], [y0 + a * 1.65 + top, 0]);
  }
  const pts = prof.filter(p => p[0] <= height + 1e-6);
  const pos = [], nor = [], uv = [], idx = [];
  pts.forEach(([y, z], i) => {
    const prev = pts[Math.max(0, i - 1)], next = pts[Math.min(pts.length - 1, i + 1)];
    const ty = next[0] - prev[0], tz = next[1] - prev[1], l = Math.hypot(ty, tz) || 1;
    const ny = -tz / l, nz = ty / l;
    for (const x of [-width / 2, width / 2]) {
      pos.push(x, y, z);
      nor.push(0, ny, nz);
      uv.push(x / width + 0.5, y / height);
    }
  });
  for (let i = 0; i < pts.length - 1; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, b, d, a, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

export function createFacade(stage) {
  const scene = new THREE.Scene();
  const sunDir = new THREE.Vector3(-0.45, 0.78, 0.55).normalize();
  const { mesh: sky, env } = gradientSky(stage.renderer, { zenith: '#2A64B8', horizon: '#9FC1E6', sunDir, intensity: 1.15 });
  scene.add(sky);
  scene.environment = env;
  scene.environmentIntensity = 0.75;

  const sun = new THREE.DirectionalLight(0xfff2e2, 3.6);
  sun.position.copy(sunDir).multiplyScalar(40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  const sc = sun.shadow.camera;
  sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 90;
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  // Prédio: duas faces de telha escura que se encontram numa quina.
  const clad = new THREE.MeshStandardMaterial({ color: 0x3a3e42, metalness: 0.3, roughness: 0.55 });
  const H = 9, W1 = 16, W2 = 10;
  const front = new THREE.Mesh(corrugatedGeometry(W1, H, { pitch: 0.22, rib: 0.04 }), clad);
  front.position.set(-W1 / 2, 0, 0);
  const side = new THREE.Mesh(corrugatedGeometry(W2, H, { pitch: 0.22, rib: 0.04 }), clad);
  side.rotation.y = -Math.PI / 2;
  side.position.set(0, 0, -W2 / 2);
  [front, side].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m); });
  // Rufo (arremate) no topo e cantoneira na quina.
  const trim = new THREE.MeshStandardMaterial({ color: 0x2c2f33, metalness: 0.6, roughness: 0.35 });
  const cap1 = new THREE.Mesh(new THREE.BoxGeometry(W1 + 0.2, 0.28, 0.16), trim);
  cap1.position.set(-W1 / 2, H + 0.1, 0.06);
  const cap2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, W2 + 0.2), trim);
  cap2.position.set(0.06, H + 0.1, -W2 / 2);
  const corner = new THREE.Mesh(new THREE.BoxGeometry(0.14, H, 0.14), trim);
  corner.position.set(0.03, H / 2, 0.03);
  [cap1, cap2, corner].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m); });

  // Letreiro: símbolo em ACM branco com 12 cm de espessura, afastado da parede.
  const sign = new THREE.Mesh(logoGeometry(2.2, 0.055, 0.004), new THREE.MeshPhysicalMaterial({ color: 0xf7f7f5, roughness: 0.32, clearcoat: 0.4, clearcoatRoughness: 0.3 }));
  sign.position.set(-2.2, H - 1.75, 0.17);
  sign.castShadow = true;
  sign.receiveShadow = true;
  scene.add(sign);

  const camera = new THREE.PerspectiveCamera(38, 9 / 16, 0.1, 1000);
  return {
    scene, camera,
    post: { toneMap: 2, exposure: 0.95, vignette: 0.2, grain: 0.035, gtao: { radius: 0.35, intensity: 0.8 }, ca: 0.0015 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(1.8, 1.55, k), lerp(1.6, 1.75, k), lerp(9.0, 8.5, k));
      camera.lookAt(lerp(-2.55, -2.7, k), lerp(7.05, 7.1, k), lerp(-0.8, -0.9, k));
    },
  };
}
