// Shared by import-image.mjs and optimize-images.mjs.

export const MASTER_DIR = 'src/images'; // one clean JPEG per painting, committed
export const OUTPUT_DIR = 'public/images'; // generated, not committed

export const MASTER_MAX_EDGE = 2400;

// Widths referenced from index.html: 480–1440 in the grid, 960–2000 in the lightbox.
export const WIDTHS = [480, 960, 1440, 2000];

// Link preview shown when the site is shared (Open Graph / Twitter card).
export const SHARE_IMAGE = {
  master: 'blue-lungs',
  file: 'og-image.jpg',
  width: 1200,
  height: 630,
  background: '#1a1a1a', // --text-primary in style.css
};
