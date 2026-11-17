// Keeps the contact address out of everything the site serves and out of the
// public repository. Spam harvesters scan HTML and scripts for text shaped like
// an address, so it is stored as its characters in reverse order, each code
// shifted by OFFSET and written in base 36. contact.js turns it back into a
// link in the visitor's browser.
//
// Shared by the browser (contact.js) and the build tooling (set-contact-email.mjs).
// To change the address: npm run set-contact-email -- name@example.com

const OFFSET = 23;
const SEPARATOR = '-';

export function encode(address) {
  return [...address]
    .reverse()
    .map((character) => (character.codePointAt(0) + OFFSET).toString(36))
    .join(SEPARATOR);
}

export function decode(encoded) {
  return encoded
    .split(SEPARATOR)
    .map((code) => String.fromCodePoint(parseInt(code, 36) - OFFSET))
    .reverse()
    .join('');
}

// What visitors see when the script does not run: readable and easy to type,
// but not shaped like an address.
export function fallbackText(address) {
  return address.replace('@', ' [at] ');
}

export function isAddress(text) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text);
}
