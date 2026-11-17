// Generates the images the site serves from the masters in src/images:
// a WebP per width in WIDTHS for every painting, plus the link-preview image.
//
// Runs before `npm run dev` and `npm run build`. Files that are already newer
// than their master are left alone, so repeat runs cost almost nothing.

import sharp from 'sharp';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { MASTER_DIR, OUTPUT_DIR, SHARE_IMAGE, WIDTHS } from './image-config.mjs';

const largestWidth = Math.max(...WIDTHS);

async function isUpToDate(output, master) {
  try {
    const [out, src] = await Promise.all([stat(output), stat(master)]);
    return out.mtimeMs >= src.mtimeMs;
  } catch {
    return false; // output does not exist yet
  }
}

async function generate(master, file, pipeline) {
  const output = join(OUTPUT_DIR, file);
  if (await isUpToDate(output, master)) return false;
  await pipeline(sharp(master)).toFile(output);
  return true;
}

await mkdir(OUTPUT_DIR, { recursive: true });

const masters = (await readdir(MASTER_DIR)).filter((file) => /\.jpe?g$/i.test(file));
const expected = new Set();
let written = 0;

for (const file of masters) {
  const master = join(MASTER_DIR, file);
  const { name } = parse(file);
  const metadata = await sharp(master).metadata();

  if (metadata.width < largestWidth) {
    throw new Error(`${master} is ${metadata.width}px wide; masters need at least ${largestWidth}px.`);
  }

  for (const target of WIDTHS) {
    const output = `${name}-${target}.webp`;
    expected.add(output);
    written += await generate(master, output, (image) =>
      image.resize({ width: target }).webp({ quality: 82, effort: 6 })
    );
  }

  if (name === SHARE_IMAGE.master) {
    expected.add(SHARE_IMAGE.file);
    // The whole painting, centred on a dark backdrop.
    const { width, height, background } = SHARE_IMAGE;
    written += await generate(master, SHARE_IMAGE.file, (image) =>
      image.resize({ width, height, fit: 'contain', background }).jpeg({ quality: 85, mozjpeg: true })
    );
  }
}

if (!expected.has(SHARE_IMAGE.file)) {
  throw new Error(`Link-preview master ${SHARE_IMAGE.master}.jpg is missing from ${MASTER_DIR}.`);
}

// Drop outputs whose master was renamed or removed.
const stale = (await readdir(OUTPUT_DIR)).filter((file) => !expected.has(file));
await Promise.all(stale.map((file) => rm(join(OUTPUT_DIR, file))));

console.log(
  `images: ${masters.length} masters, ${written} written, ${expected.size - written} up to date` +
    (stale.length ? `, ${stale.length} stale removed` : '')
);
