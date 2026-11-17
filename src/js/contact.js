import { decode, isAddress } from './email-codec.js';

// The page ships a written-out fallback ("name [at] example.com") that carries
// the encoded address in data-email. This swaps it for a normal mailto link.
// If the script is switched off, blocked or fails to load, the fallback stays,
// so every visitor can still read the address.
export function init() {
  document.querySelectorAll('[data-email]').forEach((fallback) => {
    const address = decode(fallback.dataset.email);
    if (!isAddress(address)) return;

    const link = document.createElement('a');
    link.className = fallback.className;
    link.href = `mailto:${address}`;
    link.textContent = address;
    fallback.replaceWith(link);
  });
}
