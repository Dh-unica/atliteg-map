import { defineConfig, devices } from '@playwright/test';

/**
 * Configurazione Playwright per i test e2e di AtLiTeG Map.
 *
 * Esecuzione autonoma: i `webServer` qui sotto costruiscono l'export statico
 * del frontend (forzando il caricamento dei dati dai file JSON statici tramite
 * NEXT_PUBLIC_API_KEY vuota) e avviano il backend Express, così `npm run e2e`
 * non richiede alcun servizio già in esecuzione.
 *
 * Override con variabili d'ambiente:
 *   E2E_BASE_URL  -> URL frontend già attivo (salta build+serve)
 *   E2E_API_URL   -> URL backend già attivo
 */

const FRONTEND_PORT = Number(process.env.E2E_FRONTEND_PORT || 9000);
const BACKEND_PORT = Number(process.env.E2E_BACKEND_PORT || 3101);

const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${FRONTEND_PORT}`;
const API_URL = process.env.E2E_API_URL || `http://localhost:${BACKEND_PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      // Spec UI (tutto tranne i test API): layout, mappa, ricerca, filtri, indice
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /api\.spec\.ts/,
    },
    {
      // Solo lo spec del layout mobile della toolbar, su device mobile Chromium
      // (Pixel 7 usa il motore Chromium: mantiene la suite su un unico browser).
      name: 'Mobile Chrome (Pixel 7)',
      use: { ...devices['Pixel 7'] },
      testMatch: /mobile-toolbar\.spec\.ts/,
    },
    {
      // Test API del backend Express (nessun browser necessario)
      name: 'API',
      testMatch: /api\.spec\.ts/,
      use: { baseURL: API_URL },
    },
  ],
  webServer: [
    {
      // Frontend: build export statico + serve. NEXT_PUBLIC_API_KEY vuota forza
      // il caricamento dei dati dai file statici (out/data/*.json), così i test
      // UI non dipendono dal backend.
      command:
        'cd lemmario-dashboard && NEXT_PUBLIC_API_URL= NEXT_PUBLIC_API_KEY= npm run build && python3 -m http.server ' +
        FRONTEND_PORT +
        ' --directory out',
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      // Backend API Express con i dati in server/data/*.json
      command: 'node lemmario-dashboard/server/index.js',
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        PORT: String(BACKEND_PORT),
        NODE_ENV: 'test',
        FRONTEND_API_KEYS: 'default_dev_key',
        ALLOWED_ORIGINS: BASE_URL,
      },
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
