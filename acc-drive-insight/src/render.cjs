// Frame-accurate export of reel.html / mockup.html with headless Chromium + ffmpeg.
//   node render.cjs stills <page.html> <outDir> <t1,t2,...>
//   node render.cjs video  <page.html> <out.mp4> [fps] [audio.wav] [extra query, e.g. &caption=0]
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }

async function open(page, file, query = '') {
  await page.goto('file://' + path.resolve(file) + '?render' + query);
  await page.waitForFunction(() => window.__reel);
  await page.evaluate(() => window.__reel.ready);
  return page.evaluate(() => [window.__reel.TOTAL, !!window.__reel.dom]);
}

// Canvas pages hand back a data URL; DOM pages (the 3D mockup) are screenshotted.
async function grab(page, t, dom) {
  const url = await page.evaluate(tt => window.__reel.frame(tt), t);
  if (!dom) return toBuf(url);
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 } });
}

const toBuf = dataUrl => Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');

(async () => {
  const [mode, file, out, arg4, arg5, query = ''] = process.argv.slice(2);
  const browser = await pw.chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1920 } });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => { console.error('[pageerror]', e.message); process.exitCode = 1; });
  const [total, dom] = await open(page, file, query);
  if (dom) await page.setViewportSize({ width: 1080, height: 1920 });

  if (mode === 'stills') {
    fs.mkdirSync(out, { recursive: true });
    for (const t of arg4.split(',').map(Number)) {
      fs.writeFileSync(path.join(out, `t${t.toFixed(2).padStart(6, '0')}.png`), await grab(page, t, dom));
    }
  } else if (mode === 'video') {
    const fps = Number(arg4 || 30), frames = Math.round(total * fps);
    const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-'];
    if (arg5) args.push('-i', arg5);
    args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-r', String(fps));
    if (arg5) args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
    args.push(out);
    const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < frames; i++) {
      if (!ff.stdin.write(await grab(page, i / fps, dom))) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 60 === 0) process.stdout.write(`frame ${i}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('done', out);
  }
  await browser.close();
})();
