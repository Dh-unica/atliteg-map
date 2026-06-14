# Piano di riordino documentazione ATLITEG

Data: 2026-04-15
Branch analizzato: `master`
Ambito: documentazione Markdown del repository (esclusi file di istruzioni per agenti AI)

## Obiettivo

Rendere la documentazione:
- chiara per figure non tecniche
- affidabile per figure tecniche
- non ridondante
- manutenibile nel tempo con una fonte unica per ogni tema

## Legenda stato aggiornamento

- `Aggiornato`: coerente con codice e operativita corrente
- `Parzialmente aggiornato`: utile ma con sezioni datate, incomplete o link da correggere
- `Obsoleto`: non coerente con architettura/comandi/flow correnti
- `Difficile da verificare`: documento storico o strategico, non direttamente validabile sul runtime

## Valutazione per documento

### 1) Root e indice principale

| Documento | Stato | Superfluo / Doppioni | Documenti simili | Azione proposta |
|---|---|---|---|---|
| `README.md` | Parzialmente aggiornato | Parziale doppione indice docs | `docs/README.md` | Snellire a landing + link a percorsi Utenti/Tecnici |
| `DEPLOY_MULTIDOMAIN.md` | Parzialmente aggiornato | Doppione parziale | `docs/guides/multi-domain-deployment.md` | Tenere un solo canonico e trasformare l'altro in redirect |

### 2) Meta-documentazione in `docs/`

| Documento | Stato | Superfluo / Doppioni | Documenti simili | Azione proposta |
|---|---|---|---|---|
| `docs/README.md` | Parzialmente aggiornato | No | `README.md` | Mantenere come indice ufficiale, con etichette Operativo/Storico |
| `docs/ANALISI_DOCUMENTAZIONE.md` | Difficile da verificare | Parzialmente superfluo (storico) | `docs/TABELLA_STATO_DOCUMENTAZIONE.md` | Spostare in `docs/archive/` |
| `docs/IMPLEMENTAZIONE_COMPLETATA.md` | Difficile da verificare | Parzialmente superfluo (storico) | `docs/SOMMARIO_AGGIORNAMENTO_DOCS.md` | Spostare in `docs/archive/` |
| `docs/SOMMARIO_AGGIORNAMENTO_DOCS.md` | Difficile da verificare | Parzialmente superfluo (storico) | `docs/IMPLEMENTAZIONE_COMPLETATA.md` | Spostare in `docs/archive/` |
| `docs/TABELLA_STATO_DOCUMENTAZIONE.md` | Parzialmente aggiornato | Doppione parziale audit | `docs/ANALISI_DOCUMENTAZIONE.md` | Integrare nel nuovo piano, poi archiviare |

### 3) Architettura (`docs/architecture/`)

| Documento | Stato | Superfluo / Doppioni | Documenti simili | Azione proposta |
|---|---|---|---|---|
| `docs/architecture/README.md` | Parzialmente aggiornato | No | `docs/README.md` | Aggiornare indice locale con file realmente operativi |
| `docs/architecture/system-architecture.md` | Obsoleto | No | `docs/components/lemmario-dashboard.md` | Riscrivere come single source of truth architetturale |
| `docs/architecture/backend-api-design.md` | Parzialmente aggiornato | Doppione parziale API | `docs/guides/api-reference.md` | Mantenere tecnico, eliminare conflitti e link rotti |
| `docs/architecture/dataset-specification.md` | Difficile da verificare | No | guide upload/regioni | Verifica campi effettivi e semplificazione |
| `docs/architecture/requirements.md` | Parzialmente aggiornato | Doppione parziale roadmap | `docs/project/ROADMAP.md` | Tenere requisiti stabili, togliere riferimenti legacy |
| `docs/architecture/performance.md` | Parzialmente aggiornato | Doppione parziale runbook tecnico | guide deployment/testing | Aggiornare comandi reali e metriche minime attese |
| `docs/architecture/motion-system.md` | Parzialmente aggiornato | Doppione parziale UX tecnica | `docs/architecture/dynamic-graphics.md` | Accorpare in una sola guida tecnica UI motion |
| `docs/architecture/dynamic-graphics.md` | Difficile da verificare | Doppione parziale motion | `docs/architecture/motion-system.md` | Accorpare o archiviare se solo progettuale |

