import { test, expect, Page } from '@playwright/test';

/**
 * Test e2e dei flussi principali dell'applicazione (export statico servito).
 *
 * Servono da rete di sicurezza per gli aggiornamenti delle dipendenze
 * (Next.js / PostCSS): verificano che build + rendering + interazioni chiave
 * continuino a funzionare. I dati provengono dai file statici (out/data/*.json).
 */

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:9000';

/** Attende che i dati siano caricati: la toolbar (e quindi la search) appare solo dopo il load. */
async function waitForApp(page: Page) {
  await page.goto(BASE_URL);
  await expect(page.getByPlaceholder('Cerca lemma o forma...')).toBeVisible({ timeout: 30000 });
}

test.describe('AtLiTeG - Flussi principali', () => {
  test('la home carica e mostra le metriche con conteggi > 0', async ({ page }) => {
    await waitForApp(page);

    const metrics = page.getByTestId('metrics-summary');
    await expect(metrics).toBeVisible();

    // Le etichette principali sono presenti
    await expect(metrics.getByText('Lemmi:')).toBeVisible();
    await expect(metrics.getByText('Forme:')).toBeVisible();

    // I conteggi di Lemmi e Forme devono essere numeri > 0
    const lemmiText = await page.getByTestId('metric-lemmi').innerText();
    const formeText = await page.getByTestId('metric-forme').innerText();
    const lemmiCount = parseInt(lemmiText.replace(/\D/g, ''), 10);
    const formeCount = parseInt(formeText.replace(/\D/g, ''), 10);
    expect(lemmiCount).toBeGreaterThan(0);
    expect(formeCount).toBeGreaterThan(0);
  });

  test('la mappa Leaflet viene renderizzata con i controlli zoom', async ({ page }) => {
    await waitForApp(page);

    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible({ timeout: 15000 });
    // Leaflet inizializzato correttamente: controlli zoom presenti
    await expect(page.locator('.leaflet-control-zoom')).toBeVisible();
  });

  test('la ricerca mostra suggerimenti e popola il Dettaglio Forme', async ({ page }) => {
    await waitForApp(page);

    const search = page.getByPlaceholder('Cerca lemma o forma...');
    await search.click();
    await search.fill('sale');

    // I suggerimenti compaiono (debounce 300ms)
    const firstSuggestion = page.locator('.shadow-card-hover > div').first();
    await expect(firstSuggestion).toBeVisible({ timeout: 5000 });

    const lemmaName = (await firstSuggestion.locator('.font-medium').first().innerText()).trim();
    expect(lemmaName.length).toBeGreaterThan(0);

    await firstSuggestion.click();

    // Il pannello dettaglio si popola
    await expect(page.getByRole('heading', { name: 'Dettaglio Forme' })).toBeVisible();
    await expect(page.getByText('forme', { exact: false }).first()).toBeVisible();
  });

  test('il filtro Categoria aggiorna lo stato e il Reset lo azzera', async ({ page }) => {
    await waitForApp(page);

    // Stato iniziale: nessun lemma selezionato
    await expect(page.getByText('Nessun lemma selezionato')).toBeVisible();

    // Apre il dropdown Categoria
    await page.getByRole('button', { name: 'Categoria' }).click();

    // Le opzioni sono renderizzate in un portal con classe shadow-xl
    const firstOption = page.locator('.shadow-xl button').first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    const categoryLabel = (await firstOption.innerText()).trim();
    await firstOption.click();

    // Appare il tag del filtro attivo e il bottone Reset
    const resetButton = page.getByRole('button', { name: 'Reset' });
    await expect(resetButton).toBeVisible();

    // Il dettaglio non è più vuoto
    await expect(page.getByText('Nessun lemma selezionato')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Dettaglio Forme' })).toBeVisible();

    // Reset riporta allo stato iniziale
    await resetButton.click();
    await expect(page.getByRole('button', { name: 'Reset' })).toHaveCount(0);
    await expect(page.getByText('Nessun lemma selezionato')).toBeVisible();
  });

  test('indice alfabetico: apertura, selezione lettera e selezione lemma', async ({ page }) => {
    await waitForApp(page);

    // Apre l'indice
    await page.getByRole('button', { name: 'Apri indice alfabetico' }).click();
    await expect(page.getByRole('heading', { name: 'Indice Alfabetico' })).toBeVisible();

    // Seleziona la lettera A (presente nel dataset)
    await page.getByRole('button', { name: 'Lettera A', exact: true }).click();

    // Compaiono i lemmi della lettera: bottoni che contengono un <h4>
    const firstLemma = page.locator('button:has(h4)').first();
    await expect(firstLemma).toBeVisible({ timeout: 5000 });
    const lemmaName = (await firstLemma.locator('h4').innerText()).trim();
    expect(lemmaName.length).toBeGreaterThan(0);

    await firstLemma.click();

    // L'indice si chiude e il dettaglio si popola
    await expect(page.getByRole('heading', { name: 'Indice Alfabetico' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Dettaglio Forme' })).toBeVisible();
  });
});
