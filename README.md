# Stephanie Kleine — Contemporary Paintings

Portfolio site for the painter Stephanie Kleine: <https://stephaniekleine.com/>

A single static page built with [Vite](https://vite.dev), with no framework and no runtime dependencies. GitHub Actions builds it, runs the tests and deploys to GitHub Pages on every push to `main`.

## Run it

```bash
npm install
npm run dev
```

```bash
npm run build
npx playwright install chromium
npm test
```

`npm test` runs the Playwright suite against the production build at desktop and phone sizes, including axe accessibility scans.

## How it is put together

- **`index.html`** holds all content. Each painting is a link to its large image, so the gallery works without JavaScript.
- **`src/css/style.css`** holds all styles. Animation and smooth scrolling only apply when the visitor has not asked for reduced motion.
- **`src/js/`** adds the lightbox (a native `<dialog>`), the menu and the scroll reveal.
- **`src/images/`** holds one master JPEG per painting. The sizes the site serves are generated into `public/images/` before every dev start and build, and are not committed.

## Add or replace a painting

Import the photo instead of copying it into the repository. The import removes camera metadata, including the GPS position phones embed.

```bash
npm run import-image -- "/path/to/photo.jpg" name-of-painting
```

Importing under an existing name replaces that painting's photo everywhere. For a new painting, also copy one `<article class="artwork">` block in `index.html` and change the name, alt text and caption.

## Copyright

All artwork and photographs © Stephanie Kleine. All rights reserved.
