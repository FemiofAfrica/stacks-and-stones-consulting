/**
 * Build script for Stones and Stacks website.
 * Minifies CSS via lightningcss, minifies HTML, copies assets.
 * Usage: node scripts/build.js
 */
const fs = require('fs');
const path = require('path');
const lightningcss = require('lightningcss');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

fs.mkdirSync(DIST, { recursive: true });

// ── CSS ──────────────────────────────────────────────
console.log('CSS  …');
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
const result = lightningcss.transform({
  filename: 'styles.css',
  code: Buffer.from(css),
  minify: true,
  targets: {
    safari: (16 << 16) | (4 << 8),
    chrome: (110 << 16),
    firefox: (110 << 16),
  },
});
fs.writeFileSync(path.join(DIST, 'styles.css'), result.code);
const cssSaved = ((css.length - result.code.length) / css.length * 100).toFixed(0);
console.log(`  → dist/styles.css  (${(result.code.length / 1024).toFixed(1)} KB, -${cssSaved}%)`);

// ── HTML ─────────────────────────────────────────────
console.log('HTML …');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
html = html.replace(/<!--[\s\S]*?-->/g, '');
html = html.replace(/>\s{2,}</g, '> <');
html = html.replace(/\n\s{2,}/g, '\n');
html = html.replace(/\n{3,}/g, '\n');
html = html.split('\n').map(l => l.trim()).join('\n');
fs.writeFileSync(path.join(DIST, 'index.html'), html);
const htmlSaved = ((fs.statSync(path.join(ROOT, 'index.html')).size - Buffer.byteLength(html)) / fs.statSync(path.join(ROOT, 'index.html')).size * 100).toFixed(0);
console.log(`  → dist/index.html  (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB, -${htmlSaved}%)`);

// ── JS ───────────────────────────────────────────────
console.log('JS   …');
fs.cpSync(path.join(ROOT, 'script.js'), path.join(DIST, 'script.js'));
console.log(`  → dist/script.js   (${(fs.statSync(path.join(DIST, 'script.js')).size / 1024).toFixed(1)} KB)`);

// ── Assets ────────────────────────────────────────────
console.log('Assets …');
for (const file of ['hero-bg.jpg', 'hero-bg.webp', 'favicon.ico', 'favicon.png', 'og-image.png']) {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    fs.cpSync(src, path.join(DIST, file));
    console.log(`  → dist/${file}`);
  }
}

// ── Workshop ─────────────────────────────────────────
console.log('Workshop …');
const WS = path.join(ROOT, 'workshop');
if (fs.existsSync(WS)) {
  const WS_DIST = path.join(DIST, 'workshop');
  fs.mkdirSync(WS_DIST, { recursive: true });

  // Workshop HTML
  let wsHtml = fs.readFileSync(path.join(WS, 'index.html'), 'utf8');
  wsHtml = wsHtml.replace(/<!--[\s\S]*?-->/g, '');
  wsHtml = wsHtml.replace(/>\s{2,}</g, '> <');
  wsHtml = wsHtml.replace(/\n\s{2,}/g, '\n');
  wsHtml = wsHtml.replace(/\n{3,}/g, '\n');
  wsHtml = wsHtml.split('\n').map(l => l.trim()).join('\n');
  fs.writeFileSync(path.join(WS_DIST, 'index.html'), wsHtml);
  console.log(`  → dist/workshop/index.html  (${(Buffer.byteLength(wsHtml) / 1024).toFixed(1)} KB)`);

  // Workshop CSS
  const wsCss = fs.readFileSync(path.join(WS, 'styles.css'), 'utf8');
  const wsCssResult = lightningcss.transform({
    filename: 'workshop/styles.css',
    code: Buffer.from(wsCss),
    minify: true,
    targets: {
      safari: (16 << 16) | (4 << 8),
      chrome: (110 << 16),
      firefox: (110 << 16),
    },
  });
  fs.writeFileSync(path.join(WS_DIST, 'styles.css'), wsCssResult.code);
  const wsCssSaved = ((wsCss.length - wsCssResult.code.length) / wsCss.length * 100).toFixed(0);
  console.log(`  → dist/workshop/styles.css  (${(wsCssResult.code.length / 1024).toFixed(1)} KB, -${wsCssSaved}%)`);

  // Workshop JS
  fs.cpSync(path.join(WS, 'script.js'), path.join(WS_DIST, 'script.js'));
  console.log(`  → dist/workshop/script.js   (${(fs.statSync(path.join(WS_DIST, 'script.js')).size / 1024).toFixed(1)} KB)`);

  // Workshop assets (OG image, etc.)
  for (const file of ['og-workshop.png']) {
    const src = path.join(WS, file);
    if (fs.existsSync(src)) {
      fs.cpSync(src, path.join(WS_DIST, file));
      console.log(`  → dist/workshop/${file}`);
    }
  }
}

console.log('\n✓ Build complete');
