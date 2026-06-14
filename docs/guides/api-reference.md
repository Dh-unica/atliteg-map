---
status: "[OPERATIVO]"
last-updated: 2026-06-14
owner: Tech Lead
---

# API Reference — ATLITEG

⚠️ **IMPORTANT**: ATLITEG **non ha API REST esterna**. È una SPA statica che carica dati pre-processati.

Questa è una **referenza rapida** per gli internal hooks/services. Per dettagli completi → [system-architecture.md](../architecture/system-architecture.md).

## Sommario Dati

### Cosa NON c'è
- ❌ API REST (`/api/...`)
- ❌ Backend Node.js/Express/Python
- ❌ Database queries
- ❌ Authentication endpoints
- ❌ Real-time updates

### Cosa C'è
- ✅ Static JSON files in `/public/data/`
- ✅ Client-side React hooks
- ✅ Leaflet maps + interactions
- ✅ CSV parser (PapaParse) as fallback

## Indice

- [Custom Hooks](#custom-hooks)
- [Services](#services)
- [Utilities](#utilities)
- [Context API](#context-api)
- [Type Definitions](#type-definitions)
- [Data Flow](#data-flow)

---

## Custom Hooks

### useDataLoader

**Path**: `src/hooks/useDataLoader.ts`

**Descrizione**: Hook per il caricamento e parsing dei dataset CSV e GeoJSON all'avvio dell'applicazione.

**Firma**:
```typescript
function useDataLoader(): {
  lemmas: Lemma[];
  geoAreas: GeoArea[];
  isLoading: boolean;
  error: string | null;
}
```

**Parametri**: Nessuno

**Ritorna**:
| Proprietà | Tipo | Descrizione |
|-----------|------|-------------|
| `lemmas` | `Lemma[]` | Array di tutti i lemmi caricati dal CSV |
| `geoAreas` | `GeoArea[]` | Array di aree geografiche dal GeoJSON |
| `isLoading` | `boolean` | `true` durante il caricamento |
| `error` | `string \| null` | Messaggio errore se caricamento fallisce |

**Comportamento**:
1. All'mount del componente, avvia fetch paralleli di CSV e GeoJSON
2. Parsing CSV con PapaParse
3. Parsing GeoJSON nativo
4. Validazione dati con validators
5. Mapping lemmi → geoAreas via IdAmbito
6. Gestione stati loading/error/success

**Esempio Uso**:
```typescript
function App() {
  const { lemmas, geoAreas, isLoading, error } = useDataLoader();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return <Dashboard lemmas={lemmas} geoAreas={geoAreas} />;
}
```

**Dependencies**: `dataLoader.ts`, `validators.ts`, `dataTransformers.ts`

**Notes**: 
- Usa `useMemo` per cachare risultati parsati
- Cleanup function per abort fetch su unmount
- Error boundaries consigliati per gestione errori fatali

---

### useFilteredData

**Path**: `src/hooks/useFilteredData.ts`

**Descrizione**: Hook per applicare filtri multipli combinati ai lemmi, con memoizzazione per performance.

**Firma**:
```typescript
function useFilteredData(
  lemmas: Lemma[], 
  filters: FilterState
): Lemma[]
```

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `lemmas` | `Lemma[]` | Array completo di lemmi |
| `filters` | `FilterState` | Stato filtri globale dal Context |

**Ritorna**:
`Lemma[]` - Array di lemmi filtrati

**Filtri Applicati** (in sequenza):
1. **Categorie**: Filtra per categorie selezionate (multi-match con `lemmaHasAnyCategory`)
2. **Periodi**: Filtra per periodi selezionati
3. **Search Query**: Filtra per Lemma o Forma contenente query (case-insensitive)
4. **Selected Letter**: Filtra per lettera iniziale del Lemma
5. **Selected Year**: Filtra per anno attestazione

**Comportamento**:
- Se nessun filtro attivo, ritorna array originale
- Ogni filtro è opzionale (skippato se non attivo)
- Memoizzazione con `useMemo` (dipendenze: lemmas, filters)

**Esempio Uso**:
```typescript
function Dashboard() {
  const { lemmas } = useDataLoader();
  const { filters } = useAppContext();
  const filteredLemmas = useFilteredData(lemmas, filters);

  return (
    <>
      <MetricsSummary lemmas={filteredLemmas} />
      <GeographicalMap lemmas={filteredLemmas} />
    </>
  );
}
```

**Performance**: O(n) per ogni filtro, totale O(n × k) dove k = numero filtri attivi

**Dependencies**: `categoryParser.ts` per `lemmaHasAnyCategory`

---

### useMetrics

**Path**: `src/hooks/useMetrics.ts`

**Descrizione**: Hook per calcolare metriche riepilogative dai lemmi filtrati.

**Firma**:
```typescript
function useMetrics(lemmas: Lemma[]): {
  localitaCount: number;
  lemmiCount: number;
  anniCount: number;
  attestazioniCount: number;
}
```

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `lemmas` | `Lemma[]` | Array di lemmi (tipicamente filtrati) |

**Ritorna**:
| Proprietà | Tipo | Descrizione |
|-----------|------|-------------|
| `localitaCount` | `number` | Numero località uniche (campo `CollGeografica`) |
| `lemmiCount` | `number` | Numero lemmi unici (campo `Lemma`) |
| `anniCount` | `number` | Numero anni unici con attestazioni (campo `Anno`) |
| `attestazioniCount` | `number` | Totale attestazioni (length array) |

**Comportamento**:
- Usa `Set` per conteggi unique
- Memoizzazione con `useMemo` (dipendenza: lemmas)
- Performance O(n)

**Esempio Uso**:
```typescript
function MetricsSummary({ lemmas }: { lemmas: Lemma[] }) {
  const { localitaCount, lemmiCount, anniCount, attestazioniCount } = useMetrics(lemmas);

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <MapPin className="h-4 w-4" />
        <p>{localitaCount} Località</p>
      </Card>
      {/* ... altre metriche */}
    </div>
  );
}
```

---

### useDebounce

**Path**: `src/hooks/useDebounce.ts`

**Descrizione**: Hook generico per debouncing di valori (es. input ricerca).

**Firma**:
```typescript
function useDebounce<T>(value: T, delay: number): T
```

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `value` | `T` | Valore da debounceare (generico) |
| `delay` | `number` | Ritardo in millisecondi |

**Ritorna**: `T` - Valore debouncato (aggiornato dopo delay)

**Comportamento**:
- Ritarda aggiornamento valore per `delay` millisecondi
- Resetta timer se valore cambia prima della scadenza
- Cleanup timer su unmount

**Esempio Uso**:
```typescript
function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Effettua ricerca solo dopo 300ms di inattività
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <Input onChange={(e) => setSearchQuery(e.target.value)} />;
}
```

**Performance**: Previene chiamate eccessive durante digitazione veloce

---

## Services

### dataLoader.ts

**Path**: `src/services/dataLoader.ts`

**Descrizione**: Service layer per caricamento e parsing dataset CSV e GeoJSON.

#### Funzioni Esportate

##### loadLemmasCSV

**Firma**:
```typescript
async function loadLemmasCSV(path: string): Promise<Lemma[]>
```

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `path` | `string` | Path relativo al file CSV (default: `/data/Lemmi_forme_atliteg_updated.csv`) |

**Ritorna**: `Promise<Lemma[]>` - Array di lemmi parsati

**Comportamento**:
1. Fetch del file CSV
2. Parsing con PapaParse (`header: true`, `dynamicTyping: true`)
3. Normalizzazione campi con `normalizeLemma`
4. Validazione con `isValidLemma`
5. Filtra lemmi invalidi (log warning)

**Errori**:
- `Error` se fetch fallisce
- `Error` se parsing fallisce
- Warning console per lemmi invalidi (non blocca)

**Esempio**:
```typescript
try {
  const lemmas = await loadLemmasCSV('/data/Lemmi_forme_atliteg_updated.csv');
  console.log(`Loaded ${lemmas.length} lemmas`);
} catch (error) {
  console.error('Failed to load CSV:', error);
}
```

---

##### loadGeoAreasJSON

**Firma**:
```typescript
async function loadGeoAreasJSON(path: string): Promise<GeoArea[]>
```

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `path` | `string` | Path relativo al file GeoJSON |

**Ritorna**: `Promise<GeoArea[]>` - Array di aree geografiche

**Comportamento**:
1. Fetch del file GeoJSON
2. Parsing JSON
3. Estrazione features da FeatureCollection
4. Mapping `feature.properties.IdAmbito` e `feature.geometry`
5. Validazione con `validateGeoAreas`

**Formato GeoJSON Atteso**:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "IdAmbito": "TOSCANA",
        "Nome": "Toscana"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lng, lat], ...]]
      }
    }
  ]
}
```

**Esempio**:
```typescript
const geoAreas = await loadGeoAreasJSON('/data/Ambiti geolinguistici newline.json');
```

---

##### extractUniqueCategories

**Firma**:
```typescript
function extractUniqueCategories(lemmas: Lemma[]): string[]
```

**Descrizione**: Estrae tutte le categorie uniche dal dataset, gestendo categorie multiple separate da virgola.

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `lemmas` | `Lemma[]` | Array di lemmi |

**Ritorna**: `string[]` - Array di categorie uniche, ordinate alfabeticamente

**Comportamento**:
- Usa `parseCategories` per splittare categorie multiple
- Filtra stringhe vuote
- Usa `Set` per uniqueness
- Ordina alfabeticamente

**Esempio**:
```typescript
const categories = extractUniqueCategories(lemmas);
// ["Bevande", "Carni", "Dolci", "Formaggi", ...]
```

---

##### extractUniquePeriods

**Firma**:
```typescript
function extractUniquePeriods(lemmas: Lemma[]): string[]
```

**Descrizione**: Estrae tutti i periodi unici dal dataset.

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `lemmas` | `Lemma[]` | Array di lemmi |

**Ritorna**: `string[]` - Array di periodi unici, ordinati cronologicamente

**Comportamento**:
- Estrae campo `Periodo`
- Filtra stringhe vuote
- Ordina cronologicamente (assumendo formato "YYYY-YYYY")

**Esempio**:
```typescript
const periods = extractUniquePeriods(lemmas);
// ["1300-1399", "1400-1499", "1500-1599", ...]
```

---

## Utilities

### categoryParser.ts

**Path**: `src/utils/categoryParser.ts`

#### parseCategories

**Firma**:
```typescript
function parseCategories(categoriaString: string): string[]
```

**Descrizione**: Parsing di categorie multiple da stringa CSV.

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `categoriaString` | `string` | Stringa con categorie separate da virgola (es. "Dolci, Bevande") |

**Ritorna**: `string[]` - Array di categorie trimmato

**Comportamento**:
- Split per virgola
- Trim whitespace
- Filtra stringhe vuote

**Esempio**:
```typescript
parseCategories("Dolci, Bevande, Carni");
// ["Dolci", "Bevande", "Carni"]

