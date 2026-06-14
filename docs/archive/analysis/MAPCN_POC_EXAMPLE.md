# Proof of Concept: Mappa Semplificata con mapcn

**Status:** Prototipo Concettuale (NON per produzione)  
**Scopo:** Dimostrare come potrebbe apparire una versione semplificata con mapcn  
**Riferimento:** `MAPCN_INTEGRATION_ANALYSIS.md`, `MAPCN_CODE_COMPARISON.md`

---

## Premessa Importante

Questo documento contiene un **esempio concettuale** di come potrebbe essere implementata la mappa AtLiTeG usando mapcn. 

⚠️ **NON È UNA RACCOMANDAZIONE DI IMPLEMENTAZIONE** ⚠️

Come dettagliato nell'analisi principale, si raccomanda di **mantenere Leaflet** per le ragioni documentate. Questo POC serve solo per:
1. Comprendere meglio le differenze architetturali
2. Fornire base per futura valutazione (se mapcn matura)
3. Training tecnico per team su MapLibre

---

## Setup Progetto

### 1. Installazione Dipendenze

```bash
cd lemmario-dashboard

# Installa mapcn components (copiati localmente, non NPM package)
# Crea directory per mapcn
mkdir -p components/mapcn

# Copia file da mapcn repository
# NOTA: In produzione andrebbe usato come package o git submodule
cp /path/to/mapcn/src/registry/map.tsx components/mapcn/

# Installa dipendenze MapLibre
npm install maplibre-gl@5.15.0
npm install --save-dev @types/maplibre-gl

# OPZIONALE: Upgrade Tailwind v4 (BREAKING CHANGE)
# npm install tailwindcss@4 @tailwindcss/postcss@4
```

### 2. Configurazione Tailwind (se upgrade v4)

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### 3. Variabili CSS per mapcn

```css
/* app/globals.css - Aggiungi variabili shadcn-compatibili */

@layer base {
  :root {
    /* AtLiTeG colors mapped to shadcn variables */
    --background: 0 0% 100%; /* #FFFFFF */
    --foreground: 222 47% 11%; /* #1F2937 */
    
    --primary: 208 100% 35%; /* #0B5FA5 */
    --primary-foreground: 0 0% 100%;
    
    --secondary: 217 91% 60%; /* #3B82F6 */
    --secondary-foreground: 0 0% 100%;
    
    --muted: 214 32% 91%; /* #F6F8FB */
    --muted-foreground: 215 16% 47%;
    
    --accent: 217 91% 60%;
    --accent-foreground: 0 0% 100%;
    
    --border: 214 32% 91%; /* #E5E7EB */
    --input: 214 32% 91%;
    --ring: 217 91% 60%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    
    --radius: 0.5rem; /* 8px */
  }
  
  .dark {
    /* Se implementato dark mode */
    --background: 222 47% 11%;
    --foreground: 0 0% 100%;
    /* ... altre variabili dark */
  }
}
```

---

## Componente Mappa Semplificato

### File: `components/GeographicalMapMapcn.tsx`

