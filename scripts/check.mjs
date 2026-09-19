/**
 * Verification pass for the built guide (see README, "検品").
 * Usage: node scripts/check.mjs
 */
import { execSync, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
function loadModule(name) {
  try { return require(name); } catch {}
  return require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), name));
}
const { chromium } = loadModule('playwright');

const PDF = path.join(ROOT, 'output', 'CoeFont_Guide_TH_Minister_v1.pdf');
const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass, detail });
const sh = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' });

// --- 1. fonts embedded -------------------------------------------------------
const fonts = sh('pdffonts', [PDF]);
const fontRows = fonts.trim().split('\n').slice(2).map((l) => l.trim()).filter(Boolean);
const has = (needle) => fontRows.some((r) => r.includes(needle) && /\byes\b/.test(r.split(/\s+/).slice(2, 6).join(' ')));
ok('PDFにタイ語フォントが埋め込まれている', has('NotoSansThai'), fontRows.filter(r=>r.includes('Thai')).join(' | '));
ok('PDFに欧文フォントが埋め込まれている', has('NotoSans') , fontRows.filter(r=>/NotoSans[-,]/.test(r)).join(' | '));
const nonEmbedded = fontRows.filter((r) => / no /.test(r));
ok('埋め込まれていないフォントがない', nonEmbedded.length === 0, nonEmbedded.join(' | '));

// --- 2. page count -----------------------------------------------------------
const info = sh('pdfinfo', [PDF]);
const pages = Number((info.match(/Pages:\s+(\d+)/) || [])[1]);
const size = (info.match(/Page size:\s+([\d.]+) x ([\d.]+)/) || []).slice(1).map(Number);
const isA4 = size.length === 2 && Math.abs(size[0] - 595) < 2 && Math.abs(size[1] - 842) < 2;
ok('A4縦・2ページ以内', pages <= 2 && isA4, `${pages} pages / ${(info.match(/Page size:.*/) || [''])[0]}`);

// --- 3. no tool name in the artefact (text + metadata) -----------------------
const text = sh('pdftotext', [PDF, '-']);
const banned = /(claude|anthropic|chatgpt|openai|gemini|copilot)/i;
ok('作成ツール名が本文にない', !banned.test(text), (text.match(banned) || []).join());
ok('作成ツール名がPDFメタデータにない', !banned.test(info), (info.match(banned) || []).join());
ok('PDFのAuthorが空、または当社名', !/^Author:\s*\S/m.test(info) || /Author:\s*Nippon Steel/.test(info), (info.match(/^(Author|Creator|Producer):.*/gm) || []).join(' | '));

// --- 4. DOM-level checks -----------------------------------------------------
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
await page.goto(`file://${path.join(ROOT, 'src', 'guide.html')}`);
await page.evaluate(() => document.fonts.ready);
await page.addScriptTag({ path: path.join(ROOT, 'src', 'enhance.js') });
await page.evaluate(() => window.applyGuideEnhancements({}));

const dom = await page.evaluate(() => {
  const order = [...document.querySelectorAll('.pair')].map((el) => {
    const kids = [...el.children].map((c) => c.className.split(' ')[0]).filter((c) => ['th', 'en', 'ja', 'q', 'g'].includes(c));
    const seq = kids.join('>');
    const okOrder = /^(th(>en)?(>ja)?|q(>g)?(>ja)?)$/.test(seq);
    return { key: el.dataset.key, seq, okOrder };
  });
  const markers = [...document.querySelectorAll('.shot')].map((el) => ({
    shot: el.dataset.shot,
    marker: el.querySelector('.marker')?.textContent || '',
    step: el.closest('.step')?.querySelector('.num')?.textContent || '',
    isIllustration: Boolean(el.querySelector('svg')),
  }));
  const p1 = document.querySelector('#p1');
  const fill = {
    writeins: p1.querySelectorAll('.writein').length,
    qr: Boolean(p1.querySelector('#qr-slot')),
    filled: (p1.querySelector('#qr-slot')?.textContent || '').trim(),
  };
  const phrases = [...document.querySelectorAll('.pcol')].map((c) => ({
    head: c.querySelector('h3 .en')?.textContent?.trim(),
    count: c.querySelectorAll('.ph').length,
  }));
  // rendered Thai lines, to spot breaks inside a word
  const lines = [];
  document.querySelectorAll('.th, .g, .subtitle-th').forEach((el) => {
    const node = el.firstChild;
    if (!node || node.nodeType !== 3 || !/[฀-๿]/.test(node.nodeValue)) return;
    const t = node.nodeValue, range = document.createRange();
    let prevTop = null, start = 0; const ls = [];
    for (let i = 1; i <= t.length; i++) {
      range.setStart(node, i - 1); range.setEnd(node, i);
      const r = range.getBoundingClientRect();
      if (!r.height) continue;
      if (prevTop !== null && Math.abs(r.top - prevTop) > 3) { ls.push(t.slice(start, i - 1)); start = i - 1; }
      prevTop = r.top;
    }
    ls.push(t.slice(start));
    if (ls.length > 1) lines.push(ls.map((x) => x.replace(/⁠/g, '')));
  });
  return { order, markers, fill, phrases, lines };
});
await browser.close();

