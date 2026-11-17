import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Keep the suite independent of third-party servers. The Google Fonts stylesheet
// blocks rendering and scripts until it answers, so a slow response stalls tests.
test.beforeEach(async ({ context }) => {
  await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort());
});

const firstPainting = (page) => page.locator('.artwork').first().locator('.artwork-image');
const lightbox = (page) => page.getByRole('dialog');

// --- Navigation ---

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hamburger toggles the menu and moves focus into it', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: 'Toggle navigation' });
    const overlay = page.locator('.nav-overlay');
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');

    await hamburger.click();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    await expect(overlay).toHaveClass(/active/);
    await expect(page.getByRole('link', { name: 'Home' })).toBeFocused();

    await hamburger.click();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(overlay).not.toHaveClass(/active/);
  });

  test('links in the closed menu cannot be reached', async ({ page }) => {
    await expect(page.locator('.nav-overlay a').first()).toBeHidden();
  });

  test('a menu link closes the menu and scrolls to its section', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await page.getByRole('link', { name: 'About' }).click();

    await expect(page.locator('.nav-overlay')).not.toHaveClass(/active/);
    await expect(page).toHaveURL(/#about$/);
    await expect(page.getByRole('heading', { name: 'About', exact: true })).toBeInViewport();
  });

  test('Escape closes the menu and returns focus to the hamburger', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: 'Toggle navigation' });
    await hamburger.click();
    await expect(page.locator('.nav-overlay')).toHaveClass(/active/);

    await page.keyboard.press('Escape');
    await expect(page.locator('.nav-overlay')).not.toHaveClass(/active/);
    await expect(hamburger).toBeFocused();
  });
});

// --- Lightbox ---

test.describe('Lightbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await firstPainting(page).click();
    await expect(lightbox(page)).toBeVisible();
  });

  test('shows the painting with its alt text, title and details', async ({ page }) => {
    await expect(lightbox(page).getByRole('img')).toHaveAttribute('alt', /Healing Lungs/);
    await expect(lightbox(page).getByRole('heading')).toHaveText('Healing Lungs');
    await expect(lightbox(page)).toContainText('Acrylic on Canvas');
    await expect(lightbox(page)).toContainText('2025');
  });

  test('replaces the grid image with a large one', async ({ page }) => {
    const image = lightbox(page).getByRole('img');
    await expect(image).toHaveAttribute('srcset', /blue-lungs-2000\.webp 2000w/);
    // The grid shows the 480px file on desktop; the lightbox must pick a larger one.
    await expect
      .poll(() => image.evaluate((el) => el.currentSrc))
      .toMatch(/blue-lungs-(960|1440|2000)\.webp$/);
  });

  test('Escape closes it', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(lightbox(page)).toBeHidden();
  });

  test('the close button closes it', async ({ page }) => {
    await page.getByRole('button', { name: 'Close lightbox' }).click();
    await expect(lightbox(page)).toBeHidden();
  });

  test('a click on the backdrop closes it', async ({ page }) => {
    await lightbox(page).click({ position: { x: 5, y: 5 } });
    await expect(lightbox(page)).toBeHidden();
  });

  test('a click on the painting keeps it open', async ({ page }) => {
    await lightbox(page).getByRole('img').click();
    await expect(lightbox(page)).toBeVisible();
  });

  test('focus starts on the close button and cannot reach the page behind', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Close lightbox' })).toBeFocused();

    // Tabbing may pass through the browser's own controls, but never the inert page.
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      const focusLeaked = await page.evaluate(() => {
        const active = document.activeElement;
        return active !== document.body && !active.closest('#lightbox');
      });
      expect(focusLeaked).toBe(false);
    }
  });

  test('focus returns to the painting after closing', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(firstPainting(page)).toBeFocused();
  });
});

// --- Images ---

