import { defineConfig } from 'vite';

// GitHub Pages cannot send response headers, so the policy ships as a <meta> tag.
// Everything the page loads comes from its own origin; the one data: image is the
// magnifier icon in style.css.
const contentSecurityPolicy = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

// Production build only: the dev server injects inline styles and opens a
// websocket for hot reload, both of which this policy would block.
function contentSecurityPolicyMeta() {
  return {
    name: 'content-security-policy-meta',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: contentSecurityPolicy },
        injectTo: 'head-prepend',
      },
    ],
  };
}

export default defineConfig({
  plugins: [contentSecurityPolicyMeta()],
});
