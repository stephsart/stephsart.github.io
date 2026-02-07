import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { join, parse } from 'node:path';

const SRC_DIR = 'src/images';
const OUT_DIR = 'public/images';
const WIDTHS = [400, 800, 1200, 1600];

async function optimize() {
  await mkdir(OUT_DIR, { recursive: true });

  const files = await readdir(SRC_DIR);
  const images = files.filter((f) => /\.(jpe?g|png)$/i.test(f));

  for (const file of images) {
    const { name } = parse(file);
    const srcPath = join(SRC_DIR, file);
    console.log(`Processing ${file}...`);

    // Generate WebP at multiple widths
    for (const width of WIDTHS) {
      await sharp(srcPath)
        .resize(width)
        .webp({ quality: 80 })
        .toFile(join(OUT_DIR, `${name}-${width}w.webp`));
    }

    // Generate JPEG fallback at 800w
    await sharp(srcPath)
      .resize(800)
      .jpeg({ quality: 80 })
      .toFile(join(OUT_DIR, `${name}-800w.jpg`));

    console.log(`  ✓ ${name}: ${WIDTHS.length} WebP + 1 JPEG fallback`);
  }

  console.log('Done!');
}

optimize().catch(console.error);
