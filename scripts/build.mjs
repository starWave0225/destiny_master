import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const source = new URL('../src/', import.meta.url);
const output = new URL('../dist/', import.meta.url);
const [html, css, engine, game] = await Promise.all(
  ['index.html', 'style.css', 'engine.mjs', 'game.mjs'].map(name => readFile(new URL(name, source), 'utf8'))
);

// Bundle the same game into an offline page; keep src/ as the only editable source.
const script = engine.replace(/^export /gm, '') + '\n' + game.replace(/^import [^\n]+\n/, '');
new Script(script);
const offline = html
  .replace('<link rel="stylesheet" href="./style.css">', '<style>' + css + '</style>')
  .replace('<script type="module" src="./game.mjs"></script>', '<script>\n' + script + '\n</script>')
  .replace('href="./"', 'href="#"');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
await writeFile(new URL('offline.html', output), offline);
console.log(`Built static site: ${fileURLToPath(output)}`);
console.log('Built offline edition: dist/offline.html');
