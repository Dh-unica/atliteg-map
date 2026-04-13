import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:9000';

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };

async function waitForApp(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="compact-toolbar"]', { timeout: 15000 }).catch(() => {});
}

test.describe('CompactToolbar - Layout mobile', () => {
  test('search bar è su riga separata dai filtri su viewport mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(BASE_URL);
    await waitForApp(page);

    const searchInput = page.locator('input[placeholder*="Cerca"]').first();
    const indiceButton = page.locator('button:has-text("Indice")').first();
    const categoriaButton = page.locator('button:has-text("Categoria")').first();

    await expect(searchInput).toBeVisible();
    await expect(indiceButton).toBeVisible();
    await expect(categoriaButton).toBeVisible();

    const searchBox = await searchInput.boundingBox();
    const indiceBox = await indiceButton.boundingBox();
    const categoriaBox = await categoriaButton.boundingBox();

    expect(searchBox).not.toBeNull();
    expect(indiceBox).not.toBeNull();
    expect(categoriaBox).not.toBeNull();

    const searchBottom = searchBox!.y + searchBox!.height;
    const indiceTop = indiceBox!.y;
    const categoriaTop = categoriaBox!.y;

    // Su mobile, la search bar deve terminare prima della riga Indice/Categoria (margine 4px)
    expect(searchBottom).toBeLessThanOrEqual(indiceTop + 4);
    expect(searchBottom).toBeLessThanOrEqual(categoriaTop + 4);

    // La search bar deve occupare quasi tutta la larghezza del viewport
    expect(searchBox!.width).toBeGreaterThan(MOBILE_VIEWPORT.width * 0.8);
  });

  test('nessuna sovrapposizione tra search bar e bottoni filtro su mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(BASE_URL);
    await waitForApp(page);

    const searchInput = page.locator('input[placeholder*="Cerca"]').first();
    const categoriaButton = page.locator('button:has-text("Categoria")').first();

    const searchBox = await searchInput.boundingBox();
    const categoriaBox = await categoriaButton.boundingBox();

    expect(searchBox).not.toBeNull();
    expect(categoriaBox).not.toBeNull();

    const searchBottom = searchBox!.y + searchBox!.height;
    const searchRight = searchBox!.x + searchBox!.width;
    const categoriaTop = categoriaBox!.y;
    const categoriaLeft = categoriaBox!.x;

    const verticalOverlap = searchBottom > categoriaTop && searchBox!.y < (categoriaBox!.y + categoriaBox!.height);
    const horizontalOverlap = searchRight > categoriaLeft && searchBox!.x < (categoriaBox!.x + categoriaBox!.width);

    expect(verticalOverlap && horizontalOverlap).toBe(false);
  });

  test('su desktop tutti gli elementi sono sulla stessa riga', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto(BASE_URL);
    await waitForApp(page);

    const searchInput = page.locator('input[placeholder*="Cerca"]').first();
    const indiceButton = page.locator('button:has-text("Indice")').first();
    const categoriaButton = page.locator('button:has-text("Categoria")').first();

    await expect(searchInput).toBeVisible();
    await expect(indiceButton).toBeVisible();
    await expect(categoriaButton).toBeVisible();

    const searchBox = await searchInput.boundingBox();
    const indiceBox = await indiceButton.boundingBox();
    const categoriaBox = await categoriaButton.boundingBox();

    expect(searchBox).not.toBeNull();
    expect(indiceBox).not.toBeNull();
    expect(categoriaBox).not.toBeNull();

    // Su desktop, tutti gli elementi devono avere centro verticale simile (±20px)
    const searchMidY = searchBox!.y + searchBox!.height / 2;
    const indiceMidY = indiceBox!.y + indiceBox!.height / 2;
    const categoriaMidY = categoriaBox!.y + categoriaBox!.height / 2;

    expect(Math.abs(searchMidY - indiceMidY)).toBeLessThan(20);
    expect(Math.abs(searchMidY - categoriaMidY)).toBeLessThan(20);
  });

  test('ricerca funziona correttamente da mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(BASE_URL);
    await waitForApp(page);

    const searchInput = page.locator('input[placeholder*="Cerca"]').first();
    await searchInput.click();
    await searchInput.fill('sal');

    await page.waitForTimeout(400);

    const suggestions = page.locator('.shadow-card-hover').first();
    await expect(suggestions).toBeVisible({ timeout: 3000 });
  });
});