test.describe('Images', () => {
  test('every image the gallery references exists', async ({ page, request }) => {
    await page.goto('/');

    const urls = await page.locator('.artwork-image').evaluateAll((links) => {
      const fromSrcset = (srcset) => srcset.split(',').map((candidate) => candidate.trim().split(' ')[0]);
      return [
        ...new Set(
          links.flatMap((link) => {
            const img = link.querySelector('img');
            return [
              link.getAttribute('href'),
              img.getAttribute('src'),
              ...fromSrcset(link.dataset.srcset),
              ...fromSrcset(img.getAttribute('srcset')),
            ];
          })
        ),
      ];
    });

    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      const response = await request.get(url);
      expect(response.ok(), url).toBe(true);
      expect(response.headers()['content-type'], url).toContain('image/webp');
    }
  });

  test('the link-preview image exists', async ({ page, request }) => {
    await page.goto('/');
    const content = await page.locator('meta[property="og:image"]').getAttribute('content');
    const response = await request.get(new URL(content).pathname);
    expect(response.ok()).toBe(true);
  });

  test('gallery images have alt text', async ({ page }) => {
    await page.goto('/');
    for (const image of await page.locator('.artwork-image img').all()) {
      await expect(image).toHaveAttribute('alt', /\S/);
    }
  });
});

// --- Accessibility ---

test.describe('Accessibility', () => {
  // Reduced motion shows the whole page at once, so axe checks every section
  // instead of only what has scrolled into view.
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('skip link is the first focusable element', async ({ page }) => {
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
  });

  test('page has no axe-core violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('open lightbox has no axe-core violations', async ({ page }) => {
    await firstPainting(page).click();
    await expect(lightbox(page)).toHaveCSS('opacity', '1'); // fade-in finished

    const results = await new AxeBuilder({ page }).include('#lightbox').analyze();
    expect(results.violations).toEqual([]);
  });

  test('content is visible without waiting for scroll animations', async ({ page }) => {
    await expect(page.locator('.about-content')).toHaveCSS('opacity', '1');
  });
});

test.describe('Without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('content is visible and paintings link to their large image', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.about-content')).toHaveCSS('opacity', '1');
    await expect(firstPainting(page)).toHaveAttribute('href', /blue-lungs-2000\.webp$/);
  });
});

// --- SEO ---

test.describe('SEO', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('meta description present', async ({ page }) => {
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /Contemporary paintings by Stephanie Kleine/);
  });

  test('Open Graph tags present', async ({ page }) => {
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  });

  test('JSON-LD structured data is valid', async ({ page }) => {
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(jsonLd);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('WebSite');
    expect(data.author.name).toBe('Stephanie Kleine');
  });

  test('canonical URL present', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://stephsart.github.io/');
  });

  test('sitemap named in robots.txt exists', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    const sitemap = robots.match(/^Sitemap:\s*(\S+)/m)[1];
    const response = await request.get(new URL(sitemap).pathname);
    expect(response.ok()).toBe(true);
  });
});

// --- Smoke ---

test.describe('Smoke', () => {
  test('page loads without JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    expect(errors).toEqual([]);
  });

  test('gallery renders 6 artworks', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.artwork')).toHaveCount(6);
  });

  test('footer has copyright and contact link', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toContainText('© 2026 Stephanie Kleine');
    await expect(footer.getByRole('link', { name: 'stephanie@kleine.me' })).toHaveAttribute(
      'href',
      'mailto:stephanie@kleine.me'
    );
  });
});

// --- Header and scroll-to-top ---

test.describe('Header and scroll-to-top', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('scroll-to-top button appears after scrolling past the hero', async ({ page }) => {
    const button = page.locator('#scroll-to-top');
    await expect(button).toBeHidden();

    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await expect(button).toBeVisible();
  });

  test('header gets a background on scroll', async ({ page }) => {
    const nav = page.locator('#floating-nav');
    await expect(nav).not.toHaveClass(/scrolled/);

    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await expect(nav).toHaveClass(/scrolled/);
  });

  test('site logo is visible', async ({ page }) => {
    const logo = page.locator('.site-logo');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveText('SK');
  });
});
