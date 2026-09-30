import * as THREE from 'three';
import { studioEnv } from '../lib/env.js';
import { keyLight, floor, printedBox } from '../lib/objects.js';
import { C, txt, mark, drawLockup, stripes, barcode, drawLogo, WORD } from '../lib/art.js';
import { E, range, lerp } from '../lib/util.js';

/* Embalagens de componentes em estúdio branco, vistas de cima. */
export function createPackaging(stage) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe9e9e7);
  scene.environment = studioEnv(stage.renderer, 'product');
  scene.environmentIntensity = 0.9;
  floor(scene, { color: 0xeaeae8, repeat: 30 });
  keyLight(scene, { pos: [-1.6, 3.2, -0.8], intensity: 2.4, size: 0.9, mapSize: 4096 });

  const label = (ctx, w, h, title, sub) => {
    ctx.fillStyle = '#F5F5F2';
    ctx.fillRect(0, 0, w, h);
    mark(ctx, w * 0.2, h * 0.3, h * 0.2);
    txt(ctx, title, w * 0.08, h * 0.62, { size: h * 0.075, weight: 700, color: C.ink });
    txt(ctx, sub, w * 0.08, h * 0.72, { size: h * 0.045, weight: 500, color: '#5F6663' });
    barcode(ctx, w * 0.08, h * 0.8, w * 0.36, h * 0.1, 7);
    txt(ctx, 'AA-' + title.length + '0417-24V', w * 0.08, h * 0.95, { size: h * 0.035, weight: 500, color: '#5F6663' });
  };

  // Caixa principal (branca, tampa com o símbolo grande).
  const A = printedBox('pkgA', [0.4, 0.15, 0.3], {
    py: (ctx, w, h) => {
      ctx.fillStyle = '#F6F6F3';
      ctx.fillRect(0, 0, w, h);
      mark(ctx, w * 0.5, h * 0.46, h * 0.36);
      txt(ctx, 'ACCURACY AUTOMATION', w * 0.5, h * 0.84, { size: h * 0.052, weight: 800, italic: true, family: WORD, color: C.green, align: 'center', spacing: 2 });
    },
    pz: (ctx, w, h) => {
      ctx.fillStyle = '#F6F6F3';
      ctx.fillRect(0, 0, w, h);
      stripes(ctx, w * 0.72, 0, w * 0.28, h, { bar: h * 0.16, gap: h * 0.1 });
      txt(ctx, 'Módulo de controle', w * 0.06, h * 0.42, { size: h * 0.14, weight: 700, color: C.ink });
      txt(ctx, 'Automação industrial · Papel e celulose', w * 0.06, h * 0.62, { size: h * 0.085, weight: 500, color: '#5F6663' });
    },
    px: (ctx, w, h) => label(ctx, w, h, 'I/O REMOTO', 'Entradas e saídas 24 VDC'),
  }, { radius: 0.003 });
  A.position.set(-0.02, 0.075, -0.02);
  A.rotation.y = 0.38;
  scene.add(A);

  // Cubo verde.
  const B = printedBox('pkgB', [0.16, 0.16, 0.16], {
    py: (ctx, w, h) => { ctx.fillStyle = C.green; ctx.fillRect(0, 0, w, h); drawLogo(ctx, w / 2, h / 2, h * 0.36); },
    pz: (ctx, w, h) => { ctx.fillStyle = C.green; ctx.fillRect(0, 0, w, h); drawLockup(ctx, w * 0.1, h * 0.8, h * 0.11, { align: 'left' }); },
    px: (ctx, w, h) => { ctx.fillStyle = C.green; ctx.fillRect(0, 0, w, h); stripes(ctx, 0, h * 0.62, w, h * 0.38, { color: 'rgba(255,255,255,0.14)', bar: h * 0.1, gap: h * 0.07 }); },
  }, { base: C.green, radius: 0.003 });
  B.position.set(0.1, 0.08, 0.34);
  B.rotation.y = 0.62;
  scene.add(B);

  // Caixa alta branca (sensor).
  const Cbox = printedBox('pkgC', [0.13, 0.22, 0.13], {
    pz: (ctx, w, h) => {
      ctx.fillStyle = '#F6F6F3';
      ctx.fillRect(0, 0, w, h);
      mark(ctx, w * 0.5, h * 0.26, h * 0.16);
      txt(ctx, 'SENSOR DE', w * 0.5, h * 0.55, { size: h * 0.07, weight: 700, color: C.ink, align: 'center' });
      txt(ctx, 'CONSISTÊNCIA', w * 0.5, h * 0.63, { size: h * 0.07, weight: 700, color: C.ink, align: 'center' });
      ctx.fillStyle = C.green;
      ctx.fillRect(0, h * 0.84, w, h * 0.16);
    },
    px: (ctx, w, h) => label(ctx, w, h, 'SC-400', 'Polpa 2 a 16 %'),
    py: (ctx, w, h) => { ctx.fillStyle = '#F6F6F3'; ctx.fillRect(0, 0, w, h); mark(ctx, w / 2, h / 2, h * 0.3); },
  }, { radius: 0.003 });
  Cbox.position.set(-0.12, 0.11, -0.36);
  Cbox.rotation.y = 0.3;
  scene.add(Cbox);

  const camera = new THREE.PerspectiveCamera(30, 9 / 16, 0.05, 50);
  const target = new THREE.Vector3(0.0, 0.05, 0.0);
  return {
    scene, camera,
    post: { toneMap: 2, exposure: 1.05, vignette: 0.12, grain: 0.03, gtao: { radius: 0.06, intensity: 1 }, ca: 0.001 },
    update(t, d) {
      const k = E.inOutSine(range(t, 0, d));
      camera.position.set(lerp(0.62, 0.55, k), lerp(1.62, 1.52, k), lerp(1.02, 0.95, k));
      camera.lookAt(target);
    },
  };
}
