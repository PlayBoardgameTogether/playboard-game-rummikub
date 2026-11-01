import { Buffer } from 'node:buffer';
import { URL } from 'node:url';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { zipSync } from 'fflate';
import { rummikubFiles } from './rummikub-package.mjs';

const files = await rummikubFiles();
const descriptor = JSON.parse(files['game.json'].toString('utf8'));
descriptor.presentation = {};
for (const kind of ['icon', 'cover', 'background']) {
  const png = await readFile(new URL('../game-packages/rummikub/art/' + kind + '.png', import.meta.url));
  if (png.length > 320 * 1024) throw new Error(kind + ' exceeds artwork limit');
  descriptor.presentation[kind] = 'data:image/png;base64,' + png.toString('base64');
}
files['game.json'] = Buffer.from(JSON.stringify(descriptor));
const output = new URL('../dist/game-packages/rummikub-1.0.4.zip', import.meta.url);
await mkdir(new URL('.', output), { recursive: true });
const bytes = zipSync(files, { mtime: new Date('2026-10-04T00:00:00Z'), level: 9 });
await writeFile(output, bytes);
console.log(`Rummikub ZIP: ${output.pathname} (${bytes.length} bytes; embedded artwork)`);