parseCategories("Dolci");
// ["Dolci"]

parseCategories("");
// []
```

---

#### lemmaHasCategory

**Firma**:
```typescript
function lemmaHasCategory(lemma: Lemma, category: string): boolean
```

**Descrizione**: Verifica se un lemma appartiene a una categoria specifica.

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `lemma` | `Lemma` | Oggetto lemma |
| `category` | `string` | Categoria da cercare |

**Ritorna**: `boolean` - `true` se lemma ha quella categoria

**Esempio**:
```typescript
const lemma = { Categoria: "Dolci, Bevande", ... };
lemmaHasCategory(lemma, "Dolci");  // true
lemmaHasCategory(lemma, "Carni");  // false
```

---

#### lemmaHasAnyCategory

**Firma**:
```typescript
function lemmaHasAnyCategory(lemma: Lemma, categories: string[]): boolean
```

**Descrizione**: Verifica se un lemma appartiene ad almeno una delle categorie specificate.

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `lemma` | `Lemma` | Oggetto lemma |
| `categories` | `string[]` | Array di categorie da cercare |

**Ritorna**: `boolean` - `true` se lemma ha almeno una categoria

**Esempio**:
```typescript
const lemma = { Categoria: "Dolci, Bevande", ... };
lemmaHasAnyCategory(lemma, ["Dolci", "Carni"]);  // true
lemmaHasAnyCategory(lemma, ["Carni", "Formaggi"]);  // false
```

---

### dataTransformers.ts

**Path**: `src/utils/dataTransformers.ts`

#### normalizeLemma

**Firma**:
```typescript
function normalizeLemma(rawLemma: any): Lemma
```

**Descrizione**: Normalizza oggetto lemma grezzo da CSV a tipo `Lemma` validato.

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `rawLemma` | `any` | Oggetto grezzo da PapaParse |

**Ritorna**: `Lemma` - Oggetto normalizzato

**Comportamento**:
- Cast tipi (string → number per Anno, Frequenza, IdLemma)
- Trim whitespace su stringhe
- Conversione `lat`/`lng` a number (se presenti)
- Default values per campi opzionali

---

#### mapLemmaToGeoArea

**Firma**:
```typescript
function mapLemmaToGeoArea(lemma: Lemma, geoAreas: GeoArea[]): Lemma
```

**Descrizione**: Associa un lemma alla sua area geografica e calcola coordinate centroide.

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `lemma` | `Lemma` | Oggetto lemma |
| `geoAreas` | `GeoArea[]` | Array di aree geografiche |

**Ritorna**: `Lemma` - Lemma con `lat`/`lng` aggiornati

**Comportamento**:
1. Cerca GeoArea con `IdAmbito` corrispondente
2. Se trovata, calcola centroide del poligono
3. Assegna `lat`/`lng` al lemma
4. Se non trovata o già ha coordinate, skip

**Esempio**:
```typescript
const lemma = { IdAmbito: "TOSCANA", ... };
const geoAreas = [{ IdAmbito: "TOSCANA", geometry: {...} }];
const mappedLemma = mapLemmaToGeoArea(lemma, geoAreas);
// mappedLemma.lat = 43.xxx
// mappedLemma.lng = 11.xxx
```

---

#### calculateCentroid

**Firma**:
```typescript
function calculateCentroid(geometry: GeoJSON.Geometry): [number, number] | null
```

**Descrizione**: Calcola il centroide di un poligono o multipoligono GeoJSON.

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `geometry` | `GeoJSON.Geometry` | Geometria GeoJSON (Polygon o MultiPolygon) |

**Ritorna**: `[number, number] | null` - `[lng, lat]` del centroide, o `null` se fallisce

**Comportamento**:
- Supporta `Polygon` e `MultiPolygon`
- Calcola media semplice delle coordinate (non centroide geografico preciso)
- Ritorna `null` per geometrie non supportate

---

#### groupLemmasByLocation

**Firma**:
```typescript
function groupLemmasByLocation(lemmas: Lemma[]): Map<string, Lemma[]>
```

**Descrizione**: Raggruppa lemmi per località.

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `lemmas` | `Lemma[]` | Array di lemmi |

**Ritorna**: `Map<string, Lemma[]>` - Mappa località → array lemmi

**Esempio**:
```typescript
const grouped = groupLemmasByLocation(lemmas);
grouped.get("Firenze");  // [lemma1, lemma2, ...]
```

---

#### extractYearRange

**Firma**:
```typescript
function extractYearRange(lemmas: Lemma[]): { minYear: number; maxYear: number }
```

**Descrizione**: Estrae range anni min-max dal dataset.

**Parametri**:
| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `lemmas` | `Lemma[]` | Array di lemmi |

**Ritorna**: `{ minYear: number; maxYear: number }`

**Esempio**:
```typescript
const { minYear, maxYear } = extractYearRange(lemmas);
// { minYear: 1300, maxYear: 1899 }
```

---

### validators.ts

**Path**: `src/utils/validators.ts`

#### isValidLemma

**Firma**:
```typescript
function isValidLemma(lemma: Partial<Lemma>): boolean
```

**Descrizione**: Valida oggetto lemma.

**Validazioni**:
- `IdLemma` presente e > 0
- `Lemma` stringa non vuota
- `Forma` stringa non vuota
- `Anno` numero valido

**Ritorna**: `boolean`

---

#### hasValidCoordinates

**Firma**:
```typescript
function hasValidCoordinates(lemma: Lemma): boolean
```

**Descrizione**: Verifica se lemma ha coordinate valide.

**Validazioni**:
- `lat` e `lng` presenti
- `lat` tra -90 e 90
- `lng` tra -180 e 180

**Ritorna**: `boolean`

---

#### validateGeoAreas

**Firma**:
```typescript
function validateGeoAreas(geoAreas: GeoArea[]): boolean
```

**Descrizione**: Valida array di aree geografiche.

**Validazioni**:
- Ogni area ha `IdAmbito` non vuoto
- Ogni area ha `geometry` valido (type Polygon o MultiPolygon)

**Ritorna**: `boolean`

---

## Context API

### AppContext

**Path**: `src/context/AppContext.tsx`

**Descrizione**: Context globale per gestione stato filtri e lemma selezionato.

#### Interfaccia Context

```typescript
interface AppContextType {
  filters: FilterState;
  setCategorie: (categorie: string[]) => void;
  setPeriodi: (periodi: string[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedLetter: (letter: string | null) => void;
  setSelectedYear: (year: number | null) => void;
  setSelectedLemma: (lemma: Lemma | null) => void;
  resetFilters: () => void;
}
```

#### FilterState

```typescript
interface FilterState {
  categorie: string[];
  periodi: string[];
  searchQuery: string;
  selectedLetter: string | null;
  selectedYear: number | null;
  selectedLemma: Lemma | null;
}
```

#### Provider

```typescript
<AppProvider>
  <App />
</AppProvider>
```

#### Hook di Consumo

```typescript
function MyComponent() {
  const { filters, setCategorie, setSelectedLemma, resetFilters } = useAppContext();
  
  // Usa stato e setters
}
```

---

## Type Definitions

### Lemma

**Path**: `src/types/index.ts`

```typescript
interface Lemma {
  IdLemma: number;           // ID univoco
  Lemma: string;             // Forma base normalizzata
  Forma: string;             // Variante attestata
  CollGeografica: string;    // Località geografica
  Anno: number;              // Anno attestazione
  Periodo: string;           // Periodo temporale (es. "1300-1399")
  Categoria: string;         // Categorie (CSV separato da virgola)
  Frequenza: number;         // Frequenza attestazione
  URL: string;               // Link risorsa esterna
  IdAmbito?: string;         // ID area geografica (opzionale)
  lat?: number;              // Latitudine (opzionale)
  lng?: number;              // Longitudine (opzionale)
}
```

### GeoArea

```typescript
interface GeoArea {
  IdAmbito: string;          // ID univoco area
  geometry: GeoJSON.Geometry; // Geometria GeoJSON (Polygon/MultiPolygon)
}
```

---

## Data Flow

### Caricamento Iniziale

```
App Mount
  ↓
useDataLoader Hook
  ↓
├─ loadLemmasCSV('/data/Lemmi_forme_atliteg_updated.csv')
│  ├─ fetch CSV
│  ├─ PapaParse
│  ├─ normalizeLemma per ogni riga
│  └─ isValidLemma validation
│
├─ loadGeoAreasJSON('/data/Ambiti geolinguistici newline.json')
│  ├─ fetch GeoJSON
│  └─ validateGeoAreas
│
└─ mapLemmaToGeoArea per ogni lemma
   ├─ Trova GeoArea corrispondente
   ├─ calculateCentroid
   └─ Assegna lat/lng
  ↓
State Update (lemmas, geoAreas)
  ↓
Re-render Componenti
```

### Filtraggio Dati

```
User Interaction (click filtro categoria)
  ↓
setCategorie(['Dolci'])
  ↓
Context Update (filters.categorie)
  ↓
Trigger Re-render componenti che usano useAppContext
  ↓
useFilteredData Hook
  ↓
Applica filtri in sequenza:
  ├─ 1. Filtro categorie (lemmaHasAnyCategory)
  ├─ 2. Filtro periodi
  ├─ 3. Filtro searchQuery
  ├─ 4. Filtro selectedLetter
  └─ 5. Filtro selectedYear
  ↓
Ritorna filteredLemmas
  ↓
Componenti aggiornano visualizzazione:
  ├─ GeographicalMap (mostra marker filtrati)
  ├─ Timeline (evidenzia anni filtrati)
  ├─ AlphabeticalIndex (mostra lemmi filtrati)
  ├─ LemmaDetail (se lemma selezionato ancora valido)
  └─ MetricsSummary (metriche da lemmi filtrati)
```

### Selezione Lemma

```
User Click su Lemma (da mappa, timeline, index, ricerca)
  ↓
setSelectedLemma(lemma)
  ↓
Context Update (filters.selectedLemma)
  ↓
LemmaDetail Re-render
  ├─ Mostra informazioni lemma
  ├─ parseCategories per badge
  ├─ Filtra tutte le attestazioni (stesso Lemma base)
  └─ Ordina cronologicamente
  ↓
GeographicalMap Re-render
  └─ Centra mappa su lemma selezionato (lat/lng)
```

---

## Best Practices

### Performance
- Usa `useMemo` per calcoli costosi (filtri, metriche, grouping)
- Usa `useCallback` per funzioni passate come props
- Memoizza componenti pesanti con `React.memo`
- Evita filtri inutili (check se array vuoto)

### Error Handling
- Usa error boundaries per errori fatali
- Log warnings per dati invalidi (non bloccare)
- Mostra UI fallback durante errori

### Type Safety
- Usa TypeScript strict mode
- Definisci interfacce per tutte le strutture dati
- Evita `any`, usa `unknown` se necessario

### Code Organization
- Separa business logic (hooks, services) da UI (components)
- Un file per funzione/classe quando possibile
- Barrel exports (`index.ts`) per esportazioni pulite

---

## Testing

### Unit Tests (Planned)

**Hooks**:
```typescript
// useFilteredData.test.ts
test('filters lemmas by categories', () => {
  const lemmas = [{ Categoria: 'Dolci', ... }];
  const filters = { categorie: ['Dolci'], ... };
  const result = useFilteredData(lemmas, filters);
  expect(result).toHaveLength(1);
});
```

**Utils**:
```typescript
// categoryParser.test.ts
test('parseCategories splits comma-separated string', () => {
  expect(parseCategories('Dolci, Bevande')).toEqual(['Dolci', 'Bevande']);
});
```

**Services**:
```typescript
// dataLoader.test.ts
test('loadLemmasCSV returns array of lemmas', async () => {
  const lemmas = await loadLemmasCSV('/mock-data.csv');
  expect(Array.isArray(lemmas)).toBe(true);
  expect(lemmas[0]).toHaveProperty('IdLemma');
});
```

---

## Appendice

### File Structure

```
src/
├── hooks/
│   ├── useDataLoader.ts
│   ├── useFilteredData.ts
│   ├── useMetrics.ts
│   └── useDebounce.ts
├── services/
│   └── dataLoader.ts
├── utils/
│   ├── categoryParser.ts
│   ├── dataTransformers.ts
│   ├── validators.ts
│   └── index.ts
├── context/
│   └── AppContext.tsx
└── types/
    └── index.ts
```

### Dependencies

- `papaparse`: CSV parsing
- `react`: Hooks system
- `typescript`: Type safety

### Versioning

Questa documentazione è aggiornata per la versione **1.0.0** dell'applicazione.

Per changelog completo, vedi [CHANGELOG.md](../CHANGELOG.md).

Per architettura generale, vedi [ARCHITECTURE.md](./ARCHITECTURE.md).
