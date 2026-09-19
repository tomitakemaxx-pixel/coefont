/**
 * Build the participant guide: HTML -> PDF (A4, 2 pages) + PNG per page + Thai/English review list.
 *
 * Usage:
 *   node scripts/build.mjs                      # build both variants
 *   node scripts/build.mjs --qr "https://..."   # also render a QR code into the QR box
 *
 * Real screenshots: put PNG files in input/screenshots/ named after the data-shot
 * attribute in src/guide.html (e.g. pc_03_language.png). They replace the illustrations
 * automatically; red step markers are re-placed from the data-marker="x,y" percentages.
 */
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');

function loadModule(name, { optional = false } = {}) {
  try { return require(name); } catch {}
  try {
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    return require(path.join(globalRoot, name));
  } catch (err) {
    if (optional) return null;
    throw new Error(`Cannot resolve "${name}". Run: npm install`);
  }
}

const { chromium } = loadModule('playwright');
const QRCode = loadModule('qrcode', { optional: true });

const args = process.argv.slice(2);
const qrIndex = args.indexOf('--qr');
const qrUrl = qrIndex >= 0 ? args[qrIndex + 1] : null;

const VARIANTS = [
  { id: 'minister', file: 'CoeFont_Guide_TH_Minister_v1', query: '' },
  { id: 'internal', file: 'CoeFont_Guide_TH-JA_internal_v1', query: '?variant=internal' },
];

const OUT = path.join(ROOT, 'output');
const SHOTS = path.join(ROOT, 'input', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

// Real screenshots available on disk, as { shotName: dataUrl }
function collectScreenshots() {
  const map = {};
  if (!fs.existsSync(SHOTS)) return map;
  for (const f of fs.readdirSync(SHOTS)) {
    const m = f.match(/^(.+)\.(png|jpg|jpeg)$/i);
    if (!m) continue;
    const mime = m[2].toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
    map[m[1]] = `data:${mime};base64,${fs.readFileSync(path.join(SHOTS, f)).toString('base64')}`;
  }
  return map;
}

let qrDataUrl = null;
if (qrUrl) {
  if (!QRCode) {
    console.warn('! --qr given but the "qrcode" package is not installed (npm install). QR box left blank.');
  } else {
    qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 0, width: 600, errorCorrectionLevel: 'M' });
  }
}

const shots = collectScreenshots();
const shotNames = Object.keys(shots);
console.log(shotNames.length
  ? `Real screenshots used: ${shotNames.join(', ')}`
  : 'No files in input/screenshots/ - using the built-in screen illustrations.');

const browser = await chromium.launch();
const report = { variants: [], screenshots: shotNames, qr: Boolean(qrDataUrl) };
let reviewRows = null;

for (const v of VARIANTS) {
  const context = await browser.newContext({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 1.5625, // 794px * 1.5625 = ~1240px wide PNG
  });
  const page = await context.newPage();
  await page.goto(`file://${path.join(ROOT, 'src', 'guide.html')}${v.query}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  await page.addScriptTag({ path: path.join(ROOT, 'src', 'enhance.js') });
  await page.evaluate((opts) => window.applyGuideEnhancements(opts), { shots, qrDataUrl });

  await page.waitForTimeout(150);

  // Overflow check: nothing may be clipped by the fixed A4 page height
  const overflow = await page.evaluate(() =>
    [...document.querySelectorAll('.page')].map((pg) => {
      const pgBox = pg.getBoundingClientRect();
      const footer = pg.querySelector('.footer').getBoundingClientRect();
      let lowest = 0;
      pg.querySelectorAll('section, header, h1, .step, .footer').forEach((el) => {
        if (el.classList.contains('footer')) return;
        lowest = Math.max(lowest, el.getBoundingClientRect().bottom);
      });
      return {
        id: pg.id,
        scrollOverflowPx: Math.max(0, Math.round(pg.scrollHeight - pg.clientHeight)),
        freeSpaceAboveFooterPx: Math.round(footer.top - lowest),
        pageHeightPx: Math.round(pgBox.height),
      };
    })
  );

  // Thai / English (/ Japanese) pairs for review - taken from the rendered DOM so it cannot drift
  if (!reviewRows) {
    reviewRows = await page.evaluate(() =>
      [...document.querySelectorAll('.pair')].map((el) => {
        const t = (sel) => el.querySelector(sel)?.textContent?.replace(/\s+/g, ' ').trim() || '';
        const clean = (x) => x.replace(/\u2060/g, '');
        return { key: el.dataset.key, th: clean(t('.th') || t('.g')), en: clean(t('.en') || t('.q')), ja: clean(t('.ja')) };
      })
    );
  }

  const pdfPath = path.join(OUT, `${v.file}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  // PNGs (for viewing on a phone) only for the distributed Thai guide
  const pngs = [];
  if (v.id === 'minister') {
    const pages = await page.$$('.page');
    for (let i = 0; i < pages.length; i++) {
      const p = path.join(OUT, `${v.file}_p${i + 1}.png`);
      await pages[i].screenshot({ path: p });
      pngs.push(path.basename(p));
    }
  }

  report.variants.push({ id: v.id, pdf: path.basename(pdfPath), pngs, overflow });
  console.log(`built ${v.id}: ${path.basename(pdfPath)} + ${pngs.join(', ')}`);
  overflow.forEach((o) => {
    const flag = o.scrollOverflowPx > 0 || o.freeSpaceAboveFooterPx < 0 ? 'OVERFLOW' : 'ok';
    console.log(`   ${o.id}: ${flag} (clipped ${o.scrollOverflowPx}px, free above footer ${o.freeSpaceAboveFooterPx}px)`);
  });
  await context.close();
}

await browser.close();

// ---- Thai review file -------------------------------------------------------
const lines = [];
lines.push('CoeFont AI Interpreter - Participant Guide (Thai)  v1 / 2026-09');
lines.push('対訳一覧（TH = タイ語 / EN = 英語 / JA = 日本語）');
lines.push('='.repeat(78));
lines.push('');
for (const r of reviewRows) {
  if (!r.th && !r.en) continue;
  lines.push(`[${r.key}]`);
  if (r.th) lines.push(`TH: ${r.th}`);
  if (r.en) lines.push(`EN: ${r.en}`);
  if (r.ja) lines.push(`JA: ${r.ja}`);
  lines.push('');
}
lines.push('='.repeat(78));
lines.push(`対訳 ${reviewRows.filter((r) => r.th || r.en).length} 件`);
fs.writeFileSync(path.join(OUT, 'thai_text_for_review.txt'), lines.join('\n'), 'utf8');
fs.writeFileSync(path.join(OUT, 'build_report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log('wrote output/thai_text_for_review.txt and output/build_report.json');
