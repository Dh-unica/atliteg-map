---
status: "[OPERATIVO]"
last-updated: 2026-06-14
owner: Tech Lead
---

# 📚 Indice Documentazione Atliteg

**Versione**: 3.0 (Governanza)  
**Ultima Modifica**: 14 Giugno 2026  
**Stato**: Aggiornato - Governance Stabilita

Benvenuto nella documentazione ufficiale del progetto Atliteg. Qui troverai tutte le risorse necessarie per comprendere, sviluppare e mantenere il progetto.

**Legenda**:  
`[Non tecnico]` — Accessibile senza background tech  
`[Tecnico]` — Richiede conoscenza tecnica  
`[STORICO]` — Documento di riferimento, non operativo

---

## 🏗️ Architecture
Documenti di design, specifiche tecniche e requisiti del sistema.

- [System Architecture](architecture/system-architecture.md) `[Tecnico]` — Panoramica completa architettura; **SINGLE SOURCE OF TRUTH**
- [Backend API Design](architecture/backend-api-design.md) `[Tecnico]` — Design e implementazione API backend
- [Dataset Specification](architecture/dataset-specification.md) `[Tecnico]` — Specifiche dati e formati
- [Requirements](architecture/requirements.md) `[Tecnico]` — Requisiti funzionali e non funzionali
- [Performance](architecture/performance.md) `[Tecnico]` — Analisi e ottimizzazione performance

**Archivio**: Motion system e Dynamic graphics → [archive/](../archive/)

## 📘 Guides
Manuali utente, guide per sviluppatori, setup e procedure operative.

### 🚀 Getting Started
- [Quick Start](guides/quick-start.md) `[Non tecnico]` — Guida rapida per iniziare (source unica)
- [User Guide](guides/user-guide.md) `[Non tecnico]` — Manuale completo per utenti

### ⚙️ Deployment & Operations (Runbook)
- [Deployment Runbook](guides/deployment-runbook.md) `[Tecnico]` — Procedura deploy, rollback, incident response (**canonico**)
- [Multi-Domain Deployment](guides/multi-domain-deployment.md) `[Tecnico]` — Setup DNS e certificate multi-dominio
- [GitHub Actions](guides/github-actions.md) `[Tecnico]` — Configurazione CI/CD e secrets
- [Data Operations](guides/data-operations.md) `[Tecnico]` — Upload CSV, refresh, troubleshooting (**canonico**)

### 🧪 Testing & QA
- [Testing Guide](guides/testing.md) `[Tecnico]` — Guida esecuzione test (**canonico**)
- [Quick Commands](guides/quick-commands.md) `[Tecnico]` — Cheat sheet comandi frequenti

### 📚 Reference & Features
- [API Reference](guides/api-reference.md) `[Tecnico]` — Quickref API (→ backend-api-design per dettagli)
- [Regions Feature](guides/regions-feature.md) `[Tecnico]` — Codici ISTAT e visualizzazione confini
- [SEO Implementation](guides/seo-implementation.md) `[Tecnico]` — Strategia SEO/AEO/GEO

### 🎓 Divulgazione Tecnica
- [Nota Componente Tecnica Atlante](guides/nota-componente-tecnica-atlante.md) `[Non tecnico]` — Sintesi per presentazioni e seminari
- [Nota Componente Tecnica Atlante HTML](guides/nota-componente-tecnica-atlante.html) `[Non tecnico]` — Versione slide con diagrammi

## 🧩 Components
Documentazione tecnica dei componenti del sistema.

### Frontend Architecture
- [Lemmario Dashboard](components/lemmario-dashboard.md) `[Tecnico]` — Documentazione tecnica Next.js/React frontend
- [Map Clustering Behavior](components/map-clustering-behavior.md) `[Tecnico]` — Clustering e visualizzazione mappa Leaflet
- [Timeline Component](components/timeline-component.md) `[Tecnico]` — Componente timeline storica
- [Popup System](components/popup-system.md) `[Tecnico]` — Sistema popup mappa con accordion

**UI Components**: [Header](components/header.md), [Filters](components/filters.md), [Search](components/search-bar.md), [Alphabetical Index](components/alphabetical-index.md), [Lemma Detail](components/lemma-detail.md), [Metrics](components/metrics-summary.md) → Consolidati in `lemmario-dashboard.md`

**Dashboard Features**: [Dashboard Features](components/dashboard-features.md) → Consolidato in user guide + lemmario-dashboard.md

## ⚙️ Project
Meta-documentazione del progetto, roadmap e governance.

- [Governance Documentation](GOVERNANCE.md) `[Tecnico]` — Policy stato, ownership, naming conventions
- [Roadmap](project/ROADMAP.md) `[Tecnico]` — Piano sviluppo futuro (37 items, 6 release)
- [Changelog](project/CHANGELOG.md) `[Tecnico]` — Registro modifiche (con note legacy)
- [Contributing](project/CONTRIBUTING.md) `[Tecnico]` — Workflow sviluppo e PR standards

**Archivio**: Feedback analysis, bugs tracking → [archive/project/](../archive/)

## 🔒 Security
Documentazione relativa a sicurezza e protezione dati.

- [Security Handbook](security/security-handbook.md) `[Tecnico]` — Guida completa security (**canonico**)
- [Security Executive Summary](security/SECURITY_EXEC_SUMMARY.md) `[Non tecnico]` — Riepilogo per stakeholder non tecnici

**Archivio**: Data Security (legacy), Security Config (legacy) → [archive/security/](../archive/)

---

## 💡 Info — Percorso Non Tecnico
Per utenti, stakeholder e decisori senza background tecnico.

- [Start Here](info/START-HERE.md) `[Non tecnico]` — Da qui iniziare (landing rapida)
- [Guida Utente Breve](info/guida-utente-breve.md) `[Non tecnico]` — Come usare ATLITEG (3 min read)
- [FAQ](info/faq.md) `[Non tecnico]` — Risposte a domande frequenti

---

## 📦 Archive — Documenti Storici
Decisioni passate, report di incidenti, design obsoleti.

Tutti i documenti qui sono taggati `[STORICO]` e non operativi.

- [Analysis & Planning](archive/) `[STORICO]` — Analisi storiche (es. MAPCN, feedback analysis)
- [CI/CD Incidents](archive/ci-cd-fix-jan2026.md) `[STORICO]` — Incident report 2026
- [Security Legacy](archive/security/) `[STORICO]` — Config e design security passati
- [Project Legacy](archive/project/) `[STORICO]` — Feedback, bugs tracking, copilot instructions

---

## 📋 Cronologia Consolidamento

**17 Gennaio 2026 - v2.0**: Completato consolidamento documentazione
- ✅ Eliminati 18 file ridondanti
- ✅ Consolidati 7 file in 4 documenti
- ✅ Creati 10 nuovi documenti (ROADMAP + 6 componenti + 3 feature docs)
- ✅ Copertura componenti: 3 → 10 (333% incremento)
- ✅ Documenti totali: 62 → ~48 (-23%)

**14 Giugno 2026 - v3.0 (Governance)**: Stabilizzazione governance
- ✅ Creato GOVERNANCE.md (policy e ownership)
- ✅ Indice taggato per ruolo (non tecnico / tecnico / storico)
- ✅ Identificati documenti canonici per tema
- ✅ Creata sezione Info (percorso non tecnico)
- ✅ Documentazione legacy spostata in Archive

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
