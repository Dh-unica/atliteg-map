# Documentazione Analisi Integrazione mapcn

Questa cartella contiene l'analisi completa sulla possibile integrazione della libreria [mapcn](https://github.com/AnmolSaini16/mapcn) nell'applicazione AtLiTeG Map.

## 📚 Indice Documenti

### 1. [MAPCN_INTEGRATION_SUMMARY.md](./MAPCN_INTEGRATION_SUMMARY.md) ⭐ INIZIA QUI
**Executive Summary per decisori**

Documento breve (9KB) che riassume:
- Raccomandazione finale (NO all'integrazione)
- Motivazioni principali
- Metriche decisione
- Prossimi passi raccomandati

👉 **Leggi questo se hai poco tempo o sei uno stakeholder non tecnico**

---

### 2. [MAPCN_INTEGRATION_ANALYSIS.md](./MAPCN_INTEGRATION_ANALYSIS.md) 📊
**Analisi completa e dettagliata (19KB)**

Contenuto:
- Panoramica tecnologie (Leaflet vs MapLibre vs mapcn)
- Confronto funzionalità critiche con tabelle comparative
- Analisi difficoltà integrazione (matrice complessità)
- Roadmap migrazione dettagliata (7-9 settimane)
- Punti di forza e debolezza
- Analisi costi-benefici con ROI
- 3 scenari possibili (mantenere/graduale/completa)
- Alternative considerate
- Checklist decisionale

👉 **Leggi questo per comprendere completamente le motivazioni tecniche e strategiche**

---

### 3. [MAPCN_CODE_COMPARISON.md](./MAPCN_CODE_COMPARISON.md) 💻
**Confronto tecnico con esempi di codice (19KB)**

Contenuto:
- Esempi codice side-by-side Leaflet vs mapcn
- Setup e configurazione
- Implementazione marker, clustering, GeoJSON
- Popup React, highlighting, animazioni
- Stima LOC e bundle size
- Pattern migrazione

👉 **Leggi questo se sei uno sviluppatore e vuoi dettagli implementativi**

---

### 4. [MAPCN_POC_EXAMPLE.md](./MAPCN_POC_EXAMPLE.md) 🧪
**Proof of Concept implementativo (17KB)**

Contenuto:
- Codice esempio completo componente con mapcn
- Setup progetto step-by-step
- Marker custom AtLiTeG-styled
- Popup lemmi raggruppati
- Differenze funzionali vs versione Leaflet
- Performance considerations
- Testing plan e migration checklist
- Rollback plan

⚠️ **ATTENZIONE:** Questo è un esempio concettuale, NON una raccomandazione di implementazione

👉 **Leggi questo per vedere come apparirebbe concretamente il codice**

---

## 🎯 Raccomandazione Finale

### ❌ NON INTEGRARE mapcn al momento attuale

**Perché:**
1. Funzionalità clustering critiche difficili da replicare
2. Progetto molto giovane (v0.1.0)
3. Tempo sviluppo elevato (1-2 mesi)
4. ROI negativo nel breve-medio termine
5. Leaflet funziona bene e può essere migliorato incrementalmente

### ✅ COSA FARE INVECE

**Breve termine (1-2 settimane):**
- Migliorare styling Leaflet esistente
- Ottimizzare performance clustering
- Documentare customizzazioni

**Medio termine (3-6 mesi):**
- Monitorare evoluzione mapcn
- Raccogliere feedback utenti

**Lungo termine (12+ mesi):**
- Rivalutare se mapcn matura (v0.5+)
- Riconsiderare se requisiti cambiano

---

## 📖 Come Leggere la Documentazione

### Per Decisori / Product Manager
1. Leggi **MAPCN_INTEGRATION_SUMMARY.md** (5-10 minuti)
2. Se serve approfondimento: sezioni 1-3, 5-6 di **MAPCN_INTEGRATION_ANALYSIS.md**

### Per Sviluppatori
1. Inizia con **MAPCN_INTEGRATION_SUMMARY.md** per contesto
2. Leggi **MAPCN_CODE_COMPARISON.md** per dettagli tecnici
3. Se interessato a POC: **MAPCN_POC_EXAMPLE.md**
4. Approfondisci con **MAPCN_INTEGRATION_ANALYSIS.md** sezioni tecniche

### Per Architetti / Tech Lead
1. Leggi tutti i documenti in ordine
2. Focalizza su sezioni:
   - Architettura e paradigmi (ANALYSIS 2.1)
   - Funzionalità critiche (ANALYSIS 2.2-2.3)
   - Difficoltà integrazione (ANALYSIS 4)
   - Code comparison completo (COMPARISON)

---

## 🔍 Informazioni Aggiuntive

### Tecnologie Analizzate

**Attuale (Leaflet):**
- Leaflet 1.9.4
- react-leaflet 5.0.0
- leaflet.markercluster 1.5.3

**Proposta (mapcn):**
- MapLibre GL JS 5.15.0
- mapcn v0.1.0
- shadcn/ui pattern

### Dataset Considerato
- ~200-500 marker (località lemmi)
- GeoJSON polygons (aree dialettali)
- Confini regionali
- Clustering con aggregazione frequenze

### Metriche Valutate
- Bundle size: +60% con mapcn
- Tempo sviluppo: 1-2 mesi
- ROI: Negativo 6-12 mesi
- Complessità: ALTA per clustering

---

## 📞 Contatti e Riferimenti

**Repository:** https://github.com/Unica-dh/atliteg-map  
**Progetto:** AtLiTeG - Atlante Lingua Italiana Gastronomia  
**Collaborazione:** Labgeo "Giuseppe Caraci" - Università Roma Tre

**Link Esterni:**
- [mapcn Repository](https://github.com/AnmolSaini16/mapcn)
- [mapcn Documentation](https://mapcn.dev/docs)
- [MapLibre GL JS](https://maplibre.org/)
- [Leaflet](https://leafletjs.com/)

---

## 📅 Timeline Analisi

- **Data inizio:** 18 Gennaio 2026
- **Data completamento:** 18 Gennaio 2026
- **Autore:** GitHub Copilot Coding Agent
- **Review:** Pending stakeholder review

---

## ✅ Checklist Post-Lettura

Dopo aver letto la documentazione, verifica di aver compreso:

- [ ] Differenza architetturale Leaflet (DOM) vs MapLibre (WebGL)
- [ ] Perché il clustering è un problema critico
- [ ] Stima tempo e costo migrazione (1-2 mesi)
- [ ] ROI negativo nel breve termine
- [ ] Raccomandazione: mantenere Leaflet
- [ ] Alternative: miglioramenti incrementali
- [ ] Quando riconsiderare: mapcn v0.5+ o requisiti cambiano

---

## 🚀 Prossimi Passi

1. **Condividere** questa documentazione con stakeholder
2. **Discutere** in team meeting raccomandazioni
3. **Pianificare** miglioramenti Leaflet breve termine
4. **Schedulare** review trimestrale evoluzione mapcn
5. **Documentare** decisione finale in ADR (Architecture Decision Record)

---

*Documentazione generata il 18 Gennaio 2026*  
*Ultima modifica: 18 Gennaio 2026*
