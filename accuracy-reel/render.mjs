#!/usr/bin/env node
/* =====================================================================
   Renderiza o reel quadro a quadro num Chromium headless (Playwright, WebGL)
   e junta os quadros + a trilha num MP4 (H.264 + AAC) com o ffmpeg.

   Uso:  node render.mjs [--out out/accuracy-automation-reel.mp4] [--fps 30]
                         [--workers 4] [--quality 0.93]
   ffmpeg: variável FFMPEG, pacote ffmpeg-static ou "ffmpeg" no PATH.
   ===================================================================== */
import { createRequire } from 'module';
import { spawn, execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const out = path.resolve(here, args.out || 'out/accuracy-automation-reel.mp4');
const workers = Math.max(1, Number(args.workers) || Math.min(3, os.cpus().length));
const quality = Number(args.quality) || 0.93;

function loadPlaywright() {
  try { return require('playwright'); } catch { /* tenta a instalação global */ }
  try {
    const root = execFileSync('npm', ['root', '-g']).toString().trim();
    return require(path.join(root, 'playwright'));
  } catch { /* segue para o erro */ }
  console.error('Playwright não encontrado. Rode "npm install" e "npx playwright install chromium".');
  process.exit(1);
}

function findFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { return require('ffmpeg-static'); } catch { return 'ffmpeg'; }
}

const run = (cmd, argv) => new Promise((resolve, reject) => {
  const p = spawn(cmd, argv, { stdio: ['ignore', 'ignore', 'inherit'] });
  p.on('error', reject);
  p.on('exit', code => (code === 0 ? resolve() : reject(new Error(`${cmd} saiu com código ${code}`))));
});

const { chromium } = loadPlaywright();
const browser = await chromium.launch({
  args: ['--allow-file-access-from-files', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});
const url = pathToFileURL(path.join(here, 'index.html')).href + '?render';

async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('Erro na página:', e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 600000 });
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(err);
  return page;
}

const t0 = Date.now();
const first = await openPage();
const meta = await first.evaluate(() => window.__meta);
const fps = Number(args.fps) || meta.fps;
const frames = Math.round(meta.duration * fps);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'accuracy-reel-'));
console.log(`Renderizando ${frames} quadros (${meta.width}×${meta.height}, ${fps} fps) com ${workers} abas…`);

const wav = await first.evaluate(() => window.__audioWavBase64());
fs.writeFileSync(path.join(tmp, 'audio.wav'), Buffer.from(wav, 'base64'));

const pages = [first, ...(await Promise.all(Array.from({ length: workers - 1 }, openPage)))];
let next = 0, done = 0;
await Promise.all(pages.map(async page => {
  for (let i = next++; i < frames; i = next++) {
    const b64 = await page.evaluate(([t, q]) => window.__renderFrameJPEG(t, q), [i / fps, quality]);
    fs.writeFileSync(path.join(tmp, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(b64, 'base64'));
    done++;
    if (done % 30 === 0 || done === frames) process.stdout.write(`\r  quadros: ${done}/${frames}`);
  }
}));
await browser.close();
process.stdout.write('\n');

fs.mkdirSync(path.dirname(out), { recursive: true });
await run(findFfmpeg(), [
  '-y', '-loglevel', 'error',
  '-framerate', String(fps), '-i', path.join(tmp, 'f%05d.jpg'),
  '-i', path.join(tmp, 'audio.wav'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p',
  '-profile:v', 'high', '-level', '4.2', '-r', String(fps),
  '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart',
  out,
]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Pronto: ${path.relative(process.cwd(), out)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