ok('すべての段落がタイ語→英語→日本語の順', dom.order.every((o) => o.okOrder),
   dom.order.filter((o) => !o.okOrder).map((o) => `${o.key}:${o.seq}`).join(' | '));
ok('図の番号と本文のステップ番号が一致', dom.markers.every((m) => m.marker === m.step),
   dom.markers.map((m) => `${m.shot}=${m.marker || '-'}/step${m.step}`).join(' | '));
ok('URL・パスコード・QRの記入枠が1ページ目にある', dom.fill.writeins === 2 && dom.fill.qr,
   `writein x${dom.fill.writeins}, QR box: ${dom.fill.qr ? 'yes' : 'no'}${dom.fill.filled ? ` (${dom.fill.filled})` : ''}`);
ok('英語の定型フレーズが両方向とも載っている', dom.phrases.length === 2 && dom.phrases.every((p) => p.count > 0),
   dom.phrases.map((p) => `${p.head}: ${p.count}`).join(' | '));

// Thai word-splitting: a line must not end in the middle of a protected word
const nobreak = fs.readFileSync(path.join(ROOT, 'src', 'enhance.js'), 'utf8')
  .match(/var NOBREAK = \[([\s\S]*?)\];/)[1].match(/'([^']+)'/g).map((s) => s.replace(/'/g, ''));
const badBreaks = [];
for (const ls of dom.lines) {
  for (let i = 0; i < ls.length - 1; i++) {
    for (const w of nobreak) {
      for (let cut = 1; cut < w.length; cut++) {
        if (ls[i].endsWith(w.slice(0, cut)) && ls[i + 1].startsWith(w.slice(cut))) badBreaks.push(`${w}: …${ls[i].slice(-8)} / ${ls[i + 1].slice(0, 8)}…`);
      }
    }
  }
}
ok('タイ語の行が単語の途中で折り返していない', badBreaks.length === 0, [...new Set(badBreaks)].join(' | '));

// --- 5. review file ----------------------------------------------------------
const rv = path.join(ROOT, 'output', 'thai_text_for_review.txt');
const rvText = fs.existsSync(rv) ? fs.readFileSync(rv, 'utf8') : '';
ok('thai_text_for_review.txt を出力した', /TH: /.test(rvText) && /EN: /.test(rvText),
   `${(rvText.match(/^TH: /gm) || []).length} 対訳 / ${rvText.length} bytes`);
ok('対訳ファイルに不可視文字(U+2060)が残っていない', !rvText.includes('⁠'));

// --- report ------------------------------------------------------------------
console.log('\n検品結果 — ' + path.basename(PDF) + '\n' + '='.repeat(64));
for (const r of results) console.log(`${r.pass ? '[OK]  ' : '[NG]  '}${r.name}${r.detail ? `\n         ${r.detail}` : ''}`);
console.log('='.repeat(64));
console.log('\n[目視確認用] 複数行になったタイ語:');
dom.lines.forEach((ls) => console.log('  ' + ls.join('  ⏎  ')));
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} 項目クリア`);
process.exit(failed.length ? 1 : 0);
