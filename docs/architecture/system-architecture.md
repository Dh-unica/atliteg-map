---
status: "[OPERATIVO]"
last-updated: 2026-06-14
owner: Tech Lead
---

# Architettura Sistema ATLITEG

**SINGLE SOURCE OF TRUTH** per l'architettura del progetto. Tutti i documenti tecnici rinviano qui.

## Panoramica

ATLITEG è una **SPA statica** (Static Site Generation + Client-side rendering) che visualizza dati storici di linguistica gastronomica italiana. Non ha backend API — tutti i dati sono pre-processati in JSON statici e serviti tramite Nginx.

```
┌─────────────────────────────────────────────────────┐
│ Nginx (porta 9000)                                  │
│ └─ Serve /out/ (static export)                     │
│    └─ Next.js build output (HTML + JS + CSS)       │
└─────────────────────────────────────────────────────┘
          ↓ (browser carica app)
┌─────────────────────────────────────────────────────┐
│ React 19 + Next.js 16 (App Router)                 │
│ │                                                   │
│ ├─ Data Loading: CSV → JSON in /public/data/      │
│ ├─ State: React Context (AppContext)               │
│ ├─ Filtering: useFilteredData hook (memoized)      │
│ └─ UI: Leaflet map + Radix UI components           │
└─────────────────────────────────────────────────────┘
```

## Stack Tecnologico (Attuale)

### Runtime
- **Next.js 16.0**: React meta-framework (App Router, Turbopack)
- **React 19.2**: UI library con hooks moderni
- **TypeScript 5**: Type safety assoluto
- **Tailwind CSS 3.4**: Utility-first styling
- **Radix UI 2.x**: Accessible headless components

### Mappa & Visualizzazione
- **Leaflet 1.9**: Mappa interattiva (no Mapbox, no Google Maps)
- **React-Leaflet 5.0**: React bindings per Leaflet
- **Leaflet.MarkerCluster 1.5**: Clustering automatico marker
- **GeoJSON**: Poligoni aree geografiche (file statico in `/public/data/`)

### Data Processing
- **PapaParse 5.5**: CSV parser client-side (backup fallback)
- **Node.js preprocessing**: `scripts/preprocess-data.js` (CSV → JSON)

### DevOps
- **Docker**: Multi-stage build (Node builder + Nginx)
- **Nginx**: Web server, SPA routing, health checks
- **GitHub Actions**: Self-hosted runner (deploy automatico su master)

### No Backend
- ❌ Node.js backend API
- ❌ Database (PostgreSQL, MongoDB, etc.)
- ❌ Authentication/Authorization
- ✅ Static data files in `/public/data/`
- ✅ Client-side filtering e state management

## Architettura Applicazione

```
┌─────────────────────────────────────────────────────────────┐
│                      App Component                           │
│                    (AppProvider wrap)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼──────┐    ┌──────▼─────────┐
            │   Context    │    │  Data Loading  │
            │   (Global    │    │  (useDataLoader)│
            │    State)    │    │                │
            └───────┬──────┘    └──────┬─────────┘
                    │                   │
        ┌───────────┴───────────────────┴───────────┐
        │                                           │
   ┌────▼────┐                              ┌──────▼──────┐
   │ Filters │                              │  Filtered   │
   │ (Multi- │                              │    Data     │
   │ Select) │                              │ (useFiltered│
   └────┬────┘                              │    Data)    │
        │                                   └──────┬──────┘
        │                                          │
        └──────────────┬───────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐            ┌───────▼────────┐
│   Components   │            │   Components   │
│   - Header     │            │   - Timeline   │
│   - SearchBar  │            │   - Index      │
│   - Map        │            │   - Details    │
│   - Metrics    │            │                │
└────────────────┘            └────────────────┘
```

## Struttura Dati

### Lemma Interface

```typescript
interface Lemma {
  IdLemma: number;           // ID univoco
  Lemma: string;             // Forma base normalizzata
  Forma: string;             // Variante attestata
  CollGeografica: string;    // Località
  Anno: number;              // Anno attestazione
  Periodo: string;           // Periodo temporale
  Categoria: string;         // Categorie multiple (CSV)
  Frequenza: number;         // Frequenza attestazione
  URL: string;               // Link risorsa esterna
  IdAmbito?: string;         // ID area geografica GeoJSON
  lat?: number;              // Latitudine (se puntuale)
  lng?: number;              // Longitudine (se puntuale)
}
```

### Filter State

```typescript
interface FilterState {
  categorie: string[];       // Filtro categorie (multi)
  periodi: string[];         // Filtro periodi (multi)
  searchQuery: string;       // Query ricerca
  selectedLetter: string | null;  // Lettera alfabeto
  selectedYear: number | null;    // Anno timeline
  selectedLemma: Lemma | null;    // Lemma selezionato
}
```

## Flusso Dati (Data Flow)

