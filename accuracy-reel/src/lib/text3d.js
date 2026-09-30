import * as THREE from 'three';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { WORD_WOFF } from './wordfont.js';
import { logoGeometry, LOGO, BRAND } from '../logo.js';

/* Texto 3D com a fonte do logotipo (Barlow Semi Condensed ExtraBold Italic). */
let font = null;
export function wordFont() {
  if (!font) {
    const bin = Uint8Array.from(atob(WORD_WOFF), c => c.charCodeAt(0));
    font = new Font(new TTFLoader().parse(bin.buffer));
  }
  return font;
}

export function textGeometry(str, size, depth, { bevel = 0 } = {}) {
  const g = new TextGeometry(str, {
    font: wordFont(), size, depth, curveSegments: 6,
    bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.6, bevelSegments: 2,
  });
  g.computeBoundingBox();
  return g;
}

/* Assinatura em 3D: símbolo + duas linhas de texto, proporções do 2D.
   Origem no centro; h = altura do símbolo; depth relativo à altura. */
export function lockup3D(h, material, { depth = 0.08, textDepth = null, bevel = 0.004 } = {}) {
  const group = new THREE.Group();
  const lw = (h * LOGO.w) / LOGO.h;
  const logo = new THREE.Mesh(logoGeometry(h, depth, bevel), material);
  group.add(logo);
  const fs = h * 0.47;
  const td = textDepth ?? depth * h;
  // O TTFLoader normaliza o em em 1388,9/1000 unidades: 0,72 converte para o tamanho do canvas.
  const l1 = new THREE.Mesh(textGeometry(BRAND.line1, fs * 0.72, td), material);
  const l2 = new THREE.Mesh(textGeometry(BRAND.line2, fs * 0.72, td), material);
  const gap = h * 0.26;
  const x0 = lw / 2 + gap;
  l1.position.set(x0, h * 0.035, -td / 2);
  l2.position.set(x0 - fs * 0.06, -fs * 0.88, -td / 2);
  group.add(l1, l2);
  // Centraliza o conjunto na horizontal.
  const w2 = Math.max(l1.geometry.boundingBox.max.x, l2.geometry.boundingBox.max.x);
  const total = lw + gap + w2;
  group.children.forEach(c => { c.position.x -= total / 2 - lw / 2; });
  group.userData.width = total;
  group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return group;
}
