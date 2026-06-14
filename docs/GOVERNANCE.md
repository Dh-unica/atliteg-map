# Governance Documentazione Atliteg

**Data**: 14 giugno 2026  
**Versione**: 1.0

## Policy Stato Documento

Ogni documento deve essere taggato esplicitamente con **UNO** di questi stati:

| Stato | Significato | Aggiornamento | Chi legge |
|-------|-------------|--------------|-----------|
| `[OPERATIVO]` | Riflette l'architettura/workflow corrente | Entro 2 settimane da changes critici | Tutti |
| `[TECNICO]` | Documento di design/proposal tecnico, non dipende da runtime | Quando decision cambia | Sviluppatori |
| `[STORICO]` | Documento decisionale/report passato, non operativo | No, referenza sola | Ricercatori/Archivisti |

**Regola binaria**: Se un documento non è taggato, è considerato **OBSOLETO** e deve essere rimosso o taggato.

---

## Ownership per Cartella

| Cartella | Owner | Backup | Policy |
|----------|-------|--------|--------|
| `docs/architecture/` | Tech Lead | Maintainer | Review PR: Design + Code alignment check |
| `docs/guides/` | DevOps/Tech Lead | Tech Lead | Review PR: Commands tested + Links verified |
| `docs/components/` | Frontend Lead | Tech Lead | Review PR: Code snippet consistency |
| `docs/project/` | Project Manager | Tech Lead | Review PR: Dates + Status consistency |
| `docs/security/` | Security Owner | Tech Lead | Review PR: Threat model + Config checks |
| `docs/info/` | UX Writer | Tech Lead | Review PR: Language clarity + No jargon |
| `docs/archive/` | Historian | Tech Lead | Review PR: Metadata + Search keywords |

---

## Una Fonte Canonica Per Tema

**Principio**: Ogni tema ha **UN SOLO** documento operativo autorità.

### Mappa Temi → Documento Canonico

| Tema | Documento Canonico | Alternati | Azione |
|------|-------------------|-----------|--------|
| Architettura sistema | `docs/architecture/system-architecture.md` | `docs/components/lemmario-dashboard.md` (dettagli frontend) | system-architecture è master; frontend rinvia a essa |
| Deployment | `docs/guides/deployment-runbook.md` | `DEPLOY_MULTIDOMAIN.md` (legacy) | Mantenere runbook unico; DEPLOY_MULTIDOMAIN rinvia |
| Data operations | `docs/guides/data-operations.md` | `CSV_UPLOAD_GUIDE.md`, `data-sync.md` (legacy) | Data-operations è master; altri rinviano |
| Testing | `docs/guides/testing.md` | `test-checklist.md` (legacy) | Testing è master; checklist è appendice |
| Security | `docs/security/security-handbook.md` | `DATA_SECURITY.md`, `SECURITY_CONFIG.md` (legacy) | Handbook è master; altri archiviati |
| Feature regioni | `docs/guides/regions-feature.md` | `region-codes.md` (legacy) | Regions-feature è master; codes è appendice |
| API Backend | `docs/architecture/backend-api-design.md` | `docs/guides/api-reference.md` (legacy) | Backend-api-design è master; reference è quickref |
| Quick Start | `docs/guides/quick-start.md` | `lemmario-dashboard/QUICK_START.md` (legacy) | Unico canonico; local file rinvia |

---

## Convenzioni Naming

### Branch

```
docs/<phase-or-theme>-phase<X>-Y
docs/governance-structure-phase0-1
docs/critical-fixes-phase2
docs/data-operations-accorpamento-phase3
```

### Commit

```
docs: <tema> — <descrizione sintetica>

es:
docs: governance and structure — add governance.md, restructure readme indexes
docs: critical fixes — update system-architecture, deployment, contributing
```

### PR Title

```
docs(phase-X): <descrizione>

es:
docs(phase 0-1): governance, structure, and documentation reorganization
docs(phase 2): critical documentation updates
```

---

## Linee Guida Redazione

### Header Obbligatorio per Documenti Operativi

```markdown
---
status: [OPERATIVO|TECNICO|STORICO]
last-updated: YYYY-MM-DD
owner: <name/role>
---

# Titolo Documento
```

### Tagging Link in Indice

```markdown
- [User Guide](guides/user-guide.md) `[Non tecnico]` — Manuale utente
- [System Architecture](architecture/system-architecture.md) `[Tecnico]` — Architettura
- [CI/CD Fix Jan 2026](../archive/ci-cd-fix-jan2026.md) `[STORICO]` — Report incidente
```

### Link Rotti: Policy

- **Discovery**: Link checker automatico su PR (pre-merge)
- **Fix**: PR author deve correggere prima di merge
- **Azioni**:
  - Link target non esiste → Creare target o rimuovere link
  - Link errato → Correggere percorso
  - Documento mosso → Aggiornare link ovunque

---

## Ciclo di Vita Documento

```
BOZZA → REVIEW (24h) → OPERATIVE/STAGING → [AGING CHECK ogni 6 mesi] → OBSOLETO/ARCHIVE
```

### Aging Check (ogni 6 mesi)

- Seleziona docs con `[OPERATIVO]`
- Valuta: "Codice/runtime è cambiato significativamente?"
  - Sì → Update o `[DEPRECATO]`
  - No → Estendi scadenza
- Registra data aggiornamento in header

---

## Governance Review Board (Virtuale)

| Role | Cadenza | Scope |
|------|---------|-------|
| Tech Lead | 1x settimana | Architecture + Breaking changes |
| DevOps | 1x settimana | Guides + Deployment |
| Security | 1x mese | Security + Secrets policy |
| UX Writer | Ad hoc | Info + Language clarity |

---

## Checklist Pre-Merge (obbligatorio)

- [ ] Documento taggato con status
- [ ] Header YAML con last-updated + owner
- [ ] Tutti link verificati (no link rotti)
- [ ] No doppioni con documento canonico (o rinvia)
- [ ] Linguaggio coerente con audience (tecnico/non tecnico)
- [ ] Se [OPERATIVO], comandi/screenshot verificati
- [ ] Se [STORICO], marcato esplicitamente in intro

---

## Accesso e Permessi

| Azione | Chi | Approvazione |
|--------|-----|-------------|
| Merge PR docs | Author + 1 reviewer | Tech Lead final approval |
| Spostare in archive | Author | Tech Lead (no PR needed se solo archivio) |
| Cancellare documento | Author | Tech Lead + Project Manager |
| Creare nuova cartella | Maintainer | Tech Lead (inline decision) |

---

## Obiettivi Annuali

- 0 link rotti nell'indice (check settimanale)
- 100% documenti taggati
- Nessun documento [OPERATIVO] >6 mesi senza review
- Percorso non tecnico completo (3 click max da `README.md`)
- Archive > 20 documenti storici ben catalogati
