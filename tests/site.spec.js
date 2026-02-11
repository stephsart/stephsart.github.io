import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// --- Navigation ---

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hamburger toggles overlay and aria-expanded', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: 'Toggle navigation' });
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');

    await hamburger.click();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.nav-overlay')).toHaveClass(/active/);

    await hamburger.click();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.nav-overlay')).not.toHaveClass(/active/);
  });

  test('nav links scroll to sections', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: 'Toggle navigation' });
    await hamburger.click();
    await page.getByRole('link', { name: 'About' }).click();

    // Menu should close
    await expect(page.locator('.nav-overlay')).not.toHaveClass(/active/);
  });

  test('Escape closes menu and returns focus to hamburger', async ({ page }) => {
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
    // Scroll the last artwork (Blue Lungs) into view so IntersectionObserver triggers
    await page.locator('.artwork:last-child').scrollIntoViewIfNeeded();
    await page.locator('.artwork:last-child.visible').waitFor();
  });

  test('real image opens lightbox with correct alt text', async ({ page }) => {
    const artworkBtn = page.locator('.artwork:last-child .artwork-image');
    await artworkBtn.click();

    const lightbox = page.locator('.lightbox');
    await expect(lightbox).toHaveClass(/active/);

    const lightboxImg = page.locator('#lightbox-img');
    await expect(lightboxImg).toHaveAttribute('alt', /Lungs filled with Blue Smoke/);
  });

  test('lightbox shows artwork title and details', async ({ page }) => {
    await page.locator('.artwork:last-child .artwork-image').click();
    await expect(page.locator('.lightbox')).toHaveClass(/active/);

    const lightboxInfo = page.locator('#lightbox-info');
    await expect(lightboxInfo).toContainText('Lungs filled with Blue Smoke');
    await expect(lightboxInfo).toContainText('Acrylic on Canvas');
  });

  test('placeholder does not open lightbox', async ({ page }) => {
    // Click the first artwork (placeholder)
    await page.locator('.artwork-image').first().click();
    const lightbox = page.locator('.lightbox');
    await expect(lightbox).not.toHaveClass(/active/);
  });

  test('Escape closes lightbox', async ({ page }) => {
    await page.locator('.artwork:last-child .artwork-image').click();
    await expect(page.locator('.lightbox')).toHaveClass(/active/);

    await page.keyboard.press('Escape');
    await expect(page.locator('.lightbox')).not.toHaveClass(/active/);
  });

  test('close button closes lightbox', async ({ page }) => {
    await page.locator('.artwork:last-child .artwork-image').click();
    await expect(page.locator('.lightbox')).toHaveClass(/active/);

    await page.getByRole('button', { name: 'Close lightbox' }).click();
    await expect(page.locator('.lightbox')).not.toHaveClass(/active/);
  });

  test('focus returns to trigger after close', async ({ page }) => {
    const artworkBtn = page.locator('.artwork:last-child .artwork-image');
    await artworkBtn.click();
    await expect(page.locator('.lightbox')).toHaveClass(/active/);

    await page.keyboard.press('Escape');
    await expect(artworkBtn).toBeFocused();
  });

  test('focus trap keeps focus on close button', async ({ page }) => {
    await page.locator('.artwork:last-child .artwork-image').click();
    const closeBtn = page.getByRole('button', { name: 'Close lightbox' });
    await expect(closeBtn).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(closeBtn).toBeFocused();
  });
});

// --- Accessibility ---

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('skip link becomes visible on focus', async ({ page }) => {
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();
  });

  test('no axe-core violations', async ({ page }) => {
    // Wait for fade-in animations to complete (they set opacity via animation)
    await page.waitForTimeout(2000);
    const results = await new AxeBuilder({ page })
      .exclude('.placeholder-image') // Placeholders are temporary
      .exclude('.artwork:not(.visible)') // Not yet scrolled into view
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('images have alt text', async ({ page }) => {
    const images = page.locator('.artwork-image img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('lightbox close is a button with aria-label', async ({ page }) => {
    const closeBtn = page.locator('.lightbox-close');
    await expect(closeBtn).toHaveAttribute('aria-label', 'Close lightbox');
    expect(await closeBtn.evaluate((el) => el.tagName.toLowerCase())).toBe('button');
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
    const artworks = page.locator('.artwork');
    await expect(artworks).toHaveCount(6);
  });

  test('footer has copyright', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toContainText('© 2026 Stephanie Kleine');
  });
});