```typescript
'use client';

import { useMemo, useState } from 'react';
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls, useMap } from '@/components/mapcn/map';
import { useApp } from '@/context/AppContext';
import { useHighlight } from '@/context/HighlightContext';
import type { Lemma } from '@/types/lemma';

/**
 * VERSIONE SEMPLIFICATA con mapcn
 * 
 * FUNZIONALITÀ IMPLEMENTATE:
 * - Marker individuali per località puntuali
 * - Popup con lemmi raggruppati
 * - Controlli mappa styled
 * 
 * FUNZIONALITÀ RIDOTTE rispetto a Leaflet:
 * - NO clustering con aggregazione frequenze (solo marker individuali)
 * - NO GeoJSON polygons (rimosso per semplicità POC)
 * - NO highlighting dinamico icone (solo visual feedback)
 * - NO animazioni flyTo automatiche
 * - NO confini regionali
 */

// Componente Marker Custom con stile AtLiTeG
function AtlitegMarker({ 
  frequency, 
  highlighted = false 
}: { 
  frequency: number; 
  highlighted?: boolean;
}) {
  // Determina colore basato su frequenza (come versione Leaflet)
  let bgColor = 'bg-blue-500';
  let borderColor = 'border-blue-600';
  
  if (frequency > 100) {
    bgColor = 'bg-red-500';
    borderColor = 'border-red-600';
  } else if (frequency > 20) {
    bgColor = 'bg-orange-500';
    borderColor = 'border-orange-600';
  }
  
  // Highlighting overlay
  const highlightClass = highlighted ? 'ring-4 ring-blue-300' : '';
  
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow quando highlighted */}
      {highlighted && (
        <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-pulse scale-150" />
      )}
      
      {/* Marker circle */}
      <div className={`
        relative w-10 h-10 rounded-full border-2 ${borderColor} ${bgColor} ${highlightClass}
        flex items-center justify-center text-white font-semibold text-sm
        shadow-lg transition-transform hover:scale-110 cursor-pointer
      `}>
        {frequency}
      </div>
    </div>
  );
}

// Componente Popup Semplificato
function LemmaPopup({ 
  lemmi, 
  locationName,
  onClose 
}: { 
  lemmi: Lemma[]; 
  locationName: string;
  onClose: () => void;
}) {
  // Raggruppa per Lemma (come versione Leaflet)
  const lemmaGroups = useMemo(() => {
    const groups = new Map<string, Lemma[]>();
    lemmi.forEach(lemma => {
      if (!groups.has(lemma.Lemma)) {
        groups.set(lemma.Lemma, []);
      }
      groups.get(lemma.Lemma)!.push(lemma);
    });
    return groups;
  }, [lemmi]);
  
  return (
    <div className="w-[600px] max-h-[400px] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">{locationName}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
          aria-label="Chiudi"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Lemmi List */}
      <div className="p-4 space-y-4">
        {Array.from(lemmaGroups.entries()).map(([lemma, forms]) => (
          <div key={lemma} className="border-l-4 border-primary pl-3">
            <h4 className="font-semibold text-primary text-base mb-2">{lemma}</h4>
            <div className="space-y-2">
              {forms.map((form, idx) => (
                <div key={idx} className="text-sm text-gray-600">
                  <span className="font-medium">{form.Forma}</span>
                  {form.Anno && (
                    <span className="text-gray-400 ml-2">({form.Anno})</span>
                  )}
                  {form.Frequenza && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      freq: {form.Frequenza}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente GeoJSON Layer Helper (per poligoni - versione base)
function GeoJSONPolygons({ polygons }: { polygons: any[] }) {
  const { map, isLoaded } = useMap();
  
  // NOTA: Implementazione complessa richiederebbe useEffect con MapLibre API
  // Per POC, omesso. Vedere MAPCN_CODE_COMPARISON.md sezione 5.
  
  return null;
}

export function GeographicalMapMapcn() {
  const { filteredLemmi } = useApp();
  const { highlightState } = useHighlight();
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  
  // Prepara marker raggruppati per coordinate
  const markers = useMemo(() => {
    const coordMap = new Map<string, { lat: number; lng: number; lemmi: Lemma[] }>();
    
    filteredLemmi.forEach(lemma => {
      // Solo località con coordinate valide
      if (lemma.Latitudine && lemma.Longitudine &&
          lemma.Latitudine !== '#N/A' && lemma.Longitudine !== '#N/A') {
        const lat = parseFloat(lemma.Latitudine.replace(',', '.'));
        const lng = parseFloat(lemma.Longitudine.replace(',', '.'));
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
          
          if (!coordMap.has(key)) {
            coordMap.set(key, { lat, lng, lemmi: [] });
          }
          coordMap.get(key)!.lemmi.push(lemma);
        }
      }
    });
    
    return Array.from(coordMap.values());
  }, [filteredLemmi]);
  
  return (
    <div className="h-[580px] w-full rounded-lg overflow-hidden shadow-lg">
      <Map 
        center={[12.5, 40.5]} // lng, lat (MapLibre format)
        zoom={6}
        scrollZoom={true}
        // theme="light" // Auto-detect, o specificare
      >
        {/* Marker puntuali */}
        {markers.map((marker, idx) => {
          const key = `${marker.lat}-${marker.lng}`;
          
          // Calcola frequenza totale
          const totalFrequency = marker.lemmi.reduce((sum, l) => 
            sum + (parseInt(l.Frequenza) || 0), 0
          );
          
          // Check se highlighted
          const isHighlighted = marker.lemmi.some(l => {
            const uniqueId = `${l.IdLemma}-${l.Forma}-${l.CollGeografica}-${l.Anno}`;
            return highlightState.highlightedLemmaIds.has(uniqueId);
          });
          
          const locationName = marker.lemmi[0]?.CollGeografica || 'Località';
          
          return (
            <MapMarker
              key={key}
              longitude={marker.lng}
              latitude={marker.lat}
              onClick={() => setSelectedMarker(key)}
            >
              <MarkerContent>
                <AtlitegMarker 
                  frequency={totalFrequency}
                  highlighted={isHighlighted}
                />
              </MarkerContent>
              
              <MarkerPopup closeButton={false}>
                <LemmaPopup 
                  lemmi={marker.lemmi}
                  locationName={locationName}
                  onClose={() => setSelectedMarker(null)}
                />
              </MarkerPopup>
            </MapMarker>
          );
        })}
        
        {/* Controlli mappa styled */}
        <MapControls
          position="bottom-right"
          showZoom={true}
          showCompass={false}
          showLocate={false}
          showFullscreen={true}
        />
      </Map>
    </div>
  );
}
```

