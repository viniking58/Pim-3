// Empacota src/ num único script clássico (dist/reel.js), para o index.html
// funcionar aberto direto do disco. Uso: node build.mjs [--watch]
import * as esbuild from 'esbuild';

const options = {
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  minify: true,
  target: ['es2020'],
  outfile: 'dist/reel.js',
  legalComments: 'eof',
  logLevel: 'info',
};

if (process.argv.includes('--watch')) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}
