/**
 * Bundle the public Referrals Finder Angular Element for embedding on public association websites.
 * Requires `ngc` to have already emitted dist/lib/finder-widget/*.js
 */
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const hostJs = path.join(pkgRoot, 'dist/lib/finder-widget/referrals-finder-widget.component.js');
if (!fs.existsSync(hostJs)) {
  console.error('build-referrals-finder-element: ngc output missing at', hostJs);
  process.exit(1);
}

const babel = await import('@babel/core');
const linkerMod = await import('@angular/compiler-cli/linker/babel');
const linkerPlugin = linkerMod.default ?? linkerMod.createEs2015LinkerPlugin;

function angularLinkerPlugin() {
  return {
    name: 'angular-linker',
    setup(build) {
      build.onLoad({ filter: /[\\/]@angular[\\/].*\.[cm]?js$/ }, async (args) => {
        const source = await fs.promises.readFile(args.path, 'utf8');
        if (!source.includes('ngDeclare')) {
          return null;
        }
        const result = await babel.transformAsync(source, {
          filename: args.path,
          configFile: false,
          babelrc: false,
          compact: false,
          plugins: [linkerPlugin],
        });
        if (!result?.code) {
          return null;
        }
        return { contents: result.code, loader: 'js' };
      });
    },
  };
}

const outdir = path.join(pkgRoot, 'dist/finder-element');
fs.mkdirSync(outdir, { recursive: true });

await esbuild.build({
  absWorkingDir: pkgRoot,
  entryPoints: [path.join(pkgRoot, 'scripts/referrals-finder-entry.ts')],
  bundle: true,
  format: 'esm',
  outfile: path.join(outdir, 'main.js'),
  platform: 'browser',
  target: 'es2022',
  nodePaths: [
    path.join(pkgRoot, 'node_modules'),
    path.join(pkgRoot, '../../node_modules'),
    path.join(pkgRoot, '../../node_modules/.pnpm/zone.js@0.16.0/node_modules'),
  ],
  sourcemap: process.env.REFERRALS_FINDER_SOURCEMAP === '1',
  legalComments: 'none',
  plugins: [angularLinkerPlugin()],
  logOverride: { 'empty-import-meta': 'silent' },
});

const out = path.join(outdir, 'main.js');
console.log('referrals-finder-element →', out);
