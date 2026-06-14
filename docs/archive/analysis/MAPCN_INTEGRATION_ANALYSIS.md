# Analisi Integrazione mapcn nell'applicazione AtLiTeG

**Data:** 18 Gennaio 2026  
**Versione:** 1.0  
**Progetto analizzato:** [mapcn](https://github.com/AnmolSaini16/mapcn) v0.1.0

## Sommario Esecutivo

Questo documento fornisce un'analisi approfondita della possibilità di integrare la libreria **mapcn** nell'applicazione **AtLiTeG Map** (lemmario-dashboard) al posto dell'attuale implementazione basata su Leaflet/react-leaflet, con l'obiettivo di migliorare l'integrazione grafica con il resto dell'interfaccia.

### Raccomandazione Principale

**Non raccomandato per l'integrazione immediata** - Mentre mapcn offre vantaggi estetici e di modernità, presenta limitazioni tecniche significative che potrebbero compromettere funzionalità esistenti critiche. Si consiglia di mantenere l'attuale implementazione Leaflet e considerare mapcn solo per progetti futuri o per componenti mappa aggiuntivi meno complessi.

---

## 1. Panoramica delle Tecnologie

### 1.1 Implementazione Attuale (AtLiTeG Map)

**Stack Tecnologico:**
- **Libreria mapping:** Leaflet 1.9.4
- **Wrapper React:** react-leaflet 5.0.0
- **Clustering:** leaflet.markercluster 1.5.3
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS 3.4
- **Stile mappa:** OpenStreetMap tiles

**Caratteristiche Implementate:**
- Marker clustering con aggregazione frequenze
- Popup complessi con componenti React (MapBoundedPopup)
- Layer GeoJSON per poligoni (aree geografiche e confini regionali)
- Highlighting dinamico di marker e aree
- Animazioni flyTo per navigazione automatica
- Gestione SSR-safe con dynamic imports
- Icone marker personalizzate basate su frequenza
- Loading states e ottimizzazioni performance

### 1.2 mapcn - Libreria Proposta

**Stack Tecnologico:**
- **Libreria mapping:** MapLibre GL JS 5.15.0
- **Design System:** shadcn/ui pattern + Tailwind CSS 4
- **Framework:** React 19 (compatibile Next.js 16)
- **Temi:** Supporto nativo light/dark mode
- **Stile mappa:** CARTO Basemaps (OpenStreetMap-based)

**Componenti Disponibili:**
```typescript
- Map (container principale con gestione tema automatica)
- MapMarker (marker individuali con supporto drag)
  - MarkerContent (contenuto personalizzato marker)
  - MarkerPopup (popup click-based)
  - MarkerTooltip (tooltip hover-based)
  - MarkerLabel (label testuali)
- MapPopup (popup standalone sulla mappa)
- MapControls (controlli zoom, compass, locate, fullscreen)
- MapRoute (tracciamento percorsi/linee)
- MapClusterLayer (clustering basato su GeoJSON)
```

---

## 2. Analisi Comparativa Dettagliata

### 2.1 Architettura e Paradigmi

#### Leaflet (Attuale)
- **Paradigma:** DOM-based rendering (SVG/Canvas per tiles)
- **Approccio:** Imperativo con wrapper React dichiarativo
- **Rendering:** Layer-based con manipolazione diretta DOM
- **Integrazione React:** Tramite ref e portals per componenti custom

#### MapLibre GL (mapcn)
- **Paradigma:** WebGL-based rendering
- **Approccio:** Dichiarativo con Context API React
- **Rendering:** GPU-accelerated vector tiles
- **Integrazione React:** Componenti nativi React con portals per content

**Implicazioni:**
- MapLibre offre **performance superiori** per grandi dataset e animazioni fluide
- Leaflet è più **semplice da debuggare** e ha ecosistema più maturo
- MapLibre richiede **WebGL support** (può essere limitante per browser legacy)

### 2.2 Funzionalità Critiche - Confronto

| Funzionalità | AtLiTeG (Leaflet) | mapcn (MapLibre) | Impatto Migrazione |
|--------------|-------------------|------------------|-------------------|
| **Marker Clustering** | ✅ Completo con `leaflet.markercluster` | ⚠️ Limitato via `MapClusterLayer` | 🔴 ALTO - Richiederebbe riscrittura significativa |
| **GeoJSON Polygons** | ✅ Nativo con styling dinamico | ✅ Supportato via MapLibre API | 🟡 MEDIO - API diversa ma equivalente |
| **Popup React Complessi** | ✅ Via `createRoot` + portals | ✅ Via `MarkerPopup` component | 🟢 BASSO - Pattern simile |
| **Highlighting Dinamico** | ✅ Aggiornamento icone in real-time | ⚠️ Necessita gestione manuale state | 🟡 MEDIO - Logica da riscrivere |
| **Animazioni flyTo/fitBounds** | ✅ API nativa Leaflet | ✅ API nativa MapLibre | 🟢 BASSO - Equivalenti |
| **SSR Compatibility** | ✅ Con dynamic import | ✅ Client-only con hook | 🟢 BASSO - Già gestito |
| **Custom Marker Icons** | ✅ DivIcon con HTML | ✅ MarkerContent component | 🟢 BASSO - Pattern simile |
| **Loading States** | ✅ Implementato custom | ✅ Built-in loader | 🟢 BASSO - Miglioramento |

### 2.3 Clustering - Analisi Critica

#### Implementazione Attuale (leaflet.markercluster)
```javascript
// Configurazione sofisticata con controllo totale
const markerClusterGroup = L.markerClusterGroup({
  maxClusterRadius: 120,
  disableClusteringAtZoom: 25,
  singleMarkerMode: false,
  iconCreateFunction: (cluster) => {
    // Somma frequenze lemmi per dimensione/colore cluster
    let totalFrequency = calculateTotalFrequency(cluster);
    return customClusterIcon(totalFrequency);
  }
});
```

**Caratteristiche:**
- Aggregazione personalizzata (somma frequenze)
- Icone dinamiche basate su metriche aggregate
- Controllo granulare su quando clusterizzare
- Popup per cluster con lemmi raggruppati

#### mapcn MapClusterLayer
```typescript
<MapClusterLayer
  data={geojsonData}
  clusterRadius={50}
  clusterMaxZoom={14}
  onClusterClick={(id, coords, count) => {}}
  onPointClick={(feature, coords) => {}}
/>
```

**Limitazioni:**
- Basato su **GeoJSON source** nativo MapLibre
- **Meno controllo** su logica aggregazione
- Icone cluster meno personalizzabili
- **Non supporta** somma di proprietà custom nei cluster (solo count)
- Richiede **conversione dati** a formato GeoJSON

**Impatto:** La conversione del sistema clustering richiederebbe:
1. Riscrittura logica aggregazione frequenze
2. Adattamento formato dati (array markers → GeoJSON FeatureCollection)
3. Perdita potenziale di alcune personalizzazioni visive
4. Test estensivi per parità funzionale

### 2.4 Integrazione Visiva e Design System

#### Punti di Forza mapcn

**1. Tema Automatico**
```typescript
// Detect automatico light/dark da document.documentElement
<Map theme={detectedTheme}>
  {/* Stile mappa si aggiorna automaticamente */}
</Map>
```
- **Beneficio:** Coerenza immediata se AtLiTeG adotta dark mode
- **Attuale:** Leaflet usa sempre stile OpenStreetMap (light)

**2. shadcn/ui Pattern**
```typescript
// Utilizza stesse convenzioni UI dell'ecosistema shadcn
className={cn(
  "rounded-md border bg-popover p-3 text-popover-foreground",
  className
)}
```
- **Beneficio:** Se AtLiTeG usa/userà shadcn, integrazione perfetta
- **Attuale:** Custom Tailwind classes, pattern coerente ma non shadcn

**3. Componenti Preconfezionati**
```typescript
<MapControls 
  position="bottom-right"
  showZoom showCompass showLocate showFullscreen 
/>
```
- **Beneficio:** Meno codice per controlli standard
- **Attuale:** Controlli nativi Leaflet, meno customizzabili visivamente

#### Punti di Debolezza

**1. Dipendenza CARTO Basemaps**
- **Problema:** CARTO richiede licenza Enterprise per uso commerciale
- **Soluzione:** Possibile usare OpenStreetMap tiles, ma richiede configurazione manuale
- **Attuale:** OpenStreetMap gratuito

**2. Tailwind CSS v4**
- **Problema:** AtLiTeG usa Tailwind v3.4, mapcn richiede v4 (breaking changes)
- **Impatto:** Possibili conflitti configurazione, necessita upgrade

**3. Complessità WebGL**
- **Problema:** Debugging più difficile, performance issues su GPU lente
- **Attuale:** Leaflet più prevedibile e stabile

---

## 3. Valutazione Integrazione Grafica

### 3.1 Allineamento con Design System AtLiTeG

**Design System Attuale AtLiTeG:**
- Colori: Primary `#0B5FA5`, Accent `#3B82F6`
- Font: Inter, Helvetica Neue
- Border radius: 6-8px
- Ombre: `card`, `card-hover`
- Background: `#F6F8FB`

**Compatibilità mapcn:**
| Aspetto | Compatibilità | Note |
|---------|---------------|------|
| Palette colori | 🟡 Parziale | Necessita override variabili shadcn |
| Tipografia | ✅ Compatibile | Inter già usato da entrambi |
| Spacing/Sizing | ✅ Compatibile | Tailwind standard |
| Border radius | ✅ Compatibile | Configurabile |
| Animazioni | ✅ Migliorata | mapcn ha più animazioni built-in |

**Stima Effort Customizzazione Visiva:** 
- Override tema shadcn: **2-3 giorni**
- Adattamento componenti: **1-2 giorni**
- Testing cross-browser: **1 giorno**

**Totale:** ~5 giorni lavoro

### 3.2 Vantaggi Estetici Potenziali

1. **Marker Moderni:**
   - Animazioni smooth su hover/click
   - Tooltip/Popup più raffinati
   - Supporto gradient e effetti visivi complessi

2. **Transizioni Fluide:**
   - GPU-accelerated animations
   - Zoom/pan più smooth
   - Effetti 3D opzionali (globe projection)

3. **Coerenza UI:**
   - Se integrato shadcn/ui, stesso look & feel
   - Controlli mappa stilisticamente allineati

**Beneficio Reale:** ⚠️ **MODERATO** - Miglioramenti visibili ma non critici per funzionalità core

---

## 4. Analisi Difficoltà di Integrazione

### 4.1 Matrice di Complessità

| Componente da Migrare | Complessità | Tempo Stimato | Rischio |
|-----------------------|-------------|---------------|---------|
| **MarkerClusterGroup → MapClusterLayer** | 🔴 ALTA | 5-7 giorni | ALTO |
| **GeoJSON Polygons** | 🟡 MEDIA | 2-3 giorni | MEDIO |
| **MapBoundedPopup** | 🟡 MEDIA | 2-3 giorni | BASSO |
| **Highlighting System** | 🟡 MEDIA | 3-4 giorni | MEDIO |
| **Loading States** | 🟢 BASSA | 0.5 giorni | BASSO |
| **SSR Setup** | 🟢 BASSA | 1 giorno | BASSO |
| **Tema Integration** | 🟡 MEDIA | 2-3 giorni | MEDIO |
| **Testing & QA** | 🟡 MEDIA | 5-7 giorni | ALTO |

**Tempo Totale Stimato:** **20-30 giorni lavorativi** (1-1.5 mesi)

### 4.2 Rischi Tecnici Identificati

#### ALTO RISCHIO
1. **Perdita Funzionalità Clustering:**
   - Impossibilità di replicare esattamente la logica di aggregazione frequenze
   - Possibile degradazione UX per utenti con molti dati

2. **Regressioni Performance:**
   - WebGL può essere più lento su device datati
   - Maggiore consumo memoria GPU

3. **Breaking Changes Dipendenze:**
   - Tailwind v4 potrebbe richiedere refactor globale CSS
   - Conflitti con altre dipendenze UI

#### MEDIO RISCHIO
1. **Complessità Debugging:**
   - Errori WebGL più ostici da risolvere
   - Meno risorse community rispetto a Leaflet

2. **Compatibilità Browser:**
   - Problemi potenziali con Safari vecchio
   - Fallback necessario per browser senza WebGL

#### BASSO RISCHIO
1. **Migrazione Popup:**
   - Pattern simile, conversione diretta possibile

2. **SSR Handling:**
   - Già gestito correttamente in entrambi

### 4.3 Roadmap Migrazione (Se Intrapresa)

**Fase 1: Preparazione (1 settimana)**
- Setup progetto parallelo con mapcn
- Upgrade Tailwind CSS v4
- Configurazione tema custom AtLiTeG
- Prototipo marker semplice

**Fase 2: Componenti Base (2 settimane)**
- Migrazione Map container
- Implementazione marker individuali
- GeoJSON polygons
- Popup base

**Fase 3: Funzionalità Avanzate (2 settimane)**
- Sistema clustering (richiede ricerca/custom solution)
- Highlighting dinamico
- Animazioni navigazione
- Loading states

**Fase 4: Testing & Ottimizzazione (1-2 settimane)**
- Test funzionali completi
- Performance testing
- Cross-browser testing
- Accessibility audit

**Fase 5: Deploy & Monitoraggio (1 settimana)**
- Deploy graduale (feature flag)
- Monitoring errori
- Feedback utenti
- Fix bugs

**Totale:** 7-9 settimane (con risorse dedicate)

---

## 5. Punti di Forza e Debolezza - Sintesi

### ✅ Punti di Forza mapcn

1. **Modernità Tecnologica**
   - WebGL rendering (performance superiori grandi dataset)
   - Supporto dark mode nativo
   - Animazioni GPU-accelerated

2. **Ecosistema UI**
   - Integrazione shadcn/ui (se adottato)
   - Componenti preconfezionati e consistenti
   - Pattern React moderni (hooks, context)

3. **Developer Experience**
   - API dichiarativa e intuitiva
   - TypeScript first-class
   - Documentazione esempi chiari

4. **Estetica**
   - Marker e popup più raffinati
   - Transizioni smooth
   - Possibilità 3D/globe

5. **Manutenibilità Futura**
   - Codebase più pulito e moderno
   - Meno dipendenze legacy
   - Aggiornamenti attivi (progetto recente)

### ❌ Punti di Debolezza mapcn

1. **Limitazioni Funzionali**
   - Clustering meno flessibile (somma proprietà custom difficile)
   - Meno plugin disponibili vs ecosistema Leaflet
   - Documentazione limitata per casi d'uso avanzati

2. **Complessità Migrazione**
   - Riscrittura significativa codice esistente
   - Rischio regressioni funzionali
   - Tempo sviluppo elevato (1-2 mesi)

3. **Dipendenze Esterne**
   - CARTO Basemaps licensing issues
   - Richiede Tailwind v4 (breaking change)
   - WebGL requirement (compatibilità ridotta)

4. **Maturità Progetto**
   - v0.1.0 (molto giovane, API potrebbe cambiare)
   - Community piccola (meno risorse supporto)
   - Casi edge non testati

5. **Performance Reale**
   - WebGL overhead su GPU lente
   - Maggiore consumo batteria mobile
   - Problemi potenziali con grandi GeoJSON

---

## 6. Analisi Costi-Benefici

### 6.1 Costi Stimati

**Sviluppo:**
- Tempo sviluppo: 7-9 settimane × costo orario sviluppatore
- Testing: 1-2 settimane × costo QA
- Project management: ~20% overhead

**Rischi:**
- Downtime potenziale durante deploy
- Bug critici post-migrazione
- Performance degradation su alcuni device

**Manutenzione:**
- Learning curve per team
- Dependency updates più frequenti (progetto giovane)

### 6.2 Benefici Stimati

**Tangibili:**
- Performance migliorate: +20-30% rendering grandi dataset (ipotetico)
- Animazioni più fluide: miglioramento percepito UX
- Codice più pulito: -15-20% LOC (stima)

**Intangibili:**
- Stack tecnologico più moderno
- Migliore appeal estetico
- Preparazione per future funzionalità 3D

### 6.3 ROI (Return on Investment)

**Formula Semplificata:**
```
ROI = (Benefici - Costi) / Costi × 100%

Costi: ~2 mesi sviluppo + rischi
Benefici: Miglioramenti UX moderati + modernità codebase

ROI Stimato: NEGATIVO nel breve termine (6-12 mesi)
              NEUTRALE nel medio termine (1-2 anni)
              POSITIVO nel lungo termine (2+ anni) SE progetto evolve
```

**Conclusione:** ROI favorevole solo se:
- Budget disponibile per refactoring lungo
- Roadmap include funzionalità 3D/advanced mapping
- Team può dedicare risorse senza impattare altri deliverable

---

## 7. Raccomandazioni Finali

### 7.1 Scenario 1: Mantenere Leaflet (RACCOMANDATO)

**Quando:**
- Budget/tempo limitato
- Funzionalità attuali soddisfano requisiti
- Team non familiare con MapLibre/WebGL
- Applicazione stabile e in produzione

**Azioni:**
- Migliorare styling Leaflet per allineamento design AtLiTeG
- Ottimizzare clustering esistente
- Aggiungere dark mode via tile provider custom
- Investire in performance optimization attuale stack

**Pro:**
- ✅ Zero rischio regressioni
- ✅ Costo quasi nullo
- ✅ Tempo <1 settimana

**Contro:**
- ❌ Stack non "moderno"
- ❌ Limiti estetici Leaflet

### 7.2 Scenario 2: Migrazione Graduale (ALTERNATIVA)

**Quando:**
- Disponibilità budget medio (2-3 mesi)
- Roadmap include nuove funzionalità mapping
- Team vuole modernizzare stack

**Azioni:**
1. Creare componente mappa secondario con mapcn per feature nuove
2. Mantenere Leaflet per mappa principale
3. A/B testing con utenti
4. Migrazione completa solo se feedback positivo

**Pro:**
- ✅ Rischio controllato
- ✅ Possibilità rollback facile
- ✅ Testing reale con utenti

**Contro:**
- ❌ Mantenimento dual stack temporaneo
- ❌ Complessità build aumentata

### 7.3 Scenario 3: Migrazione Completa (NON RACCOMANDATO ORA)

**Quando:**
- Budget abbondante (3+ mesi)
- Refactoring major già pianificato
- Team esperto MapLibre
- Requisiti futuri richiedono 3D/WebGL

**Azioni:**
- Seguire roadmap migrazione completa (Sezione 4.3)
- Dedicare team full-time
- Extensive testing

**Pro:**
- ✅ Stack moderno e performante
- ✅ Miglior UX long-term

**Contro:**
- ❌ Costo elevato
- ❌ Rischio alto
- ❌ ROI negativo breve termine

---

## 8. Alternative Considerate

### 8.1 Altre Librerie Mapping

**React-Map-GL (Uber)**
- Pro: Matura, ben documentata, simile a mapcn
- Contro: Più opinionated, meno flessibile styling

**Google Maps API**
- Pro: Features avanzate, supporto eccellente
- Contro: Costi licensing, vendor lock-in

**Deck.gl**
- Pro: Performance incredibili grandi dataset 3D
- Contro: Curva apprendimento ripida, overkill per use case

**Mapbox GL JS**
- Pro: Leader mercato, feature-rich
- Contro: Licensing costoso, simile a MapLibre (fork)

### 8.2 Miglioramenti In-Place Leaflet

**Opzione Economica:**
- Plugin `leaflet-darkmode` per tema scuro
- Custom CSS per allineamento design
- Ottimizzazione bundle size
- Miglior lazy loading tiles

**Costo:** ~1 settimana, **ROI ALTO**

---

## 9. Conclusioni

### Verdetto Finale

**mapcn è una libreria promettente e ben progettata**, ma **l'integrazione nell'applicazione AtLiTeG Map non è giustificata** al momento attuale per i seguenti motivi principali:

1. **Funzionalità Critiche a Rischio:** Il sistema di clustering con aggregazione frequenze è difficile da replicare esattamente
2. **Costi Elevati:** 1-2 mesi sviluppo + testing per benefici estetici moderati
3. **Rischi Tecnici:** Progetto giovane (v0.1.0), possibili breaking changes futuri
4. **ROI Negativo:** Investimento non ripaga nel breve-medio termine
5. **Leaflet Soddisfa Requisiti:** Stack attuale funziona bene e può essere migliorato incrementalmente

### Quando Riconsiderare mapcn

- **AtLiTeG 2.0:** Se pianificato major refactoring completo applicazione
- **Nuove Funzionalità:** Requisiti 3D, visualizzazioni globe, heatmaps avanzate
- **Adozione shadcn/ui:** Se design system evolve verso shadcn ecosystem
- **Budget Disponibile:** Quando ROI long-term diventa priorità

### Prossimi Passi Raccomandati

1. **Breve Termine (1-2 settimane):**
   - Migliorare styling Leaflet esistente
   - Ottimizzare performance clustering
   - Documentare customizzazioni per manutenibilità

2. **Medio Termine (3-6 mesi):**
   - Monitorare evoluzione mapcn (v0.2, v0.3...)
   - Valutare feedback utenti su UX mappa attuale
   - Prototipo esplorativo mapcn se tempo permette

3. **Lungo Termine (12+ mesi):**
   - Rievaluare se requisiti cambiano
   - Considerare migrazione se mapcn diventa maturo e stabile
   - Allineare con strategia tecnologica generale AtLiTeG

---

## 10. Riferimenti

### Documentazione
- [mapcn Repository](https://github.com/AnmolSaini16/mapcn)
- [mapcn Documentation](https://mapcn.dev/docs)
- [MapLibre GL JS Docs](https://maplibre.org/maplibre-gl-js/docs/)
- [Leaflet Documentation](https://leafletjs.com/)
- [react-leaflet Documentation](https://react-leaflet.js.org/)

### AtLiTeG Map
- Codebase: `/lemmario-dashboard/components/GeographicalMap.tsx`
- Architettura: `/docs/ARCHITECTURE.md`
- Package: `/lemmario-dashboard/package.json`

### Autore Analisi
- Generato da: GitHub Copilot Coding Agent
- Data: 18 Gennaio 2026
- Contatto: Progetto AtLiTeG - Università Roma Tre

---

**Appendice A: Checklist Decisionale**

Prima di procedere con eventuale migrazione, verificare:

- [ ] Budget disponibile: almeno 2-3 mesi sviluppo?
- [ ] Team ha competenze MapLibre/WebGL?
- [ ] Esistono requisiti nuovi non supportati da Leaflet?
- [ ] Roadmap prodotto giustifica refactoring?
- [ ] mapcn è almeno v0.5+ (più maturo)?
- [ ] Testing plan robusto è in place?
- [ ] Stakeholder approvano rischi identificati?
- [ ] Fallback plan documentato?

**Se <5 checkbox selezionati:** ❌ NON MIGRARE  
**Se 5-7 checkbox selezionati:** ⚠️ VALUTARE ATTENTAMENTE  
**Se 8 checkbox selezionati:** ✅ MIGRAZIONE POSSIBILE

---

*Documento redatto per supportare decisioni tecniche data-driven. Tutte le stime sono basate su analisi statica codebase e best practice industria. Testing reale potrebbe rivelare fattori aggiuntivi.*
