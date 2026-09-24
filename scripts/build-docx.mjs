/**
 * Build the participant guide as Word documents.
 *   output/CoeFont_Participant_Guide_TH.docx     Thai + English (for the Thai participants)
 *   output/CoeFont_Participant_Guide_TH-JA.docx  Thai + English + Japanese (for the Japanese side)
 *   output/TH-EN-JA_parallel_text.txt           parallel text of every line
 *
 * Usage: node scripts/build-docx.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { createRequire } from 'node:module';
import * as C from '../src/content.mjs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, Footer,
  AlignmentType, WidthType, BorderStyle, ShadingType, HeadingLevel, LevelFormat, PageNumber,
  VerticalAlign, TableLayoutType, LineRuleType,
} = require('docx');
const AUTO = LineRuleType.AUTO;

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const SHOTS = path.join(ROOT, 'input', 'screenshots');
const OUT = path.join(ROOT, 'output');
fs.mkdirSync(OUT, { recursive: true });

// ---- page geometry (A4, 20 mm margins) ----
const MM = 56.7;                          // DXA per mm
const PAGE_W = 11906, PAGE_H = 16838, MARGIN = Math.round(20 * MM);
const CONTENT_W = PAGE_W - 2 * MARGIN;    // 9638
const IMG_COL = Math.round(50 * MM);      // left column of the steps table
const TXT_COL = CONTENT_W - IMG_COL;

// ---- fonts (what the document is written in on Windows / Word) ----
const FONT = { ascii: 'Leelawadee UI', hAnsi: 'Leelawadee UI', cs: 'Leelawadee UI', eastAsia: '游ゴシック' };
const LANG = { value: 'en-US', eastAsia: 'ja-JP', bidirectional: 'th-TH' };
const GRAY = '595959', LIGHT = '7F7F7F', RED = 'C00000', NAVY = '1F3864', RULE = 'BFBFBF';

// ---- run helpers ----
const pt = (n) => Math.round(n * 2);      // half-points
function runs(text, { size, bold = false, color, lang }) {
  // 「label」 -> bold label; Thai/English use “ ”, Japanese keeps 「」
  const out = [];
  const re = /「([^」]+)」/g;
  let last = 0, m;
  const base = { size: pt(size), sizeComplexScript: pt(size), color, bold, boldComplexScript: bold, font: FONT, language: LANG };
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ ...base, text: text.slice(last, m.index) }));
    const [o, c] = lang === 'ja' ? ['「', '」'] : ['“', '”'];
    out.push(new TextRun({ ...base, text: o }));
    out.push(new TextRun({ ...base, text: m[1], bold: true, boldComplexScript: true }));
    out.push(new TextRun({ ...base, text: c }));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(new TextRun({ ...base, text: text.slice(last) }));
  return out;
}

const SIZES = { th: 10.5, en: 9, ja: 8.5 };
const COLORS = { th: undefined, en: GRAY, ja: LIGHT };

function lines(block, variant, { after = 80, indent, sizes = SIZES, keepNext = false, inTable = false } = {}) {
  const langs = variant === 'ja' ? ['th', 'en', 'ja'] : ['th', 'en'];
  return langs.filter((l) => block[l]).map((l, i, arr) => new Paragraph({
    keepNext: !inTable && (keepNext || i < arr.length - 1),
    indent,
    spacing: { before: 0, after: i === arr.length - 1 ? after : 20, line: 264, lineRule: AUTO },
    children: runs(block[l], { size: sizes[l], color: COLORS[l], lang: l }),
  }));
}

function heading(no, h, variant, { pageBreakBefore = false } = {}) {
  const children = [
    ...runs(`${no}. ${h.th}`, { size: 12, bold: true, color: NAVY, lang: 'th' }),
    new TextRun({ text: '   ', size: pt(13) }),
    ...runs(h.en, { size: 10, color: GRAY, lang: 'en' }),
  ];
  if (variant === 'ja') children.push(new TextRun({ text: '   ' }), ...runs(h.ja, { size: 9, color: LIGHT, lang: 'ja' }));
  return new Paragraph({ heading: HeadingLevel.HEADING_1, keepNext: true, pageBreakBefore, children });
}

// ---- borders / cells ----
const line = { style: BorderStyle.SINGLE, size: 4, color: RULE };
const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const GRID = { top: line, bottom: line, left: line, right: line, insideHorizontal: line, insideVertical: line };
const cell = (width, children, opts = {}) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  margins: { top: 70, bottom: 70, left: 110, right: 110 },
  verticalAlign: opts.vAlign ?? VerticalAlign.TOP,
  shading: opts.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: opts.fill } : undefined,
  columnSpan: opts.span,
  borders: opts.borders,
  children,
});

// ---- screenshots with the red step number burned in ----
async function stepImage(img, n) {
  const src = path.join(SHOTS, img.file);
  const { width: w, height: h } = await sharp(src).metadata();
  let buf = await sharp(src).png().toBuffer();
  if (img.marker) {
    const d = Math.round((w * 5.2) / img.widthMm);          // ~5.2 mm on paper
    const cx = Math.round((img.marker[0] / 100) * w), cy = Math.round((img.marker[1] / 100) * h);
    const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${cx}" cy="${cy}" r="${d / 2}" fill="#C00000" stroke="#ffffff" stroke-width="${Math.max(2, d * 0.07)}"/>
      <text x="${cx}" y="${cy + d * 0.2}" font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold"
            font-size="${Math.round(d * 0.58)}" fill="#ffffff" text-anchor="middle">${n}</text></svg>`;
    buf = await sharp(buf).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
  }
  const pxW = Math.round((img.widthMm * 96) / 25.4);
  return new ImageRun({ type: 'png', data: buf, transformation: { width: pxW, height: Math.round((pxW * h) / w) } });
}

// ---- document ----
async function build(variant) {
  const V = variant;
  const children = [];

  // date / issuer (top right), title
  for (const t of [C.meta.date, C.meta.issuer]) {
    children.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 0 },
      children: runs(t, { size: 9.5, color: GRAY, lang: 'en' }) }));
  }
  children.push(new Paragraph({ heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { before: 120, after: 40 },
    children: runs(C.meta.title.th, { size: 17, bold: true, lang: 'th' }) }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 },
    children: runs(C.meta.subtitle.th, { size: 11, lang: 'th' }) }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: V === 'ja' ? 20 : 160 },
    children: runs(C.meta.subtitle.en, { size: 9.5, color: GRAY, lang: 'en' }) }));
  if (V === 'ja') children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 },
    children: runs(`${C.meta.title.ja} ― ${C.meta.subtitle.ja}`, { size: 9, color: LIGHT, lang: 'ja' }) }));

  // overview = lead paragraphs under the title
  C.overview.items.forEach((b) => children.push(...lines(b, V)));

  // 2. what you need + note box
  children.push(heading(1, C.needs.heading, V));
  C.needs.items.forEach((b) => {
    const ps = lines(b, V, { indent: { left: 360 } });
    ps[0] = new Paragraph({ ...ps[0].options, numbering: { reference: 'bullets', level: 0 },
      keepNext: true, spacing: { after: 20, line: 264, lineRule: AUTO }, indent: undefined,
      children: runs(b.th, { size: SIZES.th, lang: 'th' }) });
    children.push(...ps);
  });
  children.push(new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W], layout: TableLayoutType.FIXED,
    borders: GRID,
    rows: [new TableRow({ cantSplit: true, children: [cell(CONTENT_W,
      C.needs.notes.flatMap((b, i) => lines(b, V, { after: i === C.needs.notes.length - 1 ? 0 : 60, inTable: true, sizes: { th: 10, en: 8.5, ja: 8 } })),
      { fill: 'F2F2F2' })] })],
  }));

  // 3. steps (PC)
  children.push(heading(2, C.steps.heading, V));
  const stepRows = [];
  for (const s of C.steps.items) {
    const head = new Paragraph({ spacing: { after: 40 }, children: [
      ...runs(`ขั้นตอนที่ ${s.n}`, { size: 10.5, bold: true, color: RED, lang: 'th' }),
      new TextRun({ text: '   ' }),
      ...runs(`Step ${s.n}`, { size: 9, bold: true, color: RED, lang: 'en' }),
    ] });
    const text = [head, ...s.blocks.flatMap((b, i) => lines(b, V, { after: i === s.blocks.length - 1 ? 0 : 80, inTable: true }))];
    const caption = (c) => [c.th && new Paragraph({ spacing: { before: 40, after: 0 }, children: runs(c.th, { size: 8.5, color: GRAY, lang: 'th' }) }),
      V === 'ja' && c.ja && new Paragraph({ spacing: { after: 0 }, children: runs(c.ja, { size: 8, color: LIGHT, lang: 'ja' }) })].filter(Boolean);

    if (!s.image) {
      stepRows.push(new TableRow({ cantSplit: true, children: [cell(CONTENT_W, text, { span: 2 })] }));
    } else if (s.wide) {
      const pic = new Paragraph({ spacing: { before: 80, after: 0, line: 240, lineRule: AUTO }, children: [await stepImage(s.image, s.n)] });
      stepRows.push(new TableRow({ cantSplit: true, children: [cell(CONTENT_W, [...text, pic, ...caption(s.caption)], { span: 2 })] }));
    } else {
      const pic = new Paragraph({ spacing: { after: 0, line: 240, lineRule: AUTO }, children: [await stepImage(s.image, s.n)] });
      stepRows.push(new TableRow({ cantSplit: true, children: [
        cell(IMG_COL, [pic, ...caption(s.caption)]),
        cell(TXT_COL, text),
      ] }));
    }
  }
  children.push(new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [IMG_COL, TXT_COL],
    layout: TableLayoutType.FIXED, borders: GRID, rows: stepRows }));

  // 4. smartphone
  children.push(heading(3, C.smartphone.heading, V));
  C.smartphone.items.forEach((b) => {
    const ps = lines(b, V, { indent: { left: 360 } });
    ps[0] = new Paragraph({ numbering: { reference: 'bullets', level: 0 }, keepNext: true,
      spacing: { after: 20, line: 264, lineRule: AUTO }, children: runs(b.th, { size: SIZES.th, lang: 'th' }) });
    children.push(...ps);
  });

  // 5. troubleshooting table
  children.push(heading(4, C.trouble.heading, V, { pageBreakBefore: V === 'th' }));
  const half = Math.round(CONTENT_W / 2);
  const hdr = (c) => lines(c, V, { after: 0, sizes: { th: 10, en: 8.5, ja: 8 }, inTable: true })
    .map((p) => new Paragraph({ ...p.options, children: p.options.children.map((r) => r) }));
  const tRows = [new TableRow({ tableHeader: true, cantSplit: true, children: C.trouble.cols.map((c) =>
    cell(half, lines(c, V, { after: 0, sizes: { th: 10, en: 8.5, ja: 8 }, inTable: true }), { fill: 'D9D9D9' })) })];
  for (const [a, b] of C.trouble.rows) {
    tRows.push(new TableRow({ cantSplit: true, children: [
      cell(half, lines(a, V, { after: 0, sizes: { th: 10, en: 8.5, ja: 8 }, inTable: true })),
      cell(CONTENT_W - half, lines(b, V, { after: 0, sizes: { th: 10, en: 8.5, ja: 8 }, inTable: true })),
    ] }));
  }
  children.push(new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [half, CONTENT_W - half],
    layout: TableLayoutType.FIXED, borders: GRID, rows: tRows }));

  // 6. phrases table
  children.push(heading(5, C.phrases.heading, V));
  const pRows = [new TableRow({ tableHeader: true, cantSplit: true, children: C.phrases.cols.map((c, i) =>
    cell(i ? CONTENT_W - half : half, lines(c, V, { after: 0, sizes: { th: 10, en: 8.5, ja: 8 }, inTable: true }), { fill: 'D9D9D9' })) })];
  for (const g of C.phrases.groups) {
    pRows.push(new TableRow({ cantSplit: true, children: [cell(CONTENT_W,
      [new Paragraph({ spacing: { after: 0 }, children: [
        ...runs(g.label.th, { size: 10, bold: true, lang: 'th' }), new TextRun({ text: '   ' }),
        ...runs(g.label.en, { size: 8.5, color: GRAY, lang: 'en' }),
        ...(V === 'ja' ? [new TextRun({ text: '   ' }), ...runs(g.label.ja, { size: 8, color: LIGHT, lang: 'ja' })] : []),
      ] })], { span: 2, fill: 'F2F2F2' })] }));
    for (const r of g.rows) {
      const right = [new Paragraph({ spacing: { after: 0 }, children: runs(r.th, { size: 10, lang: 'th' }) })];
      if (V === 'ja') right.push(new Paragraph({ spacing: { after: 0 }, children: runs(r.ja, { size: 8, color: LIGHT, lang: 'ja' }) }));
      pRows.push(new TableRow({ cantSplit: true, children: [
        cell(half, [new Paragraph({ spacing: { after: 0 }, children: runs(r.en, { size: 10, bold: true, lang: 'en' }) })], { vAlign: VerticalAlign.CENTER }),
        cell(CONTENT_W - half, right, { vAlign: VerticalAlign.CENTER }),
      ] }));
    }
  }
  children.push(new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [half, CONTENT_W - half],
    layout: TableLayoutType.FIXED, borders: GRID, rows: pRows }));

  const doc = new Document({
    creator: '髙山浩和',
    lastModifiedBy: '髙山浩和',
    title: 'CoeFont Interpreter – Participant Guide (Thai)',
    styles: {
      default: {
        document: { run: { font: FONT, size: pt(10.5), sizeComplexScript: pt(10.5), language: LANG },
          paragraph: { spacing: { after: 80, line: 264, lineRule: AUTO } } },
        heading1: { run: { font: FONT, size: pt(13), sizeComplexScript: pt(13), bold: true, boldComplexScript: true, color: NAVY },
          paragraph: { spacing: { before: 200, after: 80 }, keepNext: true,
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 2 } } } },
        title: { run: { font: FONT, size: pt(17), sizeComplexScript: pt(17), bold: true, boldComplexScript: true } },
      },
    },
    numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] }] },
    sections: [{
      properties: { page: { size: { width: PAGE_W, height: PAGE_H },
        margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN, header: 567, footer: 454 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ size: pt(9), color: GRAY, children: [PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES] })] })] }) },
      children,
    }],
  });
  return Packer.toBuffer(doc);
}

const files = { th: 'CoeFont_Participant_Guide_TH.docx', ja: 'CoeFont_Participant_Guide_TH-JA.docx' };
for (const [v, f] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, f), await build(v));
  console.log('wrote output/' + f);
}

// ---- parallel text (every line in TH / EN / JA) ----
const txt = ['CoeFont Interpreter – Participant Guide (Thai)', '対訳一覧（TH = タイ語 / EN = 英語 / JA = 日本語）', '='.repeat(72), ''];
const add = (key, b) => { txt.push(`[${key}]`); for (const l of ['th', 'en', 'ja']) if (b[l]) txt.push(`${l.toUpperCase()}: ${b[l]}`); txt.push(''); };
add('title', { th: C.meta.title.th, en: C.meta.subtitle.en, ja: C.meta.title.ja });
add('subtitle', C.meta.subtitle);
C.overview.items.forEach((b, i) => add(`intro.${i + 1}`, b));
C.needs.items.forEach((b, i) => add(`need.${i + 1}`, b));
C.needs.notes.forEach((b, i) => add(`note.${i + 1}`, b));
C.steps.items.forEach((s) => { s.blocks.forEach((b, i) => add(`step.${s.n}${i ? String.fromCharCode(97 + i) : ''}`, b)); if (s.caption) add(`fig.${s.n}`, s.caption); });
C.smartphone.items.forEach((b, i) => add(`smartphone.${i + 1}`, b));
C.trouble.rows.forEach(([a, b], i) => { add(`trouble.${i + 1}.problem`, a); add(`trouble.${i + 1}.action`, b); });
C.phrases.groups.forEach((g, gi) => g.rows.forEach((r, i) => add(`phrase.${gi ? 'ja' : 'th'}.${i + 1}`, r)));
fs.writeFileSync(path.join(OUT, 'TH-EN-JA_parallel_text.txt'), txt.join('\n'), 'utf8');
console.log('wrote output/TH-EN-JA_parallel_text.txt');
