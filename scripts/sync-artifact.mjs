// Split a saved Claude artifact HTML into the Astro app's css / shell / js.
// Usage: npm run sync -- <path/to/artifact.html>
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const src = process.argv[2];
if (!src) { console.error('Usage: npm run sync -- <artifact.html>'); process.exit(1); }
const html = readFileSync(src, 'utf8');

const slice = (open, close, from = 0) => {
  const a = html.indexOf(open, from), b = html.indexOf(close, a);
  assert(a >= 0 && b > a, `missing ${open}…${close}`);
  return html.slice(a + open.length, b).trim() + '\n';
};

const body = html.indexOf('<body>');
assert(body > 0, 'missing <body>');
const css = slice('<style>', '</style>');
const shell = slice('<body>', '<!-- libs -->', body);
// The app's own scripts each start with "/* js/<path> */"; anything else (e.g. runtime injections) is rejected.
const scripts = [...html.slice(body).matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1].trim());
for (const s of scripts) assert(s.startsWith('/* js/'), `unexpected script: ${s.slice(0, 60)}`);
const js = scripts.join('\n\n') + '\n';

assert(css.includes(':root'), 'css looks wrong');
assert(shell.includes('id="view"') && shell.includes('id="sidebar"'), 'shell looks wrong');
assert(js.includes('psikolatih.v1') && js.includes('hashchange'), 'js looks wrong');

writeFileSync('src/styles/app.css', css);
writeFileSync('src/shell.html', shell);
writeFileSync('public/app.js', js);
console.log(`synced: css ${css.length}B, shell ${shell.length}B, js ${js.length}B (${scripts.length} files)`);