### 4) Componenti (`docs/components/`)

| Documento | Stato | Superfluo / Doppioni | Documenti simili | Azione proposta |
|---|---|---|---|---|
| `docs/components/lemmario-dashboard.md` | Parzialmente aggiornato | Doppione parziale architettura | `docs/architecture/system-architecture.md` | Tenere come guida tecnica frontend |
| `docs/components/dashboard-features.md` | Parzialmente aggiornato | Doppione parziale user guide | `docs/guides/user-guide.md` | Ridurre e mantenere solo dettagli tecnici |
| `docs/components/map-clustering-behavior.md` | Aggiornato | No | `docs/components/popup-system.md` | Mantenere |
| `docs/components/popup-system.md` | Parzialmente aggiornato | Doppione parziale map | `docs/components/map-clustering-behavior.md` | Aggiornare e collegare alla doc map |
| `docs/components/timeline-component.md` | Parzialmente aggiornato | Doppione parziale UX | `docs/guides/user-guide.md` | Mantenere tecnico, ridurre descrizioni utente |
| `docs/components/filters.md` | Parzialmente aggiornato | Doppione parziale UX | `docs/guides/user-guide.md` | Integrare in guida UI tecnica o user guide |
| `docs/components/header.md` | Parzialmente aggiornato | Possibile superfluo | `docs/components/dashboard-features.md` | Accorpare |
| `docs/components/search-bar.md` | Parzialmente aggiornato | Doppione parziale UX | `docs/guides/user-guide.md` | Accorpare |
| `docs/components/alphabetical-index.md` | Parzialmente aggiornato | Doppione parziale UX | `docs/guides/user-guide.md` | Accorpare |
| `docs/components/lemma-detail.md` | Parzialmente aggiornato | Doppione parziale UX | `docs/guides/user-guide.md` | Accorpare |
| `docs/components/metrics-summary.md` | Parzialmente aggiornato | Doppione parziale UX | `docs/components/dashboard-features.md` | Accorpare |

### 5) Guide (`docs/guides/`)

| Documento | Stato | Superfluo / Doppioni | Documenti simili | Azione proposta |
|---|---|---|---|---|
| `docs/guides/quick-start.md` | Obsoleto | Doppione quick start | `lemmario-dashboard/QUICK_START.md` | Sostituire con quick start unico aggiornato |
| `docs/guides/user-guide.md` | Parzialmente aggiornato | No | component docs UI | Mantenere per non tecnici, semplificare linguaggio |
| `docs/guides/nota-componente-tecnica-atlante.md` | Parzialmente aggiornato | Doppione divulgativo parziale | user guide + architecture | Tenere come materiale divulgativo separato |
| `docs/guides/deployment-guide.md` | Obsoleto | Doppione parziale deploy | `docs/guides/github-actions.md` | Riscrivere runbook deploy reale |
| `docs/guides/testing.md` | Parzialmente aggiornato | Doppione parziale test | `docs/guides/test-checklist.md` | Unificare in un unico documento test |
| `docs/guides/test-checklist.md` | Parzialmente aggiornato | Doppione parziale test | `docs/guides/testing.md` | Unificare in un unico documento test |
| `docs/guides/github-actions.md` | Parzialmente aggiornato | Doppione parziale CI | `docs/guides/github-actions-secrets.md` | Tenere, ma separare setup vs segreti |
| `docs/guides/github-actions-secrets.md` | Parzialmente aggiornato | No | `docs/guides/github-actions.md` | Tenere come appendice sicurezza CI |
| `docs/guides/multi-domain-deployment.md` | Parzialmente aggiornato | Doppione parziale | `DEPLOY_MULTIDOMAIN.md` | Tenere come canonico (consigliato) |
| `docs/guides/ci-cd-fix-jan2026.md` | Difficile da verificare | Storico | `docs/project/CHANGELOG.md` | Spostare in `docs/archive/incidenti/` |
| `docs/guides/quick-commands.md` | Parzialmente aggiornato | Doppione parziale quick start | quick start, deployment | Tenere come cheat sheet tecnico |
| `docs/guides/api-reference.md` | Obsoleto | Doppione/in conflitto | `docs/architecture/backend-api-design.md` | Riscrivere o inglobare nel backend-api-design |
| `docs/guides/CSV_UPLOAD_GUIDE.md` | Parzialmente aggiornato | Doppione upload | `upload-refresh-guide.md`, `upload-troubleshooting.md` | Unificare in runbook Data Operations |
| `docs/guides/upload-refresh-guide.md` | Aggiornato | Doppione upload | `CSV_UPLOAD_GUIDE.md` | Unificare in runbook Data Operations |
| `docs/guides/upload-troubleshooting.md` | Aggiornato | Doppione upload | `CSV_UPLOAD_GUIDE.md` | Unificare in runbook Data Operations |
| `docs/guides/data-sync.md` | Parzialmente aggiornato | Doppione parziale data ops | guide upload | Integrare nel runbook Data Operations |
| `docs/guides/region-codes.md` | Parzialmente aggiornato | Doppione parziale feature regioni | `docs/guides/regions-feature.md` | Accorpare in appendice tecnica |
| `docs/guides/regions-feature.md` | Aggiornato | No | `docs/guides/region-codes.md` | Mantenere |
| `docs/guides/backend-only-test-report.md` | Parzialmente aggiornato | Storico | testing docs | Archiviare come report storico |
| `docs/guides/seo-implementation.md` | Parzialmente aggiornato | Doppione parziale README | `README.md` | Mantenere tecnico, ridurre parti introduttive |