---

## Uso nel Page Component

### File: `app/page.tsx` (modifica ipotetica)

```typescript
'use client';

import { GeographicalMap } from '@/components/GeographicalMap'; // Leaflet originale
// import { GeographicalMapMapcn } from '@/components/GeographicalMapMapcn'; // Versione mapcn

export default function HomePage() {
  // Feature flag per A/B testing (esempio)
  const useMapcnVersion = false; // process.env.NEXT_PUBLIC_USE_MAPCN === 'true'
  
  return (
    <div className="container mx-auto p-4">
      <h1>AtLiTeG Map</h1>
      
      {/* Conditional rendering per testing */}
      {useMapcnVersion ? (
        <GeographicalMapMapcn />
      ) : (
        <GeographicalMap />
      )}
    </div>
  );
}
```

---

## Differenze Implementative - Riassunto

### Funzionalità Mantenute ✅

1. **Marker per località puntuali**
   - Frequenza visualizzata
   - Colore basato su range frequenza
   - Hover effects

2. **Popup con lemmi raggruppati**
   - Stesso pattern raggruppamento per Lemma
   - Visualizzazione forme, anni, frequenze

3. **Highlighting visivo**
   - Ring/pulse effect per marker evidenziati
   - Reattivo a highlightState

4. **Controlli mappa**
   - Zoom, fullscreen styled con Tailwind

### Funzionalità Rimosse/Semplificate ⚠️

1. **Clustering con aggregazione**
   - ❌ Rimosso: troppo complesso replicare esattamente
   - **Impatto:** Con molti marker (>100), mappa sovraffollata
   - **Workaround:** Filtering più aggressivo o zoom minimo

2. **GeoJSON Polygons**
   - ⚠️ Non implementato in POC (richiederebbe MapLibre API diretta)
   - **Impatto:** Mancano visualizzazioni aree dialettali e regioni
   - **Workaround:** Implementabile ma complesso (vedi CODE_COMPARISON)

3. **Animazioni FlyTo automatiche**
   - ⚠️ Non implementato (richiederebbe useMap hook + logica custom)
   - **Impatto:** Navigazione meno fluida
   - **Workaround:** Implementabile con API MapLibre diretta

4. **Update dinamico icone highlight**
   - ⚠️ Semplificato: usa re-render componenti
   - **Impatto:** Potenziali problemi performance con >200 marker
   - **Workaround:** Usare MapLibre layer paint properties (advanced)

---

## Performance Considerations

### Bundle Size Impact

```
PRIMA (Leaflet):
- leaflet: 140 KB
- react-leaflet: 15 KB
- markercluster: 30 KB
Total: ~185 KB

DOPO (mapcn):
- maplibre-gl: 280 KB
- mapcn components: 20 KB
Total: ~300 KB

Incremento: +115 KB (+62%)
```

### Runtime Performance

**Leaflet (DOM-based):**
- ✅ Ottimo per <500 marker
- ⚠️ Degrada con >1000 marker
- ✅ Clustering efficiente

**MapLibre (WebGL):**
- ✅ Eccellente per >1000 marker
- ✅ Animazioni GPU-accelerated
- ⚠️ Overhead iniziale rendering
- ⚠️ Problemi su GPU integrate vecchie

**Conclusione:** Per dataset AtLiTeG (~200-500 marker attualmente), differenza performance marginale.

---

## Testing Plan (se implementato)

### 1. Unit Tests

```typescript
// __tests__/GeographicalMapMapcn.test.tsx
import { render, screen } from '@testing-library/react';
import { GeographicalMapMapcn } from '@/components/GeographicalMapMapcn';

describe('GeographicalMapMapcn', () => {
  it('renders map container', () => {
    render(<GeographicalMapMapcn />);
    // Test basic rendering
  });
  
  it('displays markers for valid coordinates', () => {
    // Mock filteredLemmi con coordinate
    // Verifica creazione marker
  });
  
  it('calculates total frequency correctly', () => {
    // Test logica aggregazione
  });
});
```

