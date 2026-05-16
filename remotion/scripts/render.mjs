import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, openBrowser } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(PROJECT_ROOT, 'public/images/db');

const SUPABASE_URL = 'https://yusmekgbrimlrzoglwtg.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1c21la2dicmltbHJ6b2dsd3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMDU3NTcsImV4cCI6MjA4NDc4MTc1N30.CVMBHtOoOPjXLyvE4i5iV9gqyzdP0SuQL7aeL_qj-rk';

console.log('Fetching covers from database...');
const url = new URL(`${SUPABASE_URL}/rest/v1/products`);
url.searchParams.set('select', 'id,name,name_sw,price,images,category');
url.searchParams.set('category', 'ilike.*cover*');
url.searchParams.set('order', 'created_at.desc');
url.searchParams.set('limit', '24');

const res = await fetch(url, {
  headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
});
if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
const products = (await res.json()).filter(
  (p) => Array.isArray(p.images) && p.images.length > 0 && p.images[0]
);
console.log(`Found ${products.length} covers with images.`);

fs.mkdirSync(IMG_DIR, { recursive: true });

const covers = [];
for (let i = 0; i < products.length; i++) {
  const p = products[i];
  const src = p.images[0];
  const ext = (src.split('?')[0].match(/\.(jpg|jpeg|png|webp)$/i)?.[1] || 'jpg').toLowerCase();
  const filename = `cover${i + 1}.${ext}`;
  const dest = path.join(IMG_DIR, filename);
  try {
    const r = await fetch(src);
    if (!r.ok) { console.warn(`  skip ${p.name}: ${r.status}`); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(dest, buf);
    covers.push({
      file: `images/db/${filename}`,
      name: p.name_sw || p.name,
      price: Number(p.price) || 0,
    });
    console.log(`  ✓ ${filename}  ${p.name}`);
  } catch (e) {
    console.warn(`  skip ${p.name}: ${e.message}`);
  }
}
if (covers.length === 0) throw new Error('No covers downloaded.');
console.log(`Rendering with ${covers.length} covers.`);

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, '../src/index.ts'),
  webpackOverride: (c) => c,
});

const browser = await openBrowser('chrome', {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? '/bin/chromium',
  chromiumOptions: { args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] },
  chromeMode: 'chrome-for-testing',
});

const inputProps = { covers };

const composition = await selectComposition({
  serveUrl: bundled,
  id: 'main',
  puppeteerInstance: browser,
  inputProps,
});

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: 'h264',
  outputLocation: '/mnt/documents/itech-covers-ad.mp4',
  puppeteerInstance: browser,
  muted: true,
  concurrency: 1,
  inputProps,
});

await browser.close({ silent: false });
console.log('Done.');
