# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal art portfolio website for Stephanie Kleine, showcasing contemporary paintings. This is a static site with no build system, framework, or dependencies.

## Architecture

The entire site is a single `index.html` file containing:
- Inline CSS (custom properties defined in `:root`, responsive design via media queries at 768px breakpoint)
- Inline JavaScript (lightbox modal, floating hamburger menu, smooth scroll navigation)
- Google Fonts loaded externally (Cormorant Garamond for headings, Work Sans for body text)

Artwork images live in `images/`. Several gallery entries still use placeholder `<div>`s instead of actual `<img>` tags — only `blue-lungs.jpg` has a real image.

## Development

No build step. Open `index.html` directly in a browser or serve it with any static file server:

```
python3 -m http.server 8000
```

## Key Design Patterns

- CSS custom properties (`--bg-primary`, `--text-primary`, etc.) control the color scheme
- Gallery items follow a repeating `<article class="artwork">` structure with `.artwork-image` and `.artwork-info` children
- Lightbox opens only for entries that contain an `<img>` tag (placeholders are skipped)
- Staggered fade-in animations use `animation-delay` on `.artwork:nth-child(n)` selectors — new gallery items need corresponding CSS rules
- Floating hamburger menu (`<nav class="floating-nav">`) is fixed-position with z-index layering: overlay (899) < hamburger (910) < lightbox (1000)

## Verifying UI Changes

After making any visual or interactive changes, use Playwright MCP tools to verify:

1. Start a local server: `python3 -m http.server 8000`
2. `browser_navigate` to `http://localhost:8000`
3. `browser_snapshot` or `browser_take_screenshot` to confirm visual state
4. `browser_click` / `browser_press_key` to test interactive elements
5. `browser_resize` to 375x667 to verify mobile layout
