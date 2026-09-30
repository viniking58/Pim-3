import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { gradientSky } from '../lib/env.js';
import { makeCanvas } from '../lib/tex.js';
import { C, txt, drawLockup, stripes } from '../lib/art.js';
import { E, range, lerp, rng } from '../lib/util.js';

/* Totem luminoso na entrada de uma fábrica de celulose, ao anoitecer. */
function drawPoster(g, photo) {
  const w = 1200, h = 2400;
  g.fillStyle = C.green;
  g.fillRect(0, 0, w, h);
  drawLockup(g, 110, 250, 120, { align: 'left' });
  if (photo) {
    const ph = 900, s = Math.max((w - 160) / photo.width, ph / photo.height);
    g.save();
    g.beginPath();
    g.rect(80, 480, w - 160, ph);
    g.clip();
    g.drawImage(photo, 80 + (w - 160 - photo.width * s) / 2, 480 + (ph - photo.height * s) / 2, photo.width * s, photo.height * s);
    g.restore();
  } else stripes(g, 80, 480, w - 160, 900, { color: 'rgba(255,255,255,0.12)', bar: 90, gap: 60 });
  txt(g, 'Precisão que', 100, 1600, { size: 124, weight: 700, color: '#FFFFFF' });
  txt(g, 'move o papel.', 100, 1740, { size: 124, weight: 700, color: '#FFFFFF' });
  txt(g, 'Automação industrial para', 104, 1880, { size: 50, weight: 400, color: 'rgba(255,255,255,0.85)' });
  txt(g, 'papel e celulose.', 104, 1945, { size: 50, weight: 400, color: 'rgba(255,255,255,0.85)' });
  stripes(g, 0, h - 220, w, 220, { color: 'rgba(255,255,255,0.14)', bar: 70, gap: 46 });
}

export function createTotem(stage) {
  const scene = new THREE.Scene();
  const sunDir = new THREE.Vector3(0.4, -0.02, -1).normalize();
  const { mesh: sky, env } = gradientSky(stage.renderer, { zenith: '#1A2644', horizon: '#E0906A', ground: '#141416', sunDir, sunPower: 6, sunSize: 0.12, intensity: 0.55 });
  scene.add(sky);
  scene.environment = env;
  scene.environmentIntensity = 0.6;
  scene.fog = new THREE.Fog(0x2a2733, 12, 70);

  // Chão molhado (reflete o céu e o totem).
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x151618, roughness: 0.22, metalness: 0.0 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const curb = new THREE.Mesh(new THREE.BoxGeometry(40, 0.15, 3), new THREE.MeshStandardMaterial({ color: 0x3a3b3d, roughness: 0.85 }));
  curb.position.set(0, 0.075, -0.8);
  curb.receiveShadow = true;
  scene.add(curb);

  // Silhueta da fábrica: galpões, chaminé e vapor, janelas acesas.
  const sil = new THREE.MeshStandardMaterial({ color: 0x0f1013, roughness: 0.9 });
  const r = rng(8);
  const addBox = (w, h, d, x, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), sil); m.position.set(x, h / 2, z); scene.add(m); return m; };
  addBox(22, 7, 8, -6, -38);
  addBox(10, 12, 8, 9, -44);
  addBox(6, 18, 6, 16, -50);
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.3, 34, 24), sil);
  chimney.position.set(4, 17, -48);
  scene.add(chimney);
  for (let i = 0; i < 60; i++) {
    const wnd = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.4, 1.4) }));
    wnd.position.set(-16 + r() * 20, 1 + r() * 5.5, -33.95);
    if (r() > 0.45) scene.add(wnd);
  }
  const steam = new THREE.Mesh(new THREE.SphereGeometry(4, 24, 16), new THREE.MeshBasicMaterial({ color: 0x8d8a96, transparent: true, opacity: 0.25, depthWrite: false }));
  steam.scale.set(1.4, 0.9, 1);
  steam.position.set(6, 37, -48);
  scene.add(steam);
  // Postes de luz ao longo da via.
  for (let i = 0; i < 6; i++) {
    const x = -14 + i * 7, z = -6;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 6, 8), sil);
    pole.position.set(x, 3, z);
    scene.add(pole);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 4.6, 3) }));
    bulb.position.set(x, 6, z);
    scene.add(bulb);
    const l = new THREE.PointLight(0xffc98f, 12, 14, 1.8);
    l.position.set(x, 5.8, z);
    scene.add(l);
  }

  // Totem: moldura de alumínio + face luminosa.
  const posterCanvas = makeCanvas(1200, 2400);
  const posterTex = new THREE.CanvasTexture(posterCanvas);
  posterTex.colorSpace = THREE.SRGBColorSpace;
  posterTex.anisotropy = 8;
  const redraw = photo => { drawPoster(posterCanvas.getContext('2d'), photo); posterTex.needsUpdate = true; };
  redraw(null);
  const totem = new THREE.Group();
  const frameMat = new THREE.MeshPhysicalMaterial({ color: 0x2b2d30, metalness: 0.8, roughness: 0.35 });
  const box = new THREE.Mesh(new RoundedBoxGeometry(1.3, 2.5, 0.2, 3, 0.02), frameMat);
  box.position.y = 1.25 + 0.3;
  box.castShadow = true;
  totem.add(box);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.4), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: posterTex, emissiveIntensity: 1.6 }));
  face.position.set(0, 1.55, 0.1005);
  totem.add(face);
  const base = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.3, 0.3, 2, 0.02), frameMat);
  base.position.y = 0.15;
  totem.add(base);
  totem.position.set(0, 0, 0.4);
  totem.rotation.y = -0.22;
  scene.add(totem);
  // Luz que o totem projeta no chão.
  const spill = new THREE.PointLight(0x7fd0b4, 6, 5, 2);
  spill.position.set(0.1, 1.4, 1.2);
  scene.add(spill);

  const camera = new THREE.PerspectiveCamera(36, 9 / 16, 0.1, 400);
  return {
    scene, camera,
    setPhoto: redraw,
    post: { toneMap: 1, exposure: 1.1, vignette: 0.38, grain: 0.05, bloom: 0.45, bloomThreshold: 0.8, bloomRadius: 0.6, bokeh: { focus: 4.3, aperture: 0.0006, maxblur: 0.006 }, ca: 0.002 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(1.3, 1.05, k), lerp(1.2, 1.25, k), lerp(5.2, 4.5, k));
      camera.lookAt(lerp(-0.15, -0.1, k), 1.9, 0);
    },
  };
}
