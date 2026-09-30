import { createIntro } from './shots/intro.js';
import { createLockup, createGrid, createType } from './shots/brand2d.js';
import { createPackaging } from './shots/packaging.js';
import { createFacade } from './shots/facade.js';
import { createBook } from './shots/book.js';
import { createLaptop, createDevices } from './shots/devices.js';
import { createCabinet } from './shots/cabinet.js';
import { createCards } from './shots/cards.js';
import { createStationery } from './shots/stationery.js';
import { createRolls } from './shots/rolls.js';
import { createContainer } from './shots/container.js';
import { createBales } from './shots/bales.js';
import { createWallSign } from './shots/wallsign.js';
import { createHardhat } from './shots/hardhat.js';
import { createNameplate } from './shots/nameplate.js';
import { createBlocks } from './shots/blocks.js';
import { createTotem } from './shots/totem.js';
import { makeCanvas } from './lib/tex.js';
import { clamp, E, range } from './lib/util.js';

export const VIDEO = { width: 1080, height: 1920, fps: 30, bpm: 100 };
export const BEAT = 60 / VIDEO.bpm;

/* Roteiro em batidas (1 batida = 0,6 s), no ritmo do reel de referência.
   whip: entrada com desfoque de movimento ('h' horizontal, 'v' vertical). */
const CUTS = [
  { id: 'intro', label: 'Abertura', beats: 1.2, make: createIntro },
  { id: 'caixas', label: 'Embalagens', beats: 1, make: createPackaging },
  { id: 'assinatura', label: 'Assinatura', beats: 1, make: () => createLockup() },
  { id: 'grade', label: 'Construção', beats: 1, make: createGrid },
  { id: 'fachada', label: 'Fachada', beats: 1, make: createFacade },
  { id: 'manual', label: 'Manual da marca', beats: 2, make: createBook },
  { id: 'notebook', label: 'Site', beats: 1, make: createLaptop },
  { id: 'telas', label: 'Tablet e celular', beats: 1, make: createDevices },
  { id: 'tipografia', label: 'Tipografia', beats: 1, make: createType },
  { id: 'painel', label: 'Painel com IHM', beats: 2, make: createCabinet },
  { id: 'cartoes', label: 'Cartões de visita', beats: 1, make: createCards },
  { id: 'papelaria', label: 'Papelaria', beats: 1, make: createStationery, whip: 'h' },
  { id: 'bobinas', label: 'Bobinas de papel', beats: 1, make: createRolls },
  { id: 'conteiner', label: 'Contêiner', beats: 2, make: createContainer },
  { id: 'fardos', label: 'Fardos de celulose', beats: 1, make: createBales },
  { id: 'placa', label: 'Placa na parede', beats: 1, make: createWallSign },
  { id: 'capacete', label: 'Capacete', beats: 1, make: createHardhat, whip: 'v' },
  { id: 'plaqueta', label: 'Plaqueta da máquina', beats: 1, make: createNameplate },
  { id: 'blocos', label: 'Blocos 3D', beats: 1, make: createBlocks, whip: 'h' },
  { id: 'totem', label: 'Totem', beats: 2, make: createTotem },
  { id: 'final', label: 'Final', beats: 2, make: () => createLockup({ tagline: true }) },
];

export const TIMELINE = (() => {
  let t = 0;
  const list = CUTS.map(c => {
    const s = { ...c, start: t, dur: c.beats * BEAT };
    t += s.dur;
    return s;
  });
  return { list, duration: t, byId: Object.fromEntries(list.map(s => [s.id, s])) };
})();

export function cutAt(t) {
  const L = TIMELINE.list;
  for (let i = L.length - 1; i >= 0; i--) if (t >= L[i].start) return { cut: L[i], local: t - L[i].start, index: i };
  return { cut: L[0], local: 0, index: 0 };
}

const shots = new Map();
export function getShot(stage, cut) {
  if (!shots.has(cut.id)) shots.set(cut.id, cut.make(stage));
  return shots.get(cut.id);
}

/* Cria todos os planos, compila os shaders e gera a "foto" usada no site e
   no totem a partir do próprio render das bobinas. onProgress(0..1). */
export async function prepareAll(stage, onProgress = () => {}) {
  const L = TIMELINE.list;
  for (let i = 0; i < L.length; i++) {
    const shot = getShot(stage, L[i]);
    shot.update(0, L[i].dur);
    stage.renderer.compile(shot.scene, shot.camera);
    onProgress((i + 1) / (L.length + 1));
    await new Promise(r => setTimeout(r, 0));
  }
  const src = TIMELINE.byId.bobinas, shot = getShot(stage, src);
  shot.update(src.dur * 0.5, src.dur);
  stage.render(shot.scene, shot.camera, { ...shot.post, bokeh: null, grain: 0, ca: 0, vignette: 0.15 });
  const photo = makeCanvas(1080, 1920);
  photo.getContext('2d').drawImage(stage.renderer.domElement, 0, 0, photo.width, photo.height);
  for (const s of shots.values()) if (s.setPhoto) s.setPhoto(photo);
  onProgress(1);
}

export function renderFrame(stage, t) {
  t = clamp(t, 0, TIMELINE.duration - 1e-4);
  const { cut, local, index } = cutAt(t);
  const shot = getShot(stage, cut);
  shot.update(local, cut.dur);
  const fx = { time: t };
  // Desfoque "whip": a saída do plano anterior e a entrada do seguinte.
  const w = 0.1;
  const next = TIMELINE.list[index + 1];
  if (cut.whip && local < w) fx[cut.whip === 'v' ? 'blurY' : 'blurX'] = 0.16 * (1 - E.outCubic(local / w));
  if (next && next.whip && cut.dur - local < w) fx[next.whip === 'v' ? 'blurY' : 'blurX'] = 0.16 * E.inCubic(1 - (cut.dur - local) / w);
  if (index === TIMELINE.list.length - 1) fx.fade = range(local, cut.dur - 0.4, cut.dur - 0.03);
  stage.render(shot.scene, shot.camera, shot.post, fx);
}
