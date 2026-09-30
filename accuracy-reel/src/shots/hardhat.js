import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import { studioEnv } from '../lib/env.js';
import { maps } from '../lib/tex.js';
import { C, artTexture, drawLogo } from '../lib/art.js';
import { E, range, lerp } from '../lib/util.js';

/* Capacete de segurança branco (casco com aba frontal e nervuras) com a
   logo aplicada como adesivo, sobre bancada de aço, fundo de fábrica. */

function helmetGeometry() {
  // Casco: domo por revolução, alongado na frente e atrás.
  const prof = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * (Math.PI / 2);
    prof.push(new THREE.Vector2(Math.cos(a) * 0.105, Math.sin(a) * 0.118));
  }
  const dome = new THREE.LatheGeometry(prof, 96);
  dome.scale(1, 1, 1.24);
  // Aba: anel fino que se projeta mais à frente (pala).
  const rim = new THREE.LatheGeometry([new THREE.Vector2(0.103, -0.004), new THREE.Vector2(0.114, -0.006), new THREE.Vector2(0.113, 0.0), new THREE.Vector2(0.104, 0.005)], 96);
  const pos = rim.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), rad = Math.hypot(x, z);
    const ang = Math.atan2(x, z);
    const front = Math.pow(Math.max(0, Math.cos(ang)), 3);
    const ext = rad > 0.108 ? 0.048 * front : 0.01 * front;
    const k = (rad + ext) / rad;
    pos.setX(i, x * k);
    pos.setZ(i, z * k * 1.24);
    pos.setY(i, pos.getY(i) - 0.012 * front * (rad > 0.108 ? 1 : 0.4));
  }
  rim.computeVertexNormals();
  return { dome, rim };
}

export function createHardhat(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1c1d);
  scene.environment = studioEnv(stage.renderer, 'warehouse');
  scene.environmentIntensity = 0.8;

  const plastic = new THREE.MeshPhysicalMaterial({ color: 0xf3f3f0, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.12, ...maps('plastic', [4, 4]) });
  plastic.roughness = 1;
  plastic.normalScale.set(0.2, 0.2);
  const { dome, rim } = helmetGeometry();
  const helmet = new THREE.Group();
  const shell = new THREE.Mesh(dome, plastic);
  const brim = new THREE.Mesh(rim, plastic);
  shell.castShadow = brim.castShadow = true;
  helmet.add(shell, brim);
  // Nervuras no topo (frente-trás).
  [-0.034, 0, 0.034].forEach((x, i) => {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.1172, i === 1 ? 0.0065 : 0.0042, 10, 64, Math.PI), plastic);
    rib.rotation.y = Math.PI / 2;
    rib.scale.set(1.24 * 0.105 / 0.118, 1, 1);
    rib.position.x = x;
    const s = Math.sqrt(1 - (x / 0.105) ** 2);
    rib.scale.multiplyScalar(s * 0.995 + 0.004);
    rib.castShadow = true;
    helmet.add(rib);
  });
  // Adesivo da marca projetado na frente do casco.
  const decalTex = artTexture('helmetDecal', 1024, 640, (g, w, h) => { drawLogo(g, w / 2, h / 2, h * 0.78, { fill: C.green, shadow: null }); });
  const decalMat = new THREE.MeshStandardMaterial({ map: decalTex, transparent: true, roughness: 0.35, polygonOffset: true, polygonOffsetFactor: -4 });
  shell.updateMatrixWorld();
  const dg = new DecalGeometry(shell, new THREE.Vector3(0, 0.07, 0.11), new THREE.Euler(-0.55, 0, 0), new THREE.Vector3(0.1, 0.0625, 0.12));
  helmet.add(new THREE.Mesh(dg, decalMat));
  helmet.position.set(0, 0.012, 0);
  helmet.rotation.y = 0.55;
  scene.add(helmet);

  // Bancada de aço.
  const steel = new THREE.MeshPhysicalMaterial({ color: 0x9aa0a5, metalness: 0.9, roughness: 1, ...maps('brushed', [3, 3]) });
  steel.roughness = 1;
  steel.normalScale.set(0.25, 0.25);
  const bench = new THREE.Mesh(new THREE.BoxGeometry(3, 0.04, 1.4), steel);
  bench.position.set(0, -0.02, -0.2);
  bench.receiveShadow = true;
  scene.add(bench);

  // Fundo de fábrica desfocado: luzes e estruturas.
  const bg = new THREE.Group();
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3.6, 3) }));
    m.position.set(-2.4 + i * 0.4, 1.6 + (i % 3) * 0.3, -4 - (i % 4));
    bg.add(m);
  }
  const beam = new THREE.MeshStandardMaterial({ color: 0x2d3336, roughness: 0.7 });
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4, 0.25), beam);
    c.position.set(-2 + i * 1.6, 1.5, -3.5 - i * 0.5);
    bg.add(c);
  }
  scene.add(bg);

  const key = new THREE.SpotLight(0xfff3e6, 14, 0, 0.5, 0.8, 1.5);
  key.position.set(-0.9, 1.2, 0.8);
  key.target.position.set(0, 0.05, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.004;
  scene.add(key, key.target);
  const rimL = new THREE.PointLight(0xa8c8ff, 1.6, 3, 1.5);
  rimL.position.set(0.6, 0.5, -0.6);
  scene.add(rimL);

  const camera = new THREE.PerspectiveCamera(30, 9 / 16, 0.01, 30);
  return {
    scene, camera,
    post: { toneMap: 1, exposure: 1.05, vignette: 0.35, grain: 0.04, gtao: { radius: 0.03, intensity: 1 }, bokeh: { focus: 0.83, aperture: 0.004, maxblur: 0.01 }, ca: 0.0015 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(0.46, 0.4, k), lerp(0.18, 0.17, k), lerp(0.74, 0.7, k));
      camera.lookAt(0.0, lerp(0.06, 0.065, k), 0.01);
    },
  };
}
