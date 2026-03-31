import { Lemma, GeoArea } from '@/types/lemma';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

/**
 * Carica i dati lemmi da file statico (fallback quando l'API non è disponibile)
 */
async function loadCSVDataFromStatic(): Promise<Lemma[]> {
  const startTime = performance.now();
  const response = await fetch('/data/lemmi.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Static file error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json() as Lemma[];
  const endTime = performance.now();
  console.log(`✅ Dati caricati da file statico: ${data.length} record in ${(endTime - startTime).toFixed(0)}ms`);
  return data;
}

/**
 * Carica GeoJSON da file statico (fallback quando l'API non è disponibile)
 */
async function loadGeoJSONFromStatic(): Promise<GeoArea[]> {
  const startTime = performance.now();
  const response = await fetch('/data/geojson.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Static file error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json() as GeoArea[];
  const endTime = performance.now();
  console.log(`✅ GeoJSON caricato da file statico: ${data.length} features in ${(endTime - startTime).toFixed(0)}ms`);
  return data;
}

/**
 * Carica i dati da backend API con fallback su file statici
 */
export async function loadCSVData(): Promise<Lemma[]> {
  const startTime = performance.now();

  // Add cache-busting parameter if present in URL
  let apiUrl = `${API_BASE_URL}/api/lemmi`;
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const version = urlParams.get('v');
    if (version) {
      apiUrl += `?v=${version}`;
    }
  }

  // Tenta caricamento via API se la chiave è configurata
  if (API_KEY) {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'X-API-Key': API_KEY
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      if (response.ok) {
        const data = await response.json() as Lemma[];
        const endTime = performance.now();
        console.log(`✅ Dati caricati da API: ${data.length} record in ${(endTime - startTime).toFixed(0)}ms`);
        return data;
      }
      console.warn(`⚠️ API non disponibile (${response.status}), tentativo con file statico...`);
    } catch (apiError) {
      console.warn('⚠️ Errore API, tentativo con file statico...', apiError);
    }
  }

  // Fallback: carica da file statico
  return loadCSVDataFromStatic();
}

/**
 * Carica GeoJSON da backend API con fallback su file statici
 */
export async function loadGeoJSON(): Promise<GeoArea[]> {
  const startTime = performance.now();

  // Tenta caricamento via API se la chiave è configurata
  if (API_KEY) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/geojson`, {
        headers: {
          'X-API-Key': API_KEY
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      if (response.ok) {
        const data = await response.json() as GeoArea[];
        const endTime = performance.now();
        console.log(`✅ GeoJSON caricato da API: ${data.length} features in ${(endTime - startTime).toFixed(0)}ms`);
        return data;
      }
      console.warn(`⚠️ API GeoJSON non disponibile (${response.status}), tentativo con file statico...`);
    } catch (apiError) {
      console.warn('⚠️ Errore API GeoJSON, tentativo con file statico...', apiError);
    }
  }

  // Fallback: carica da file statico
  return loadGeoJSONFromStatic();
}


export function parseCategorie(categoriaString: string): string[] {
  if (!categoriaString) return [];
  return categoriaString.split(',').map(cat => cat.trim()).filter(Boolean);
}

export function getUniqueCategorie(lemmi: Lemma[]): string[] {
  const categorieSet = new Set<string>();
  lemmi.forEach(lemma => {
    parseCategorie(lemma.Categoria).forEach(cat => categorieSet.add(cat));
  });
  return Array.from(categorieSet).sort();
}

export function getUniquePeriodi(lemmi: Lemma[]): string[] {
  const periodiSet = new Set<string>();
  lemmi.forEach(lemma => {
    if (lemma.Periodo) periodiSet.add(lemma.Periodo);
  });
  return Array.from(periodiSet).sort();
}

export function getUniqueAnni(lemmi: Lemma[]): string[] {
  const anniSet = new Set<string>();
  lemmi.forEach(lemma => {
    if (lemma.Anno) anniSet.add(lemma.Anno);
  });
  return Array.from(anniSet).sort();
}
