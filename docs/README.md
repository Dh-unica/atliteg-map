# 📚 Indice Documentazione Atliteg

**Versione**: 2.0  
**Ultima Modifica**: 17 Gennaio 2026  
**Stato**: Aggiornato - Consolidamento Completato

Benvenuto nella documentazione ufficiale del progetto Atliteg. Qui troverai tutte le risorse necessarie per comprendere, sviluppare e mantenere il progetto.

## 🏗️ Architecture
Documenti di design, specifiche tecniche e requisiti del sistema.

- [System Architecture](architecture/system-architecture.md) - Panoramica dell'architettura del sistema
- [Backend API Design](architecture/backend-api-design.md) - Design e implementazione API backend
- [Dataset Specification](architecture/dataset-specification.md) - Specifiche dei dati e formati
- [Dynamic Graphics](architecture/dynamic-graphics.md) - Dettagli sugli effetti grafici e visualizzazioni
- [Motion System](architecture/motion-system.md) - Sistema di animazioni e transizioni
- [Performance](architecture/performance.md) - Analisi e ottimizzazione delle performance
- [Requirements](architecture/requirements.md) - Requisiti funzionali e non funzionali

## 📘 Guides
Manuali utente, guide per sviluppatori, setup e procedure operative.

### Guide Principali
- [Quick Start](guides/quick-start.md) - Guida rapida per iniziare
- [User Guide](guides/user-guide.md) - Manuale utente completo
- [Nota Componente Tecnica Atlante](guides/nota-componente-tecnica-atlante.md) - Sintesi divulgativa della componente tecnica per presentazioni e seminari
- [Nota Componente Tecnica Atlante HTML](guides/nota-componente-tecnica-atlante.html) - Versione presentabile in stile slide con diagramma architetturale e focus su UI e filtri
- [Deployment Guide](guides/deployment-guide.md) - Guida al deployment in produzione
- [Testing Guide](guides/testing.md) - Guida all'esecuzione dei test
- [Test Checklist](guides/test-checklist.md) - Checklist per il testing manuale (189 test)

### Guide Tecniche
- [GitHub Actions](guides/github-actions.md) - Configurazione CI/CD
- [SEO Implementation](guides/seo-implementation.md) - Strategia SEO/AEO/GEO completa
- [API Reference](guides/api-reference.md) - Riferimento API
- [Quick Commands](guides/quick-commands.md) - Lista comandi frequenti
- [Region Codes](guides/region-codes.md) - Guida ai codici regionali ISTAT

### Guide Dati e Upload
- [Data Sync](guides/data-sync.md) - Procedure di sincronizzazione dati
- [CSV Upload Guide](guides/CSV_UPLOAD_GUIDE.md) - Guida caricamento CSV
- [Upload Refresh Guide](guides/upload-refresh-guide.md) - Procedura refresh dati
- [Upload Troubleshooting](guides/upload-troubleshooting.md) - Risoluzione problemi upload

### Feature Guides
- [Regions Feature](guides/regions-feature.md) - Integrazione codici regionali ISTAT e visualizzazione confini

## 🧩 Components
Documentazione specifica dei componenti del sistema.

### Componenti Principali
- [Lemmario Dashboard](components/lemmario-dashboard.md) - Documentazione tecnica completa del frontend Next.js
- [Dashboard Features](components/dashboard-features.md) - Funzionalità e componenti della dashboard
- [Map Clustering Behavior](components/map-clustering-behavior.md) - Clustering sulla mappa geografica
- [Timeline Component](components/timeline-component.md) - Componente timeline storica
- [Popup System](components/popup-system.md) - Sistema popup mappa con accordion

### Componenti UI
- [Header](components/header.md) - Header con navigazione e branding
- [Filters](components/filters.md) - Filtri categoria e periodo con multi-select
- [Search Bar](components/search-bar.md) - Ricerca autocompletante con debounce
- [Alphabetical Index](components/alphabetical-index.md) - Indice alfabetico A-Z
- [Lemma Detail](components/lemma-detail.md) - Pannello dettaglio forme e occorrenze
- [Metrics Summary](components/metrics-summary.md) - Metriche aggregate dashboard

## ⚙️ Project
Meta-documentazione del progetto e roadmap.

- [Roadmap](project/ROADMAP.md) - Piano sviluppo futuro (37 items, 6 release)
- [Changelog](project/CHANGELOG.md) - Registro delle modifiche
- [Contributing](project/CONTRIBUTING.md) - Linee guida per contribuire
- [Bugs and Features](project/bugs-and-features.md) - Tracking di bug e funzionalità
- [Copilot Instructions](project/copilot-instructions.md) - Istruzioni per l'AI assistant
- [Feedback Analysis](project/feedback_analysis_20251224.md) - Analisi feedback utenti

## 🔒 Security
Documentazione relativa a sicurezza e protezione dati.

- [Data Security](security/DATA_SECURITY.md) - Setup protezione dati e file sensibili
- [Security Config](security/SECURITY_CONFIG.md) - Configurazione security (Nginx, JWT, API keys)
- [Security Executive Summary](security/SECURITY_EXEC_SUMMARY.md) - Sommario esecutivo per stakeholder

---

## 📋 Cronologia Consolidamento

**17 Gennaio 2026 - v2.0**: Completato consolidamento documentazione
- ✅ Eliminati 18 file ridondanti
- ✅ Consolidati 7 file in 4 documenti
- ✅ Creati 10 nuovi documenti (ROADMAP + 6 componenti + 3 feature docs)
- ✅ Copertura componenti: 3 → 10 (333% incremento)
- ✅ Documenti totali: 62 → ~48 (-23%)

## 🔍 Navigazione Rapida

**Per Utenti Finali**:
- [Quick Start](guides/quick-start.md) → [User Guide](guides/user-guide.md)

**Per Sviluppatori**:
- [System Architecture](architecture/system-architecture.md) → [Lemmario Dashboard](components/lemmario-dashboard.md) → [Quick Commands](guides/quick-commands.md)

**Per DevOps**:
- [Deployment Guide](guides/deployment-guide.md) → [GitHub Actions](guides/github-actions.md) → [Security Config](security/SECURITY_CONFIG.md)

**Per Tester**:
- [Testing Guide](guides/testing.md) → [Test Checklist](guides/test-checklist.md)

**Per Project Manager**:
- [Roadmap](project/ROADMAP.md) → [Bugs and Features](project/bugs-and-features.md) → [Changelog](project/CHANGELOG.md)