### 2. Visual Regression Tests

```bash
# Con Playwright o Chromatic
npm run test:visual -- GeographicalMapMapcn
```

### 3. Performance Tests

```typescript
// Benchmark rendering time
const start = performance.now();
// Render map with 500 markers
const end = performance.now();
console.log(`Render time: ${end - start}ms`);

// Target: <100ms initial render
```

### 4. Cross-Browser Tests

- Chrome/Edge (WebGL modern)
- Firefox (WebGL)
- Safari (potenziali problemi WebGL)
- Mobile Safari/Chrome

---

## Migration Checklist (Se deciso di procedere)

### Fase Preparazione
- [ ] Backup codebase attuale
- [ ] Setup branch separato `feature/mapcn-migration`
- [ ] Installare dipendenze mapcn + MapLibre
- [ ] Configurare variabili CSS shadcn-like
- [ ] Setup feature flag per A/B testing

### Fase Sviluppo
- [ ] Implementare GeographicalMapMapcn base
- [ ] Migrare marker individuali
- [ ] Implementare popup
- [ ] Aggiungere controlli mappa
- [ ] Implementare highlighting (versione semplificata)
- [ ] ⚠️ Valutare se clustering necessario (COMPLESSO)
- [ ] ⚠️ Implementare GeoJSON polygons se critico

### Fase Testing
- [ ] Unit tests per nuovi componenti
- [ ] Visual regression tests
- [ ] Performance benchmarks (vs Leaflet)
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Accessibility audit

### Fase Deploy
- [ ] Deploy staging con feature flag
- [ ] A/B test con 10% utenti
- [ ] Raccogliere metriche performance
- [ ] Raccogliere feedback utenti
- [ ] Se positivo: gradual rollout 25% → 50% → 100%
- [ ] Monitorare errori in produzione

### Fase Cleanup
- [ ] Rimuovere codice Leaflet vecchio
- [ ] Rimuovere dipendenze Leaflet
- [ ] Aggiornare documentazione
- [ ] Training team su mapcn

---

## Rollback Plan

**Se mapcn causa problemi in produzione:**

1. **Immediato (< 5 min):**
   ```javascript
   // Feature flag toggle
   process.env.NEXT_PUBLIC_USE_MAPCN = 'false'
   ```

2. **Breve termine (< 1 ora):**
   - Revert commit migrazione
   - Redeploy versione Leaflet

3. **Medio termine (< 1 giorno):**
   - Fix bug identificati
   - Re-test
   - Re-deploy

**Criterio Rollback:**
- Error rate > 5%
- Performance degradation > 20%
- Feedback negativo utenti > 30%

---

## Conclusioni POC

### Cosa Funziona Bene ✅

1. **API dichiarativa mapcn** è piacevole da usare
2. **Marker individuali** ben supportati
3. **Popup React** integrazione ottima
4. **Styling Tailwind** coerente

### Problemi Identificati ❌

1. **Clustering** limitato, non replica funzionalità attuale
2. **GeoJSON** richiede low-level API, non semplificato da mapcn
3. **Bundle size** aumentato (+60%)
4. **Learning curve** per team

### Raccomandazione Finale

**Questo POC conferma l'analisi principale:**

> mapcn è una libreria valida ma **non adatta** per AtLiTeG Map nella sua forma attuale.

**Mantenere Leaflet** e investire in:
1. Miglioramenti styling esistente
2. Ottimizzazioni performance
3. Eventuale dark mode via tile provider

**Riconsiderare mapcn solo se:**
- Progetto major refactoring (AtLiTeG 2.0)
- mapcn evolve e aggiunge clustering avanzato
- Requisiti 3D/WebGL diventano critici

---

## Risorse Aggiuntive

### Documentazione
- [MapLibre GL JS API](https://maplibre.org/maplibre-gl-js/docs/)
- [mapcn Examples](https://mapcn.dev/docs/basic-map)
- [Tailwind CSS v4 Migration](https://tailwindcss.com/docs/upgrade-guide)

### Alternative Esplorate
- React-Map-GL (Uber): Più maturo, simile a mapcn
- Deck.gl: Advanced visualizations, overkill per use case
- Mapbox GL: Costoso, closed-source

---

**Disclaimer:** Questo POC è un esercizio esplorativo. Non implementare in produzione senza completa valutazione rischi e approvazione stakeholder.
