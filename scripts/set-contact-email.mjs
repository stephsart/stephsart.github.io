// Sets the contact address in index.html without writing it there in plain text.
//
//   npm run set-contact-email -- name@example.com
//
// The repository is public, so the address should never appear in a committed
// file; type it here instead. See src/js/email-codec.js for the encoding.

import { readFile, writeFile } from 'node:fs/promises';
import { decode, encode, fallbackText, isAddress } from '../src/js/email-codec.js';

const FILE = 'index.html';
const ELEMENT = /(<span class="contact-email" data-email=")[^"]*(">)[^<]*(<\/span>)/g;

const address = process.argv[2] ?? '';
if (!isAddress(address)) {
  console.error('Usage: npm run set-contact-email -- name@example.com');
  process.exit(1);
}

const encoded = encode(address);
if (decode(encoded) !== address) {
  throw new Error('The address does not survive encoding; it may contain unusual characters.');
}

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const html = await readFile(FILE, 'utf8');
const found = html.match(ELEMENT)?.length ?? 0;
if (found !== 1) {
  throw new Error(`Expected one <span class="contact-email" data-email="…"> in ${FILE}, found ${found}.`);
}

await writeFile(
  FILE,
  html.replace(ELEMENT, (_, open, middle, close) => `${open}${encoded}${middle}${escapeHtml(fallbackText(address))}${close}`)
);
console.log(`${FILE}: contact address updated.`);
