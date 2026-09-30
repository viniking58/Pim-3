import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { maps } from './tex.js';
import { artTexture } from './art.js';

/* Construtores 3D reutilizáveis: caixas impressas, pisos, luzes. */

export function keyLight(scene, { pos = [2, 4, 2], target = [0, 0, 0], intensity = 3, color = 0xffffff, size = 1.5, mapSize = 2048, bias = -0.0004, normalBias = 0.02, near = 0.1, far = 20 } = {}) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.set(...pos);
  l.target.position.set(...target);
  l.castShadow = true;
  l.shadow.mapSize.set(mapSize, mapSize);
  const c = l.shadow.camera;
  c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = near; c.far = far;
  l.shadow.bias = bias;
  l.shadow.normalBias = normalBias;
  scene.add(l, l.target);
  return l;
}

export function floor(scene, { color = 0xececea, size = 20, rough = 0.85, kind = 'paper', repeat = 12, y = 0 } = {}) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshStandardMaterial({ color, roughness: rough, ...(kind ? maps(kind, [repeat, repeat]) : {}) }),
  );
  if (m.material.roughnessMap) m.material.roughness = 1;
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  m.receiveShadow = true;
  scene.add(m);
  return m;
}

/* Caixa com cantos arredondados e uma arte por face.
   faces: { px, nx, py, ny, pz, nz } → função (ctx, w, h) ou cor '#hex'.
   ppm = pixels por metro nas texturas. */
export function printedBox(key, [w, h, d], faces, { radius = 0.004, ppm = 2400, rough = 0.5, base = '#F4F4F1', kind = 'paper', metal = 0, clearcoat = 0 } = {}) {
  const geo = new RoundedBoxGeometry(w, h, d, 3, radius);
  const dims = { px: [d, h], nx: [d, h], py: [w, d], ny: [w, d], pz: [w, h], nz: [w, h] };
  const detail = kind ? maps(kind, [1, 1]) : {};
  const mats = ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map(f => {
    const face = faces[f] ?? base;
    const params = { roughness: rough, metalness: metal, clearcoat, clearcoatRoughness: 0.25, normalMap: detail.normalMap, normalScale: new THREE.Vector2(0.4, 0.4) };
    if (typeof face === 'function') {
      const [fw, fh] = dims[f];
      params.map = artTexture(`${key}:${f}`, Math.min(2048, Math.round(fw * ppm)), Math.min(2048, Math.round(fh * ppm)), face);
    } else params.color = new THREE.Color(face);
    return new THREE.MeshPhysicalMaterial(params);
  });
  const mesh = new THREE.Mesh(geo, mats);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// Ajuda para enquadrar: câmera olhando para um alvo.
export function aim(camera, pos, target) {
  camera.position.set(...pos);
  camera.lookAt(new THREE.Vector3(...target));
}
