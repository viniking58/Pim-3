import * as THREE from 'three';
import { makeCanvas } from './tex.js';

/* Plano 2D: um canvas 1080×1920 desenhado a cada quadro e exibido numa
   tela cheia (passa pelo mesmo pós-processamento, sem tone mapping). */
export function flatShot(draw, post = {}) {
  const canvas = makeCanvas(1080, 1920);
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  const scene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  quad.frustumCulled = false;
  // Com fov 90° a 1 unidade de distância, a altura visível é 2: o quadro
  // 9:16 cobre exatamente a tela.
  quad.scale.set(9 / 16, 1, 1);
  scene.add(quad);
  const camera = new THREE.PerspectiveCamera(90, 9 / 16, 0.1, 10);
  camera.position.z = 1;
  return {
    scene, camera, canvas,
    post: { toneMap: 0, vignette: 0, grain: 0.02, ca: 0, ...post },
    update(t, d) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      draw(ctx, t, d);
      tex.needsUpdate = true;
    },
  };
}
