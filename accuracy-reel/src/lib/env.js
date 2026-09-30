import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

/* Ambientes de iluminação (mapas de reflexo pré-filtrados via PMREM). */

function gradientRoom(top, horizon, bottom, radius = 30) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { top: { value: new THREE.Color(...top) }, mid: { value: new THREE.Color(...horizon) }, bot: { value: new THREE.Color(...bottom) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `varying vec3 vP; uniform vec3 top, mid, bot;
      void main(){ float y = vP.y; vec3 c = y > 0. ? mix(mid, top, smoothstep(0., .9, y)) : mix(mid, bot, smoothstep(0., .6, -y)); gl_FragColor = vec4(c, 1.); }`,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24), mat);
}

function softbox(scene, w, h, pos, intensity, color = [1, 1, 1]) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color[0] * intensity, color[1] * intensity, color[2] * intensity), side: THREE.DoubleSide }),
  );
  m.position.set(...pos);
  m.lookAt(0, 0, 0);
  scene.add(m);
  return m;
}

const PRESETS = {
  // Estúdio claro para produtos sobre fundo branco.
  product: s => {
    s.add(gradientRoom([1.0, 1.0, 1.0], [0.62, 0.62, 0.62], [0.3, 0.3, 0.3]));
    softbox(s, 10, 6, [0, 12, 2], 3.2);
    softbox(s, 3, 9, [-11, 3, 3], 2.2);
    softbox(s, 3, 9, [10, 2, -3], 1.3);
    softbox(s, 8, 3, [0, 2, 12], 1.0);
  },
  // Contraste alto para cromo: fundo escuro com faixas de luz.
  chrome: s => {
    s.add(gradientRoom([0.08, 0.08, 0.09], [0.35, 0.35, 0.36], [0.02, 0.02, 0.02]));
    softbox(s, 14, 1.6, [0, 9, 6], 9);
    softbox(s, 1.4, 12, [-10, 1, 3], 7);
    softbox(s, 1.0, 12, [9, 0, -2], 5);
    softbox(s, 12, 0.7, [0, -4, 10], 4);
    softbox(s, 6, 5, [0, 2, -12], 2.5);
    softbox(s, 0.8, 8, [4, 6, 9], 6);
  },
  // Ambiente escuro com janela lateral (notebook, cartões sobre superfície escura).
  dark: s => {
    s.add(gradientRoom([0.12, 0.12, 0.13], [0.05, 0.05, 0.05], [0.015, 0.015, 0.015]));
    softbox(s, 8, 10, [-14, 5, 2], 3.5, [1, 0.98, 0.95]);
    softbox(s, 6, 2, [0, 12, 0], 1.2);
  },
  // Galpão industrial: teto com luminárias lineares e parede de janelas.
  warehouse: s => {
    s.add(gradientRoom([0.16, 0.16, 0.17], [0.2, 0.2, 0.2], [0.08, 0.08, 0.08]));
    for (let i = -3; i <= 3; i++) softbox(s, 0.5, 6, [i * 3.2, 11, 0], 7, [1, 0.97, 0.9]);
    softbox(s, 20, 5, [0, 4, -14], 1.6, [0.85, 0.9, 1]);
  },
};

export function studioEnv(renderer, preset = 'product') {
  const scene = new THREE.Scene();
  PRESETS[preset](scene);
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(scene, 0.03, 0.1, 100);
  pm.dispose();
  scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  return rt.texture;
}

/* Céu físico (Sky do three.js) + ambiente derivado dele.
   elevation/azimuth em graus. Devolve { sky, env, sunDir }. */
export function skySetup(renderer, { elevation = 35, azimuth = 150, turbidity = 4, rayleigh = 1.2, mie = 0.004, mieG = 0.8, scale = 800 } = {}) {
  const sky = new Sky();
  sky.scale.setScalar(scale);
  const u = sky.material.uniforms;
  u.turbidity.value = turbidity;
  u.rayleigh.value = rayleigh;
  u.mieCoefficient.value = mie;
  u.mieDirectionalG.value = mieG;
  const phi = THREE.MathUtils.degToRad(90 - elevation), theta = THREE.MathUtils.degToRad(azimuth);
  const sunDir = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
  u.sunPosition.value.copy(sunDir);
  const envScene = new THREE.Scene();
  const skyCopy = new Sky();
  skyCopy.scale.setScalar(scale);
  skyCopy.material.uniforms = THREE.UniformsUtils.clone(u);
  envScene.add(skyCopy);
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(envScene, 0.02, 1, scale * 2).texture;
  pm.dispose();
  return { sky, env, sunDir };
}

/* Céu em degradê (controle total das cores) + ambiente com disco solar.
   Cores em sRGB; intensidade multiplica o céu inteiro. */
export function gradientSky(renderer, { zenith = '#2F6DBF', horizon = '#A9C8E6', ground = '#4a4d50', sunDir = new THREE.Vector3(0.3, 0.8, 0.5), sunSize = 0.04, sunPower = 60, intensity = 1.2, radius = 800 } = {}) {
  const lin = hex => { const c = new THREE.Color(hex); return [c.r * intensity, c.g * intensity, c.b * intensity]; };
  const mesh = gradientRoom(lin(zenith), lin(horizon), lin(ground), radius);
  const envScene = new THREE.Scene();
  envScene.add(gradientRoom(lin(zenith), lin(horizon), lin(ground), 30));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(30 * sunSize, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(sunPower, sunPower * 0.95, sunPower * 0.85) }));
  disc.position.copy(sunDir.clone().normalize().multiplyScalar(28));
  disc.lookAt(0, 0, 0);
  envScene.add(disc);
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(envScene, 0.02, 0.1, 100).texture;
  pm.dispose();
  return { mesh, env };
}