```
1. Build Time (CI/CD)
   └─ CSV in /data/
      └─ scripts/preprocess-data.js (Node.js)
      └─ Genera /public/data/lemmi.json + geojson.json
      └─ Next.js build → /out/ (static)

2. Deploy Time
   └─ Docker: Copy /out/ → Nginx /usr/share/nginx/html
   └─ Nginx: Serve on port 9000

3. Runtime (Client Browser)
   └─ App loads /out/page.html
   └─ React hydrates + loads data:
      ├─ Fetch /data/lemmi.json (5MB+, cached)
      ├─ Fetch /data/geojson.json (geoboundaries)
      └─ Parse in browser (PapaParse fallback)
   └─ AppContext stores global state
   └─ useFilteredData memoizes filtered results
   └─ Components render Leaflet map + UI
```

## Gestione Stato

### Context API Structure

```typescript
AppContext
├── filters: FilterState
├── setCategorie(categorie: string[])
├── setPeriodi(periodi: string[])
├── setSearchQuery(query: string)
├── setSelectedLetter(letter: string | null)
├── setSelectedYear(year: number | null)
├── setSelectedLemma(lemma: Lemma | null)
└── resetFilters()
```

### Flusso Dati

1. **Caricamento Dati** (`useDataLoader`)
   - Fetch CSV da `/data/Lemmi_forme_atliteg_updated.csv`
   - Fetch GeoJSON da `/data/Ambiti geolinguistici newline.json`
   - Parsing con PapaParse e normalizzazione
   - Mapping coordinate per aree geografiche (IdAmbito)

2. **Filtraggio Dati** (`useFilteredData`)
   - Input: lemmas completi + FilterState
   - Filtra per categorie selezionate (multi-match)
   - Filtra per periodi selezionati
   - Filtra per query ricerca (Lemma o Forma)
   - Filtra per lettera iniziale
   - Filtra per anno selezionato
   - Output: lemmas filtrati

3. **Calcolo Metriche** (`useMetrics`)
   - Input: lemmas filtrati
   - Calcola: unique località, unique lemmi, anni con attestazioni, totale attestazioni
   - Output: oggetto metriche

### Sincronizzazione Componenti

Tutti i componenti si aggiornano in tempo reale quando cambia lo stato globale:

```
Filtri cambiati → Context aggiornato → useFilteredData ricalcola 
  → Tutti i componenti che usano filteredLemmas si re-renderizzano
```

## Componenti Principali

### Header
- **Responsabilità**: Branding e informazioni progetto
- **Props**: Nessuna
- **Stato**: Stateless

### Filters
- **Responsabilità**: Filtri globali categoria e periodo
- **Props**: availableCategories, availablePeriods, selectedCategories, selectedPeriods, callbacks
- **Stato**: Controllato da Context
- **Features**: Multi-select, badge attivi, reset

### SearchBar
- **Responsabilità**: Ricerca autocompletante
- **Props**: lemmas, onSelect
- **Stato**: Locale per query, debounce 300ms
- **Features**: Suggerimenti, navigazione tastiera

### GeographicalMap
- **Responsabilità**: Visualizzazione mappa interattiva
- **Props**: lemmas (filtrati), selectedLemma, onLemmaSelect
- **Stato**: Locale per istanza mappa Leaflet
- **Features**: 
  - Marker per località puntuali
  - Poligoni per aree geografiche (IdAmbito)
  - Popup con dettagli
  - Clustering per performance
  - Conteggio località/lemmi

### Timeline
- **Responsabilità**: Navigazione temporale
- **Props**: lemmas (filtrati), selectedLemma, onLemmaSelect
- **Stato**: Locale per scroll, Context per selectedYear
- **Features**:
  - Range anni dinamico dal dataset
  - Click anno filtra dashboard
  - Tooltip con dettagli
  - Scroll orizzontale con frecce
  - Evidenziazione anni con/senza attestazioni

### AlphabeticalIndex
- **Responsabilità**: Indice alfabetico navigabile
- **Props**: lemmas (filtrati), onLemmaSelect
- **Stato**: Context per selectedLetter
- **Features**:
  - Lettere cliccabili con conteggio
  - Filtra per lettera iniziale
  - Raggruppamento lemmi con forme
  - Scroll virtualizzato

### LemmaDetail
- **Responsabilità**: Pannello dettagli lemma
- **Props**: lemma (selezionato), allLemmas (filtrati)
- **Stato**: Stateless
- **Features**:
  - Stato vuoto quando nessuna selezione
  - Categorie multiple come badge
  - Tutte le attestazioni ordinate
  - Link esterno
  - Scroll area

### MetricsSummary
- **Responsabilità**: Visualizzazione metriche
- **Props**: metrics (calcolate)
- **Stato**: Stateless
- **Features**:
  - Conteggi località, lemmi, anni, attestazioni
  - Icone informative
  - Aggiornamento real-time

## Custom Hooks

### useDataLoader
```typescript
function useDataLoader(): {
  lemmas: Lemma[];
  geoAreas: GeoArea[];
  isLoading: boolean;
  error: string | null;
}
```
- Carica dati CSV e GeoJSON
- Gestisce stato loading/error
- Memoizza risultati

### useFilteredData
```typescript
function useFilteredData(
  lemmas: Lemma[], 
  filters: FilterState
): Lemma[]
```
- Applica tutti i filtri in sequenza
- Memoizza risultato per performance
- Supporta filtri multipli combinati

