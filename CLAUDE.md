# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal art portfolio website for Stephanie Kleine, showcasing contemporary paintings. Built with Vite, deployed to GitHub Pages via GitHub Actions.

## Architecture

```
src/
  css/style.css          # all styles (custom properties, responsive breakpoints)
  js/
    main.js              # entry point — imports modules, IntersectionObserver animations
    lightbox.js          # lightbox with focus trap and keyboard support
    navigation.js        # hamburger menu + smooth scroll
  images/                # source artwork images
public/
  favicon.svg            # SK monogram favicon
  robots.txt
tests/
  site.spec.js           # Playwright E2E tests (desktop + mobile)
scripts/
  optimize-images.mjs    # sharp-based image optimizer (WebP + JPEG fallbacks)
index.html               # Vite entry point
```

- `index.html` links external CSS/JS via Vite (`<script type="module" src="/src/js/main.js">`)
- Google Fonts loaded externally (Cormorant Garamond for headings, Work Sans for body text)
- Several gallery entries still use placeholder `<div>`s — only `blue-lungs.jpg` has a real image

## Commands

```bash
npm run dev              # Start Vite dev server
npm run build            # Production build → dist/
npm run preview          # Preview production build
npm test                 # Run Playwright E2E tests
npm run optimize-images  # Generate WebP/JPEG variants from src/images/
```

## Key Design Patterns

- CSS custom properties (`--bg-primary`, `--text-primary`, etc.) control the color scheme
- Gallery items follow `<article class="artwork">` with `.artwork-image` and `.artwork-info` children
- Lightbox opens only for entries containing an `<img>` tag (placeholders are skipped)
- Lightbox has full keyboard/focus trap support: close button gets focus on open, Tab is trapped, Escape closes, focus returns to trigger
- Scroll animations use IntersectionObserver adding `.visible` class — no manual CSS rules needed for new artworks
- Floating hamburger menu (`<nav class="floating-nav">`) with z-index layering: overlay (899) < hamburger (910) < lightbox (1000)
- Skip link and `<main>` landmark for accessibility; `aria-label` on all sections

## SEO

- Meta description, Open Graph, and Twitter Card tags in `<head>`
- JSON-LD structured data (WebSite + Person schema)
- Canonical URL: `https://stephsart.github.io/`

## CI/CD

GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. Builds with Vite
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
