---
status: "[STORICO]"
last-updated: 2026-06-14
owner: Historian
---

# 📦 Archive — Documenti Storici

Tutti i documenti in questa cartella sono **storici** e **non operativi**. Rappresentano:

- Decisioni passate e loro analisi
- Report di incidenti e problemi risolti
- Configurazioni e design obsoleti
- Feedback e feature proposte (archiviate)

## Organizzazione

```
archive/
  ├── analysis/           # Analisi decisionali passate (MAPCN, evaluations)
  ├── incidents/          # Report di incidenti e problemi
  ├── planning/           # Piani e report di riordino documentazione
  ├── testing/            # Report test storici
  ├── security/           # Configurazioni security legacy
  ├── project/            # Feedback, bugs tracking, AI instructions
  └── README.md           # Questo file
```

## Contenuto Archiviato (Phase 4-5)

- `analysis/`: documenti `MAPCN_*` spostati da `docs/improvement/`
- `incidents/`: `ci-cd-fix-jan2026.md`
- `planning/`: `PIANO_RIORDINO_DOCUMENTAZIONE.md`, `ANALISI_DOCUMENTAZIONE.md`, `TABELLA_STATO_DOCUMENTAZIONE.md`, `IMPLEMENTAZIONE_COMPLETATA.md`, `SOMMARIO_AGGIORNAMENTO_DOCS.md`
- `testing/`: `backend-only-test-report.md`

## Come leggere documenti qui

1. **Verificare la data** — Capire il contesto storico
2. **Controllare il contesto** — Quale problema risolvevano?
3. **NON usare per operazioni** — Sono obsoleti
4. **Usare per capire decisioni** — Utili per capire perché il codice è così

## Criteri di archiviazione

Un documento viene archiviato quando:
- ✅ Non è più operativo (versione nuova esiste in docs/)
- ✅ È un report storico (incidente, analisi passata)
- ✅ È un feedback/proposta non implementata
- ✅ È un design precedente rimpiazzato

## Per chi cerca informazioni

- **Sviluppatore nuovo**: Leggi i documenti **operativi** in [docs/](../README.md), non qui
- **Storico del progetto**: Benvenuto! Questa è la fonte di verità per il contesto
- **Decisore**: Leggi il [GOVERNANCE.md](../GOVERNANCE.md) per policy attuali

---

Ultima sincronizzazione: 14 giugno 2026
