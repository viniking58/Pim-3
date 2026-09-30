import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { studioEnv } from '../lib/env.js';
import { floor } from '../lib/objects.js';
import { maps, makeCanvas } from '../lib/tex.js';
import { drawWebsite, drawMobileSite } from '../lib/screens.js';
import { E, range, lerp } from '../lib/util.js';

/* Notebook numa mesa escura e tablet + celular sobre mesa clara,
   com o site institucional nas telas. setPhoto() troca a foto do destaque. */

function screenTexture(w, h, draw) {
  const c = makeCanvas(w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  const redraw = photo => { draw(c.getContext('2d'), photo); t.needsUpdate = true; };
  redraw(null);
  return { tex: t, redraw };
}

const glassScreen = tex => new THREE.MeshPhysicalMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.05, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04 });

export function createLaptop(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0c0d);
  scene.environment = studioEnv(stage.renderer, 'dark');
  scene.environmentIntensity = 1.1;
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshStandardMaterial({ color: 0x1b1c1d, roughness: 1, ...maps('plaster', [10, 10]) }));
  desk.material.normalScale.set(0.3, 0.3);
  desk.rotation.x = -Math.PI / 2;
  desk.receiveShadow = true;
  scene.add(desk);

  const alu = new THREE.MeshPhysicalMaterial({ color: 0x4e5257, metalness: 0.85, roughness: 0.33 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(0.312, 0.014, 0.221, 3, 0.006), alu);
  base.position.y = 0.007;
  base.castShadow = base.receiveShadow = true;
  scene.add(base);
  const keys = makeCanvas(1024, 520), kg = keys.getContext('2d');
  kg.fillStyle = '#3f4246';
  kg.fillRect(0, 0, 1024, 520);
  for (let r = 0; r < 6; r++) for (let c = 0; c < 14; c++) { kg.fillStyle = '#16171a'; kg.fillRect(30 + c * 70, 20 + r * 76, 60, 62); }
  kg.fillStyle = '#16171a';
  kg.fillRect(250, 20 + 5 * 76, 520, 62);
  const keyTex = new THREE.CanvasTexture(keys);
  keyTex.colorSpace = THREE.SRGBColorSpace;
  const kb = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.105), new THREE.MeshStandardMaterial({ map: keyTex, roughness: 0.6, metalness: 0.2 }));
  kb.rotation.x = -Math.PI / 2;
  kb.position.set(0, 0.01405, -0.035);
  scene.add(kb);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.07), new THREE.MeshPhysicalMaterial({ color: 0x45494e, metalness: 0.7, roughness: 0.25 }));
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, 0.01405, 0.06);
  scene.add(pad);

  const site = screenTexture(1600, 1000, (g, photo) => drawWebsite(g, photo));
  const lid = new THREE.Group();
  const shell = new THREE.Mesh(new RoundedBoxGeometry(0.312, 0.21, 0.006, 3, 0.004), alu);
  shell.castShadow = true;
  lid.add(shell);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(0.304, 0.203), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.3 }));
  bezel.position.z = 0.00305;
  lid.add(bezel);
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.181), glassScreen(site.tex));
  disp.position.set(0, 0.004, 0.0031);
  lid.add(disp);
  const pivot = new THREE.Group();
  pivot.position.set(0, 0.014, -0.108);
  lid.position.set(0, 0.105, 0.003);
  pivot.add(lid);
  pivot.rotation.x = -0.32;
  scene.add(pivot);

  const key = new THREE.SpotLight(0xfff4ea, 6, 0, 0.6, 0.9, 1.5);
  key.position.set(-0.9, 0.9, 0.5);
  key.target.position.set(0, 0.05, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0002;
  scene.add(key, key.target);

  const camera = new THREE.PerspectiveCamera(28, 9 / 16, 0.01, 20);
  return {
    scene, camera,
    setPhoto: photo => site.redraw(photo),
    post: { toneMap: 1, exposure: 1.1, vignette: 0.4, grain: 0.04, gtao: { radius: 0.02, intensity: 1 }, bloom: 0.15, bloomThreshold: 1.1, bokeh: { focus: 1.2, aperture: 0.002, maxblur: 0.006 }, ca: 0.0015 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(-0.52, -0.46, k), lerp(0.36, 0.33, k), lerp(1.12, 1.02, k));
      camera.lookAt(0.0, 0.09, -0.05);
    },
  };
}

export function createDevices(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe7e7e5);
  scene.environment = studioEnv(stage.renderer, 'product');
  scene.environmentIntensity = 0.95;
  floor(scene, { color: 0xececea, repeat: 12 });
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-1.2, 2.6, 0.8);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -0.5, right: 0.5, top: 0.5, bottom: -0.5, near: 0.5, far: 6 });
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.002;
  scene.add(key);

  const frame = new THREE.MeshPhysicalMaterial({ color: 0x2a2c2f, metalness: 0.8, roughness: 0.3 });
  const device = (w, d, th, r, tex, sw, sd) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(w, th, d, 4, r), frame);
    body.castShadow = body.receiveShadow = true;
    g.add(body);
    const black = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.004, d - 0.004), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2 }));
    black.rotation.x = -Math.PI / 2;
    black.position.y = th / 2 + 0.0002;
    g.add(black);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(sw, sd), glassScreen(tex));
    s.rotation.x = -Math.PI / 2;
    s.position.y = th / 2 + 0.0004;
    g.add(s);
    return g;
  };
  const tab = screenTexture(1600, 1000, (g, photo) => drawWebsite(g, photo));
  const mob = screenTexture(750, 1624, (g, photo) => drawMobileSite(g, photo));
  const tablet = device(0.25, 0.175, 0.0065, 0.012, tab.tex, 0.234, 0.158);
  tablet.rotation.y = 0.16;
  tablet.position.set(-0.02, 0.0033, -0.08);
  const phone = device(0.075, 0.156, 0.008, 0.011, mob.tex, 0.069, 0.149);
  phone.rotation.y = -0.2;
  phone.position.set(0.06, 0.004, 0.115);
  scene.add(tablet, phone);

  const camera = new THREE.PerspectiveCamera(30, 9 / 16, 0.01, 20);
  return {
    scene, camera,
    setPhoto: photo => { tab.redraw(photo); mob.redraw(photo); },
    post: { toneMap: 2, exposure: 1.0, vignette: 0.12, grain: 0.03, gtao: { radius: 0.02, intensity: 1 }, ca: 0.001 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(0.06, 0.05, k), lerp(1.12, 1.04, k), lerp(0.34, 0.31, k));
      camera.lookAt(0.02, 0, 0.02);
    },
  };
}
