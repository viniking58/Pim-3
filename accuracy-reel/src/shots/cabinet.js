import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { studioEnv } from '../lib/env.js';
import { maps, makeCanvas } from '../lib/tex.js';
import { C, drawLockup, artTexture, txt } from '../lib/art.js';
import { drawHMI } from '../lib/screens.js';
import { E, range, lerp } from '../lib/util.js';

/* Painel elétrico RAL 7035 com IHM mostrando o supervisório da máquina de
   papel, botoeiras, emergência e a assinatura em vinil na porta. */

const RAL7035 = 0xc8ccc6;

function cabinetUnit({ hmi = false, brand = false, hmiTex = null } = {}) {
  const g = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color: RAL7035, roughness: 1, ...maps('powder', [10, 20]) });
  paint.normalScale.set(0.12, 0.12);
  const dark = new THREE.MeshStandardMaterial({ color: 0x2c2e30, roughness: 0.6 });
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  add(new THREE.BoxGeometry(0.8, 0.1, 0.38), dark, 0, 0.05, 0);
  add(new RoundedBoxGeometry(0.8, 1.8, 0.38, 2, 0.006), paint, 0, 1.0, 0);
  add(new RoundedBoxGeometry(0.822, 0.025, 0.4, 2, 0.004), paint, 0, 1.912, 0);
  add(new RoundedBoxGeometry(0.784, 1.764, 0.03, 3, 0.008), paint, 0, 1.0, 0.2);
  // Manopla e dobradiças.
  add(new RoundedBoxGeometry(0.04, 0.16, 0.024, 2, 0.008), dark, 0.335, 1.0, 0.227);
  add(new RoundedBoxGeometry(0.022, 0.07, 0.02, 2, 0.006), dark, 0.335, 1.035, 0.245);
  [0.25, 1.75].forEach(y => add(new THREE.CylinderGeometry(0.009, 0.009, 0.08, 16), dark, -0.395, y, 0.21));
  // Ventilação com filtro na parte de baixo da porta.
  const grille = new THREE.MeshStandardMaterial({ color: 0xb9bcb6, roughness: 0.55 });
  add(new RoundedBoxGeometry(0.24, 0.24, 0.02, 2, 0.01), grille, 0, 0.36, 0.222);
  for (let i = 0; i < 9; i++) add(new THREE.BoxGeometry(0.2, 0.008, 0.012), dark, 0, 0.27 + i * 0.022, 0.235);

  if (hmi) {
    const bezel = new THREE.MeshStandardMaterial({ color: 0x151617, roughness: 0.45 });
    add(new RoundedBoxGeometry(0.37, 0.3, 0.024, 3, 0.008), bezel, 0, 1.33, 0.227);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.312, 0.25),
      new THREE.MeshPhysicalMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: hmiTex, emissiveIntensity: 1.25, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }),
    );
    screen.position.set(0, 1.335, 0.2395);
    g.add(screen);
    // Sinaleiros, botões e emergência.
    const lamp = (color, x) => {
      const m = add(new THREE.CylinderGeometry(0.0125, 0.0125, 0.022, 24), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.6, roughness: 0.3 }), x, 1.07, 0.226);
      m.rotation.x = Math.PI / 2;
      const ring = add(new THREE.TorusGeometry(0.0145, 0.003, 8, 24), new THREE.MeshStandardMaterial({ color: 0xb8bbbe, metalness: 0.9, roughness: 0.3 }), x, 1.07, 0.236);
      return ring;
    };
    lamp(0x2fe07a, -0.15);
    lamp(0xffb020, -0.09);
    lamp(0xff3b30, -0.03);
    const btn = (color, x) => {
      const b = add(new THREE.CylinderGeometry(0.014, 0.014, 0.018, 24), new THREE.MeshStandardMaterial({ color, roughness: 0.35 }), x, 1.07, 0.227);
      b.rotation.x = Math.PI / 2;
    };
    btn(0x1d1d1e, 0.03);
    btn(0x1f7a3f, 0.09);
    const plate = add(new RoundedBoxGeometry(0.075, 0.075, 0.006, 2, 0.008), new THREE.MeshStandardMaterial({ color: 0xf2c200, roughness: 0.45 }), 0.2, 1.07, 0.218);
    const cap = add(new THREE.SphereGeometry(0.024, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0xd4141c, roughness: 0.25, clearcoat: 0.6 }), 0.2, 1.07, 0.232);
    cap.rotation.x = Math.PI / 2;
    cap.scale.set(1, 0.55, 1);
    add(new THREE.CylinderGeometry(0.017, 0.017, 0.016, 24), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 }), 0.2, 1.07, 0.226).rotation.x = Math.PI / 2;
    void plate;
  }
  if (brand) {
    const vinyl = artTexture('cabVinyl', 1400, 360, (ctx, w, h) => {
      drawLockup(ctx, 20, h * 0.5, h * 0.62, { fill: C.green, shadow: null, word: C.green, align: 'left' });
    });
    const decal = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.134), new THREE.MeshStandardMaterial({ map: vinyl, transparent: true, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 }));
    decal.position.set(-0.07, 1.7, 0.2152);
    g.add(decal);
    const warn = artTexture('cabWarn', 256, 230, (ctx, w, h) => {
      ctx.fillStyle = '#F2C200';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 16;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(w / 2, 14); ctx.lineTo(w - 12, h - 12); ctx.lineTo(12, h - 12); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.moveTo(140, 70); ctx.lineTo(96, 150); ctx.lineTo(126, 150); ctx.lineTo(110, 200); ctx.lineTo(164, 118); ctx.lineTo(132, 118); ctx.closePath();
      ctx.fill();
    });
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.054), new THREE.MeshStandardMaterial({ map: warn, transparent: true, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2 }));
    w.position.set(0.3, 1.56, 0.2152);
    g.add(w);
  }
  return g;
}

