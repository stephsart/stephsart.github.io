// Adds a photo to src/images as a clean master file.
//
//   npm run import-image -- "/path/to/photo.jpg" loving-heart
//
// The master is upright, sRGB, at most 2400px on its long edge, and carries no
// camera metadata. Phone photos embed the GPS position they were taken at, and
// this repository is public, so photos go through here instead of being copied in.

import sharp from 'sharp';
import { join } from 'node:path';
import { MASTER_DIR, MASTER_MAX_EDGE } from './image-config.mjs';

const [source, slug] = process.argv.slice(2);

if (!source || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug ?? '')) {
  console.error('Usage: npm run import-image -- <photo> <name-in-kebab-case>');
  process.exit(1);
}

const target = join(MASTER_DIR, `${slug}.jpg`);

// sharp drops all metadata and converts to sRGB unless told otherwise.
const { width, height } = await sharp(source)
  .rotate() // bake in the EXIF orientation before it is stripped
  .resize({ width: MASTER_MAX_EDGE, height: MASTER_MAX_EDGE, fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
  .toFile(target);

console.log(`${target} (${width}×${height})`);
