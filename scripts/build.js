const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const CleanCSS = require('clean-css');
const { minify } = require('terser');
const { optimize } = require('svgo');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const hash = (content) => createHash('sha256').update(content).digest('hex').slice(0, 12);
const read = (file) => fs.readFile(path.join(root, file), 'utf8');

async function build() {
  // Only this fixed, generated directory is removed; source files are never edited.
  if (!process.argv[2]) await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(path.join(output, 'assets'), { recursive: true });
  const replacements = {};
  async function asset(source, content, extension) {
    const name = path.basename(source).replace(/\.[^.]+$/, '');
    const target = `/assets/${name}.${hash(content)}.${extension}`;
    await fs.writeFile(path.join(output, target), content);
    replacements['/' + source] = target;
    return target;
  }
  if (!process.argv[2] || process.argv[2] === 'css') {
    const original = await read('css/style.css');
    const result = new CleanCSS({ level: 2 }).minify(original);
    if (result.errors.length) throw new Error(result.errors.join('\n'));
    await asset('css/style.css', result.styles, 'css');
    console.log(`CSS: ${Buffer.byteLength(original)} → ${Buffer.byteLength(result.styles)} bytes`);
  }
  if (!process.argv[2] || process.argv[2] === 'js') {
    for (const source of ['js/guardrails.js', 'js/app.js', 'js/platform.js']) {
      const original = await read(source);
      const result = await minify(original, { compress: true, mangle: true });
      await asset(source, result.code, 'js');
      console.log(`${source}: ${Buffer.byteLength(original)} → ${Buffer.byteLength(result.code)} bytes`);
    }
  }
  if (process.argv[2]) return;
  const vitals = await fs.readFile(path.join(root, 'node_modules/web-vitals/dist/web-vitals.iife.js'));
  await asset('js/web-vitals.js', vitals, 'js');
  const svg = optimize(await read('icon.svg'), { multipass: true }).data;
  await asset('icon.svg', svg, 'svg');
  const manifest = JSON.parse(await read('manifest.json'));
  for (const size of [192, 512]) {
    const png = await sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9, palette: true }).toBuffer();
    await fs.writeFile(path.join(output, `icon-${size}.png`), png);
  }
  manifest.start_url = '/#/';
  manifest.scope = '/';
  await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest));
  let html = await read('index.html');
  for (const [source, target] of Object.entries(replacements)) html = html.replaceAll(source, target);
  await fs.writeFile(path.join(output, 'index.html'), html);
  await fs.writeFile(path.join(output, 'offline.html'), await read('offline.html'));
  await fs.cp(path.join(root, 'data'), path.join(output, 'data'), { recursive: true });
  // Do not persist user metrics in the browser's offline cache.
  const precache = ['/index.html', '/offline.html', '/manifest.json', '/icon-192.png', '/icon-512.png',
    ...Object.values(replacements), ...['topics', 'translations', 'quizzes', 'clinics'].map((name) => `/data/${name}.json`)];
  const version = hash(await Promise.all(precache.map((url) => fs.readFile(path.join(output, url))))
    .then((parts) => Buffer.concat(parts)));
  const worker = (await read('sw.js')).replace('__BUILD_VERSION__', version).replace('/* __PRECACHE__ */ []', JSON.stringify(precache));
  await fs.writeFile(path.join(output, 'sw.js'), worker);
  console.log(`Production assets written to dist/ (${version})`);
}
build().catch((error) => { console.error(error); process.exitCode = 1; });
