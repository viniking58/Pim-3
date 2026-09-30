import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

/* Passo final: exposição, tone mapping, vinheta, grão, aberração cromática,
   desfoque direcional (transições "whip") e flash. */
const FinalShader = {
  uniforms: {
    tDiffuse: { value: null },
    toneMappingExposure: { value: 1 },
    uExposure: { value: 1 },
    uToneMap: { value: 2 },
    uVignette: { value: 0.3 },
    uGrain: { value: 0.035 },
    uCA: { value: 0.0015 },
    uBlur: { value: new THREE.Vector2() },
    uFlash: { value: 0 },
    uFade: { value: 0 },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1080, 1920) },
    uLift: { value: 0 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uExposure, uToneMap, uVignette, uGrain, uCA, uFlash, uFade, uTime, uLift;
    uniform vec2 uBlur, uRes;
    varying vec2 vUv;
    #include <tonemapping_pars_fragment>
    float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    vec3 sampleCA(vec2 uv) {
      vec2 d = (uv - 0.5) * uCA;
      return vec3(texture2D(tDiffuse, uv + d).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - d).b);
    }
    void main() {
      vec3 col;
      if (dot(uBlur, uBlur) > 1e-8) {
        col = vec3(0.0);
        for (int i = 0; i < 24; i++) {
          float k = float(i) / 23.0 - 0.5;
          col += sampleCA(vUv + uBlur * k);
        }
        col /= 24.0;
      } else {
        col = sampleCA(vUv);
      }
      col *= uExposure;
      if (uToneMap > 2.5) col = ACESFilmicToneMapping(col);
      else if (uToneMap > 1.5) col = NeutralToneMapping(col);
      else if (uToneMap > 0.5) col = AgXToneMapping(col);
      vec2 q = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
      col *= mix(1.0, smoothstep(0.95, 0.2, length(q) * 1.25), uVignette);
      col = sRGBTransferOETF(vec4(max(col, 0.0), 1.0)).rgb;
      col = col * (1.0 - uLift) + uLift;
      col += (hash12(vUv * uRes + fract(uTime * 7.13) * 431.0) - 0.5) * uGrain;
      col = mix(col, vec3(1.0), uFlash);
      col *= 1.0 - uFade;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export const POST_DEFAULTS = {
  exposure: 1, toneMap: 2, vignette: 0.28, grain: 0.035, ca: 0.0015, lift: 0,
  gtao: null, bloom: 0, bokeh: null,
};

export function createStage(canvas, width, height) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NoToneMapping;

  const rt = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(1);
  composer.setSize(width, height);

  const dummyScene = new THREE.Scene(), dummyCam = new THREE.PerspectiveCamera();
  const renderPass = new RenderPass(dummyScene, dummyCam);
  const gtao = new GTAOPass(dummyScene, dummyCam, width, height);
  gtao.enabled = false;
  const bokeh = new BokehPass(dummyScene, dummyCam, { focus: 1, aperture: 0.002, maxblur: 0.008 });
  bokeh.enabled = false;
  const bloom = new UnrealBloomPass(new THREE.Vector2(width / 2, height / 2), 0.2, 0.5, 0.85);
  bloom.enabled = false;
  const final = new ShaderPass(FinalShader);
  final.uniforms.uRes.value.set(width, height);
  [renderPass, gtao, bokeh, bloom, final].forEach(p => composer.addPass(p));

  const stage = {
    renderer, composer, width, height,
    setSize(w, h) {
      stage.width = w; stage.height = h;
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      gtao.setSize(w, h);
      final.uniforms.uRes.value.set(w, h);
    },
    // Renderiza a câmera/cena de um plano com as configurações de pós.
    render(scene, camera, post, fx = {}) {
      const p = { ...POST_DEFAULTS, ...post };
      camera.aspect = stage.width / stage.height;
      camera.updateProjectionMatrix();
      renderPass.scene = scene;
      renderPass.camera = camera;
      if (p.gtao) {
        gtao.enabled = true;
        gtao.scene = scene;
        gtao.camera = camera;
        gtao.blendIntensity = p.gtao.intensity ?? 1;
        gtao.updateGtaoMaterial({ radius: p.gtao.radius ?? 0.25, distanceExponent: 1, thickness: p.gtao.thickness ?? 1, scale: 1, samples: 16 });
        gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
      } else gtao.enabled = false;
      if (p.bokeh) {
        bokeh.enabled = true;
        bokeh.scene = scene;
        bokeh.camera = camera;
        bokeh.uniforms.focus.value = p.bokeh.focus;
        bokeh.uniforms.aperture.value = p.bokeh.aperture ?? 0.002;
        bokeh.uniforms.maxblur.value = p.bokeh.maxblur ?? 0.008;
      } else bokeh.enabled = false;
      bloom.enabled = p.bloom > 0;
      bloom.strength = p.bloom;
      bloom.radius = p.bloomRadius ?? 0.5;
      bloom.threshold = p.bloomThreshold ?? 0.85;
      const u = final.uniforms;
      u.uExposure.value = p.exposure;
      u.uToneMap.value = p.toneMap;
      u.uVignette.value = p.vignette;
      u.uGrain.value = p.grain * 0.55; // grão sutil: realista sem inflar o arquivo
      u.uCA.value = p.ca;
      u.uLift.value = p.lift;
      u.uBlur.value.set(fx.blurX || 0, fx.blurY || 0);
      u.uFlash.value = fx.flash || 0;
      u.uFade.value = fx.fade || 0;
      u.uTime.value = fx.time || 0;
      composer.render();
    },
  };
  return stage;
}
