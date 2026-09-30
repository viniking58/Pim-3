import * as THREE from 'three';
import { studioEnv } from '../lib/env.js';
import { maps } from '../lib/tex.js';
import { corrugatedGeometry } from './facade.js';
import { C, txt, mark, stripes, drawLogo, artTexture, WORD } from '../lib/art.js';
import { E, range, lerp, rng } from '../lib/util.js';

export const CARD = { w: 0.085, h: 0.055, t: 0.00038 };

export function cardFront() {
  return artTexture('cardFront', 1700, 1100, (ctx, w, h) => {
    ctx.fillStyle = '#F7F7F4';
    ctx.fillRect(0, 0, w, h);
    mark(ctx, 250, 210, 170);
    txt(ctx, 'Nome Sobrenome', 110, 760, { size: 78, weight: 600, color: C.ink });
    txt(ctx, 'Engenharia de Automação', 110, 832, { size: 44, weight: 400, color: '#5B625F' });
    txt(ctx, '+55 (00) 0000-0000', 110, 960, { size: 40, weight: 500, color: C.ink });
    stripes(ctx, w - 330, 0, 330, h, { bar: 70, gap: 46 });
  }, { anisotropy: 16 });
}

export function cardBack() {
  return artTexture('cardBack', 1700, 1100, (ctx, w, h) => {
    ctx.fillStyle = C.green;
    ctx.fillRect(0, 0, w, h);
    drawLogo(ctx, w / 2, h / 2 - 30, 330);
    txt(ctx, 'ACCURACY AUTOMATION', w / 2, h - 150, { size: 58, weight: 800, italic: true, family: WORD, color: '#FFFFFF', align: 'center', spacing: 3 });
  }, { anisotropy: 16 });
}

/* Pilha de cartões sobre chapa metálica nervurada, luz dura lateral. */
export function createCards(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x151618);
  scene.environment = studioEnv(stage.renderer, 'dark');
  scene.environmentIntensity = 0.9;

  const sun = new THREE.DirectionalLight(0xfff3e4, 4.2);
  sun.position.set(-0.9, 1.1, 0.35);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -0.25, right: 0.25, top: 0.25, bottom: -0.25, near: 0.2, far: 4 });
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.002;
  scene.add(sun);

  // Chapa nervurada (deitada) em aço galvanizado.
  const metal = new THREE.MeshStandardMaterial({ color: 0x8d9398, metalness: 0.8, roughness: 0.42 });
  const plate = new THREE.Mesh(corrugatedGeometry(1.2, 1.2, { pitch: 0.021, rib: 0.0045, top: 0.006 }), metal);
  plate.rotation.set(-Math.PI / 2, 0, 1.05);
  plate.position.set(0, 0, 0.6);
  plate.receiveShadow = true;
  scene.add(plate);
  const base = 0.0046;

  const paper = new THREE.MeshStandardMaterial({ color: 0xf5f5f1, roughness: 0.82, ...maps('paper', [1, 1]) });
  const front = new THREE.MeshStandardMaterial({ map: cardFront(), roughness: 0.78 });
  const back = new THREE.MeshStandardMaterial({ map: cardBack(), roughness: 0.7 });
  const geo = new THREE.BoxGeometry(CARD.w, CARD.t, CARD.h);
  const r = rng(5);
  const stack = new THREE.Group();
  const N = 28;
  for (let i = 0; i < N; i++) {
    const top = i === N - 1;
    const m = new THREE.Mesh(geo, [paper, paper, top ? front : paper, paper, paper, paper]);
    m.position.set((r() - 0.5) * 0.0012, base + CARD.t * (i + 0.5), (r() - 0.5) * 0.0012);
    m.rotation.y = (r() - 0.5) * 0.02;
    m.castShadow = true;
    m.receiveShadow = true;
    stack.add(m);
  }
  stack.rotation.y = -0.35;
  scene.add(stack);
  // Um cartão solto mostrando o verso verde.
  const loose = new THREE.Mesh(geo, [paper, paper, back, paper, paper, paper]);
  loose.position.set(0.04, base + CARD.t / 2, 0.064);
  loose.rotation.y = 0.28;
  loose.castShadow = true;
  loose.receiveShadow = true;
  scene.add(loose);

  const camera = new THREE.PerspectiveCamera(30, 9 / 16, 0.01, 10);
  const target = new THREE.Vector3(0.018, base + CARD.t * N, 0.03);
  return {
    scene, camera,
    post: { toneMap: 1, exposure: 1.05, vignette: 0.35, grain: 0.04, gtao: { radius: 0.012, intensity: 0.9 }, bokeh: { focus: 0.44, aperture: 0.003, maxblur: 0.005 }, ca: 0.0015 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(0.13, 0.12, k), lerp(0.4, 0.38, k), lerp(0.22, 0.2, k));
      camera.lookAt(target);
    },
  };
}