### useMetrics
```typescript
function useMetrics(lemmas: Lemma[]): {
  localitaCount: number;
  lemmiCount: number;
  anniCount: number;
  attestazioniCount: number;
}
```
- Calcola metriche da lemmi filtrati
- Memoizza per evitare ricalcoli

### useDebounce
```typescript
function useDebounce<T>(value: T, delay: number): T
```
- Debouncing per ricerca (300ms)
- Previene chiamate eccessive

## Servizi

### dataLoader.ts
```typescript
loadLemmasCSV(path: string): Promise<Lemma[]>
loadGeoAreasJSON(path: string): Promise<GeoArea[]>
parseCategories(categoriaString: string): string[]
extractUniqueCategories(lemmas: Lemma[]): string[]
extractUniquePeriods(lemmas: Lemma[]): string[]
```

## Utils

### categoryParser.ts
- Parsing categorie multiple da CSV
- Verifica appartenenza categoria
- Normalizzazione nomi categorie

### dataTransformers.ts
- Normalizzazione dati lemmi
- Mapping lemmi → GeoAreas (IdAmbito)
- Calcolo centroide poligoni
- Raggruppamento per località/anno
- Estrazione range anni

### validators.ts
- Validazione lemmi e GeoAreas
- Validazione coordinate
- Validazione formati CSV/GeoJSON

## Performance Optimization

### React Level
- **React.memo**: Componenti pesanti (Map, Timeline)
- **useMemo**: Calcoli costosi (filteredData, metrics, grouping)
- **useCallback**: Funzioni passate come props
- **Code Splitting**: React.lazy per componenti pesanti

### Data Level
- **Debouncing**: Ricerca con 300ms delay
- **Virtualizzazione**: react-window per liste lunghe (Index)
- **Marker Clustering**: Leaflet.markercluster per mappa

### Build Level
- **Tree Shaking**: Vite automatico
- **Minification**: Production build
- **Gzip**: Nginx compression
- **Code Splitting**: Dynamic imports

### Bundle Size
- Target: < 500KB gzipped
- Attuale: ~155KB gzipped (✓)

## Accessibilità (WCAG 2.1 AA)

### Implementazioni
- **Navigazione tastiera**: Tab, Shift+Tab, Enter, Escape, Frecce
- **ARIA labels**: Su tutti i componenti interattivi
- **ARIA roles**: List, listitem, region, etc.
- **Focus visibile**: Outline personalizzato
- **Contrasto colori**: 4.5:1 per testo, 3:1 per UI
- **Screen reader**: Annunci con aria-live regions
- **Skip links**: Navigazione rapida (planned)

### Testing
- axe DevTools
- Lighthouse (target: 95+)
- Test manuali con screen reader

## Deployment

### Docker Multi-Stage Build

```dockerfile
Stage 1: Builder (Node 20)
  - npm ci --legacy-peer-deps
  - npm run build
  
Stage 2: Production (Nginx Alpine)
  - Copia build artifacts
  - Copia dati CSV/GeoJSON
  - Espone porta 9000
  - Health check
```

### Nginx Configuration
- Porta: 9000
- Gzip compression
- Cache headers per static assets
- SPA fallback routing
- Security headers

### Volume Mapping
```yaml
volumes:
  - ./data:/usr/share/nginx/html/data:ro
```
Permette aggiornamento dati senza rebuild

## Sviluppo

### Dev Server
```bash
npm run dev  # Vite dev server su porta 5173
```

### Build
```bash
npm run build       # Build produzione
npm run build:prod  # Build ottimizzata
npm run preview     # Preview build locale
```

### Docker
```bash
docker-compose up -d         # Build & run
docker-compose logs -f       # View logs
docker-compose down          # Stop
docker-compose up -d --build # Rebuild
```

## Testing (Planned)

### Unit Tests
- Custom hooks (useFilteredData, useMetrics, useDebounce)
- Utils (categoryParser, dataTransformers, validators)
- Services (dataLoader)

### Component Tests
- Filters, SearchBar, Header (props/stati diversi)

### E2E Tests
- Filtraggio completo
- Ricerca → selezione → dettaglio
- Timeline → click anno → sincronizzazione
- Index → click lettera → filtro
- Reset filtri

### Performance Tests
- Bundle size < 500KB
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

## Estensioni Future

### Funzionalità
- Export dati filtrati (CSV/JSON)
- Condivisione URL con filtri (query params)
- Visualizzazioni aggiuntive (grafici, statistiche)
- Confronto periodi/località

### Technical
- Backend API per dataset grandi
- PWA capabilities (offline, caching)
- i18n (multilingua)
- Dark mode

### Performance
- Virtual scrolling per tutte le liste
- Web Workers per parsing CSV
- Service Worker per caching dati

## Riferimenti

- [Requisiti Funzionali](../requisiti.md)
- [Dataset Specification](DATASET_SPECIFICATION.md)
- [Implementation Plan](../plan/feature-lemmario-dashboard-1.md)
- [README](../Lemmario_figma/README.md)