### 6) Improvement (`docs/improvement/`)

| Documento | Stato | Superfluo / Doppioni | Documenti simili | Azione proposta |
|---|---|---|---|---|
| `docs/improvement/MAPCN_README.md` | Difficile da verificare | No (storico decisionale) | altri `MAPCN_*` | Spostare in area research/archive |
| `docs/improvement/MAPCN_INTEGRATION_ANALYSIS.md` | Difficile da verificare | No (storico decisionale) | altri `MAPCN_*` | Spostare in area research/archive |
| `docs/improvement/MAPCN_INTEGRATION_SUMMARY.md` | Difficile da verificare | Doppione summary | `MAPCN_INTEGRATION_ANALYSIS.md` | Mantenere solo 1 summary + 1 analisi |
| `docs/improvement/MAPCN_CODE_COMPARISON.md` | Difficile da verificare | No | altri `MAPCN_*` | Archiviare |
| `docs/improvement/MAPCN_DECISION_TREE.md` | Difficile da verificare | Doppione decisionale | `MAPCN_INTEGRATION_SUMMARY.md` | Archiviare o accorpare |
| `docs/improvement/MAPCN_POC_EXAMPLE.md` | Difficile da verificare | No | altri `MAPCN_*` | Archiviare |

### 7) Project (`docs/project/`)

| Documento | Stato | Superfluo / Doppioni | Documenti simili | Azione proposta |
|---|---|---|---|---|
| `docs/project/ROADMAP.md` | Difficile da verificare | Doppione parziale requisiti | `docs/architecture/requirements.md` | Mantenere come pianificazione |
| `docs/project/CHANGELOG.md` | Parzialmente aggiornato | No | `docs/guides/ci-cd-fix-jan2026.md` | Mantenere, con note legacy esplicite |
| `docs/project/CONTRIBUTING.md` | Obsoleto | Doppione setup | quick start/development docs | Riscrivere su workflow reale |
| `docs/project/bugs-and-features.md` | Difficile da verificare | Doppione backlog | roadmap/feedback | Mantenere solo se usato attivamente |
| `docs/project/feedback_analysis_20251224.md` | Difficile da verificare | Storico | bugs-and-features | Archiviare |
| `docs/project/copilot-instructions.md` | Escluso (AI-only) | Superfluo per docs utente | `.github/copilot-instructions.md` | Tenere fuori dall'indice pubblico |

### 8) Security (`docs/security/`)

| Documento | Stato | Superfluo / Doppioni | Documenti simili | Azione proposta |
|---|---|---|---|---|
| `docs/security/DATA_SECURITY.md` | Parzialmente aggiornato | Doppione parziale security setup | `SECURITY_CONFIG.md` | Accorpare in Security Handbook |
| `docs/security/SECURITY_CONFIG.md` | Parzialmente aggiornato | Doppione parziale security setup | `DATA_SECURITY.md` | Tenere come base tecnica |
| `docs/security/SECURITY_EXEC_SUMMARY.md` | Parzialmente aggiornato | Doppione summary | altri security docs | Mantenere versione breve non tecnica |

