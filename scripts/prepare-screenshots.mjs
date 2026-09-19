/**
 * Cut the participant-side screens out of CoeFont's own manuals and mask
 * anything that must not be printed (third-party names, demo URL / passcode,
 * a scannable demo QR).
 *
 * Source images are extracted beforehand with:
 *   pdfimages -png -f 12 -l 15 <teams manual>.pdf shots/t
 *   pdfimages -png -f 14 -l 14 <desktop manual>.pdf shots/d
 */
import path from 'node:path';
import url from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');

const SRC = process.argv[2];
const OUT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', 'input', 'screenshots');

const box = (w, h, color = '#f1f1f1') =>
  sharp({ create: { width: Math.round(w), height: Math.round(h), channels: 4, background: color } }).png().toBuffer();

const label = (w, h, text) =>
  Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#ffffff" fill-opacity="0.92"/>` +
    `<text x="${w / 2}" y="${h / 2 + 5}" font-family="sans-serif" font-size="${Math.round(h * 0.62)}" ` +
    `fill="#8a8a8a" text-anchor="middle">${text}</text></svg>`
  );

const jobs = [
  {
    // Teams meeting chat: the CoeFont message with language tabs, QR, passcode and buttons
    src: 't-001.png', out: 'pc_01_link.png',
    crop: { left: 780, top: 324, width: 330, height: 398 },
    masks: [
      { left: 36, top: 234, width: 250, height: 54 },   // demo URL (contains a client id)
      { left: 94, top: 312, width: 70, height: 20 },     // demo passcode
    ],
    labels: [{ left: 75, top: 120, width: 168, height: 30, text: 'SAMPLE' }], // make the demo QR unscannable
  },
  {
    // Passcode entry + the two start buttons
    src: 't-002.png', out: 'pc_02_passcode.png',
    crop: { left: 425, top: 416, width: 540, height: 392 },
  },
  {
    // Language setting at the top right of the live page
    src: 'd-001.png', out: 'pc_03_language.png',
    crop: { left: 1490, top: 4, width: 460, height: 100 },
  },
  {
    // The live page itself (source text on the left, translation on the right)
    src: 'd-001.png', out: 'pc_04_translating.png',
    crop: { left: 30, top: 0, width: 1900, height: 300 },
  },
];

for (const j of jobs) {
  let img = sharp(path.join(SRC, j.src)).extract(j.crop);
  const composites = [];
  for (const m of j.masks || []) composites.push({ input: await box(m.width, m.height), left: m.left, top: m.top });
  for (const l of j.labels || []) composites.push({ input: label(l.width, l.height, l.text), left: l.left, top: l.top });
  if (composites.length) img = sharp(await img.png().toBuffer()).composite(composites);
  await img.png().toFile(path.join(OUT, j.out));
  console.log(`${j.out}  ${j.crop.width}x${j.crop.height}`);
}
