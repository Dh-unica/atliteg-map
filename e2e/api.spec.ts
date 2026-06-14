import { test, expect } from '@playwright/test';

/**
 * Test e2e delle API del backend Express.
 *
 * Servono da rete di sicurezza per gli aggiornamenti delle dipendenze backend
 * (express/qs, uuid, bcrypt, jsonwebtoken): verificano routing, autenticazione
 * via API key, login admin (bcrypt + JWT) e gestione degli errori.
 *
 * baseURL è impostata dal progetto "API" in playwright.config.ts (porta 3001).
 */

const VALID_API_KEY = 'default_dev_key';

test.describe('Backend API', () => {
  test('GET /health risponde 200', async ({ request }) => {
    const res = await request.get('/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(['ok', 'degraded']).toContain(body.status);
  });

  test('GET /api/lemmi senza API key → 401', async ({ request }) => {
    const res = await request.get('/api/lemmi');
    expect(res.status()).toBe(401);
  });

  test('GET /api/lemmi con API key non valida → 401', async ({ request }) => {
    const res = await request.get('/api/lemmi', { headers: { 'X-API-Key': 'chiave-sbagliata' } });
    expect(res.status()).toBe(401);
  });

  test('GET /api/lemmi con API key valida → 200 e dati', async ({ request }) => {
    const res = await request.get('/api/lemmi', { headers: { 'X-API-Key': VALID_API_KEY } });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('Lemma');
    expect(data[0]).toHaveProperty('Forma');
  });

  test('GET /api/geojson con API key valida → 200 e features', async ({ request }) => {
    const res = await request.get('/api/geojson', { headers: { 'X-API-Key': VALID_API_KEY } });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test('GET su rotta inesistente → 404', async ({ request }) => {
    const res = await request.get('/api/non-esiste');
    expect(res.status()).toBe(404);
  });

  test('POST /api/admin/login con credenziali valide → token JWT', async ({ request }) => {
    const res = await request.post('/api/admin/login', {
      data: { username: 'admin', password: 'admin' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.token).toBe('string');
    // Un JWT è composto da 3 segmenti separati da punto
    expect(body.token.split('.')).toHaveLength(3);
  });

  test('POST /api/admin/login con password errata → 401', async ({ request }) => {
    const res = await request.post('/api/admin/login', {
      data: { username: 'admin', password: 'password-sbagliata' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('POST /api/admin/login senza credenziali → 400', async ({ request }) => {
    const res = await request.post('/api/admin/login', { data: {} });
    expect(res.status()).toBe(400);
  });
});
