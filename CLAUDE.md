# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal art portfolio website for Stephanie Kleine, showcasing contemporary paintings. Built with Vite, deployed to GitHub Pages via GitHub Actions.

## Architecture

```
src/
  css/style.css          # all styles (custom properties, responsive breakpoints, motion rules)
  js/
    main.js              # entry point — scroll reveal, scroll-to-top button
    lightbox.js          # painting viewer on a native <dialog>
    navigation.js        # hamburger menu, header background on scroll
  images/                # one clean master JPEG per painting (committed)
public/
  images/                # GENERATED from src/images — gitignored, never edit by hand
  favicon.svg            # SK monogram favicon
  robots.txt, sitemap.xml
tests/
  site.spec.js           # Playwright E2E tests (desktop + mobile)
scripts/
  image-config.mjs       # widths, folders, link-preview settings
  import-image.mjs       # photo → clean master in src/images
  optimize-images.mjs    # masters → WebP sizes + og-image.jpg in public/images
index.html               # Vite entry point
```

- `index.html` links external CSS/JS via Vite (`<script type="module" src="/src/js/main.js">`)
- Google Fonts loaded externally (Cormorant Garamond for headings, Work Sans for body text)
- The sixth gallery entry repeats `blue-lungs` as a stand-in until a sixth painting is photographed

## Commands

```bash
npm run dev              # Generate images, then start Vite dev server
npm run build            # Generate images, then production build → dist/
npm run preview          # Preview production build
npm test                 # Run Playwright E2E tests (needs a build first)
npm run optimize-images  # Regenerate public/images (runs automatically before dev/build)
npm run import-image -- "<photo>" <kebab-name>   # Add or replace a painting's master
```

## Images

- Never copy a photo straight into `src/images/`: phone photos carry GPS metadata and the repo is public. `npm run import-image` strips metadata, fixes orientation, converts to sRGB and caps the long edge at 2400px.
- To replace a photo, import it under the same name; nothing else changes.
- To add a painting, import it, then copy an `<article class="artwork">` block in `index.html` and change the name, alt text, caption and the `height` attribute (`960 × master height / master width`).
- The grid uses the 480/960/1440 widths via `srcset`; the lightbox uses 960/1440/2000 via `data-srcset` on the link. Masters must be at least 2000px wide or the build fails.
- `og-image.jpg` (link preview) is generated from the master named in `image-config.mjs`.

## Key Design Patterns

- CSS custom properties (`--bg-primary`, `--text-primary`, etc.) control the color scheme
- Gallery items follow `<article class="artwork">` with an `<a class="artwork-image">` link to the large image and a hidden `.artwork-info` caption that the lightbox copies
- The lightbox is a native `<dialog>` opened with `showModal()`: focus trap, Escape and the inert background come from the browser; the close button is a `<form method="dialog">` submit. It shows the grid image first and swaps in the large file when loaded
- Without JavaScript the page still works: content is visible and each painting links to its large image
- Scroll reveal uses IntersectionObserver adding `.visible`; the hidden start state only applies under `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)`
- All animation and smooth scrolling is opt-in under `prefers-reduced-motion: no-preference`; scrolling is plain anchors plus CSS `scroll-behavior`
- Floating hamburger menu (`<nav class="floating-nav">`) with z-index layering: overlay (899) < hamburger (910); the lightbox sits in the browser's top layer. The closed menu is `visibility: hidden` so its links are not focusable
- Skip link and `<main>` landmark for accessibility; `aria-label` on all sections

## SEO

- Meta description, Open Graph, and Twitter Card tags in `<head>`
- JSON-LD structured data (WebSite + Person schema)
- Canonical URL: `https://stephsart.github.io/`
- Link-preview image: `/images/og-image.jpg` (generated); `sitemap.xml` is listed in `robots.txt`

## CI/CD

GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. Generates images and builds with Vite (Node 24)
2. Runs Playwright tests (Chromium, desktop + mobile viewports)
3. Deploys `dist/` to GitHub Pages on push to `main`

Repo Settings > Pages must be set to "GitHub Actions" as the source.

## Verifying UI Changes

After making any visual or interactive changes, use Playwright MCP tools to verify:

1. Start dev server: `npm run dev`
2. `browser_navigate` to `http://localhost:5173`
3. `browser_snapshot` or `browser_take_screenshot` to confirm visual state
4. `browser_click` / `browser_press_key` to test interactive elements
5. `browser_resize` to 375x667 to verify mobile layout