export function createCabinet(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0f10);
  scene.environment = studioEnv(stage.renderer, 'warehouse');
  scene.environmentIntensity = 0.55;

  const hmiCanvas = makeCanvas(1280, 1024);
  const hmiTex = new THREE.CanvasTexture(hmiCanvas);
  hmiTex.colorSpace = THREE.SRGBColorSpace;
  hmiTex.anisotropy = 8;

  const row = new THREE.Group();
  [[-0.81, {}], [0, { hmi: true, brand: true, hmiTex }], [0.81, {}], [1.62, {}]].forEach(([x, o]) => {
    const u = cabinetUnit(o);
    u.position.x = x;
    row.add(u);
  });
  scene.add(row);

  // Piso epóxi com faixa de segurança e parede de fundo.
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x8e948f, roughness: 1, ...maps('concrete', [3, 3]) });
  floorMat.map = null;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), floorMat);
  fl.rotation.x = -Math.PI / 2;
  fl.receiveShadow = true;
  scene.add(fl);
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.08), new THREE.MeshStandardMaterial({ color: 0xe8b400, roughness: 0.6 }));
  stripe.rotation.x = -Math.PI / 2;
  stripe.position.set(0, 0.002, 0.95);
  scene.add(stripe);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), new THREE.MeshStandardMaterial({ color: 0x3d4240, roughness: 1, ...maps('plaster', [8, 4]) }));
  wall.position.set(0, 3, -0.25);
  wall.receiveShadow = true;
  scene.add(wall);

  const key = new THREE.SpotLight(0xfff4e8, 38, 0, 0.6, 0.75, 1.6);
  key.position.set(-1.9, 3.6, 2.8);
  key.target.position.set(0.1, 1.1, 0.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.01;
  scene.add(key, key.target);
  const rim = new THREE.PointLight(0x9fc4ff, 6, 6, 1.5);
  rim.position.set(1.8, 2.4, 1.2);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 9 / 16, 0.05, 50);
  const hctx = hmiCanvas.getContext('2d');
  return {
    scene, camera,
    post: { toneMap: 1, exposure: 1.0, vignette: 0.32, grain: 0.04, gtao: { radius: 0.08, intensity: 1 }, bokeh: { focus: 3.7, aperture: 0.0008, maxblur: 0.005 }, bloom: 0.12, bloomThreshold: 1.3, bloomRadius: 0.35, ca: 0.0015 },
    update(t, d) {
      drawHMI(hctx, t + 3);
      hmiTex.needsUpdate = true;
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(-1.95, -1.6, k), lerp(1.35, 1.32, k), lerp(3.35, 3.1, k));
      camera.lookAt(lerp(0.12, 0.16, k), 1.05, 0.2);
    },
  };
}