### 9) Altri Markdown utili fuori `docs/`

| Documento | Stato | Superfluo / Doppioni | Documenti simili | Azione proposta |
|---|---|---|---|---|
| `lemmario-dashboard/QUICK_START.md` | Obsoleto | Doppione quick start | `docs/guides/quick-start.md` | Eliminare o trasformare in link al quick start canonico |
| `scripts/README.md` | Parzialmente aggiornato | No | region/data docs | Aggiornare elenco script reali |

## Aree non coperte (gap)

## 1) Area informativa (non tecnica)

- Manca una guida corta "inizia da qui" per utenti finali
- Manca una FAQ in linguaggio semplice
- Manca un processo editoriale dati (chi aggiorna, chi valida, chi pubblica)

## 2) Area tecnica (per tecnici)

- Manca una fonte unica su architettura reale aggiornata
- Manca un runbook unico deploy + rollback + incident response
- Manca una matrice centralizzata versioni/runtime/env

## Piano di riordino operativo

### Fase 0 - Governance (Priorita: Alta)

- Definire ownership per cartella docs (`owner` tecnico + owner contenuti)
- Definire policy stato documento: Operativo / Tecnico / Storico
- Definire regola "una fonte canonica per tema"

### Fase 1 - Stabilizzazione indice (Priorita: Alta)

- Rifare `docs/README.md` come indice ufficiale
- Ridurre `README.md` root a landing sintetica
- Taggare ogni link con etichetta: `[Non tecnico]`, `[Tecnico]`, `[Storico]`

### Fase 2 - Correzioni critiche (Priorita: Alta)

Aggiornare subito i documenti critici:
- `docs/architecture/system-architecture.md`
- `docs/guides/deployment-guide.md`
- `docs/guides/api-reference.md`
- `docs/project/CONTRIBUTING.md`
- `docs/guides/quick-start.md`

### Fase 3 - Accorpamenti (Priorita: Media)

- Multi-domain: 1 solo documento canonico
- Data operations: unificare upload + refresh + troubleshooting + data-sync
- Testing: unificare `testing.md` + `test-checklist.md`
- Security: accorpare `DATA_SECURITY.md` e `SECURITY_CONFIG.md` con summary separata

### Fase 4 - Percorso non tecnico (Priorita: Media)

Creare `docs/info/`:
- `docs/info/START-HERE.md` (non tecnico)
- `docs/info/guida-utente-breve.md` (non tecnico)
- `docs/info/faq.md` (non tecnico)

Ogni documento tecnico dovra avere intestazione esplicita:
- "Questa documentazione e tecnica ed e destinata a sviluppatori/devops."

### Fase 5 - Archivio storico (Priorita: Bassa)

- Creare `docs/archive/`
- Spostare report/audit storici e documenti di decisione passata
- Aggiungere banner iniziale: "Documento storico, non operativo"

## Struttura finale consigliata

```text
docs/
  README.md
  info/
    START-HERE.md
    guida-utente-breve.md
    faq.md
  architecture/
    system-architecture.md
    backend-api-design.md
    dataset-specification.md
  guides/
    quick-start.md
    deployment-runbook.md
    data-operations.md
    testing.md
    github-actions.md
    multi-domain-deployment.md
  components/
    map-clustering-behavior.md
    popup-system.md
    timeline-component.md
    lemmario-dashboard.md
  security/
    security-handbook.md
    security-exec-summary.md
  project/
    ROADMAP.md
    CHANGELOG.md
    CONTRIBUTING.md
  archive/
    ...
```

## Piano temporale suggerito

- Settimana 1: Fasi 0-1 (governance + indice)
- Settimana 2: Fase 2 (fix critici)
- Settimana 3: Fase 3 (accorpamenti)
- Settimana 4: Fasi 4-5 (percorso non tecnico + archivio)

## Criteri di accettazione

- 0 link rotti nell'indice principale
- ogni tema ha 1 documento canonico
- percorso non tecnico completo in massimo 3 click da `README.md`
- documenti tecnici marcati chiaramente come tecnici
- documenti storici separati dall'operativo
