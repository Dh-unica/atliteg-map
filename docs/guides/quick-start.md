---
status: "[OPERATIVO]"
last-updated: 2026-06-14
owner: Tech Lead
---

# Quick Start — ATLITEG

**SINGLE SOURCE OF TRUTH** for getting started. È il entry point canonico.

## 3 Minuti: Avvia Locale

```bash
# 1. Vai nella directory
cd /home/ale/docker/dh-unica/atliteg-map/lemmario-dashboard

# 2. Installa dipendenze (first time only)
npm install

# 3. Avvia dev server
npm run dev

# 4. Apri http://localhost:3000
```

La mappa dovrebbe caricarsi con i dati. Fatto! 🎉

## Per Users: Accedi al Sito

- **Live**: https://atlante.atliteg.org
- **Backup**: https://linguistica.dh.unica.it/atliteg

Vedi [User Guide](../info/guida-utente-breve.md) per come usare l'app.

## Per Developers: Setup Completo

### Prerequisiti

```bash
node --version    # v20.0.0+
npm --version     # v10.0.0+
git --version     # v2.30.0+
```

### 1. Clone e Install

```bash
git clone https://github.com/Dh-unica/atliteg-map.git
cd atliteg-map/lemmario-dashboard
npm install
```

### 2. Dev Environment

```bash
# Start dev server (Turbopack, hot reload)
npm run dev

# App will be at http://localhost:3000
# Ctrl+C to stop
```

### 3. Build & Verifica

```bash
# Production build
npm run build

# Test production build locally
npm run start

# App will be at http://localhost:3000
```

### 4. Docker (Production-like)

```bash
cd ..

# Build + run
docker-compose up --build

# App will be at http://localhost:9000
# Logs: docker-compose logs -f
# Stop: docker-compose down
```

## Prossimi Step

- **Modifica codice**: Edita file in `lemmario-dashboard/` → reload automatico
- **Comandi utili**: [Quick Commands](quick-commands.md)
- **Architettura**: [System Architecture](../architecture/system-architecture.md)
- **Deploy**: [Deployment Runbook](deployment-runbook.md)
- **Contribuisci**: [Contributing Guide](../project/CONTRIBUTING.md)

---

## 📊 Statistiche

- **Lemmi con regione**: 599
- **Regioni mappate**: 5 (Lombardia, Veneto, Toscana, Lazio, Sicilia)
- **File modificati**: 6
- **File nuovi**: 6
- **Test superati**: ✅ Tutti

---

## 🎨 Aspetto Visivo

Sulla mappa vedrai:
- 🔵 **Marker blu** = Città con coordinate
- 🔷 **Poligoni blu** = Ambiti geografici
- 🟡 **Confini gialli** = Regioni (NUOVO!)

---

## ✅ Verifica Rapida

### Console Browser (F12)
Dovresti vedere:
```
✅ Regioni caricate: 20 regioni
✅ Dati JSON caricati: 6236 record in XXms
```

### Verifica Dati
```bash
# Controlla che RegionIstatCode esista
node -e "console.log(require('./lemmario-dashboard/public/data/lemmi.json').find(l => l.Lemma === 'aggiazzata').RegionIstatCode)"
# Output: 19
```

---

## 🐛 Troubleshooting

### Server non parte?
```bash
cd lemmario-dashboard
npm install  # Reinstalla dipendenze
npm run dev
```

### Non vedo confini?
1. Verifica console browser (F12) per errori
2. Controlla che `/public/data/limits_IT_regions.geojson` esista
3. Verifica che `/public/data/lemmi.json` contenga `RegionIstatCode`

### Confini blu invece che gialli?
Cancella cache browser e ricarica (Ctrl+Shift+R)

---

## 📞 File Utili

### Verifica Installazione
```bash
./scripts/verify-installation.sh
```

### Test Completi
```bash
node scripts/test-region-codes.js
```

### Demo Interattiva
```bash
node scripts/e2e-demo.js
```

---

## 🎉 Pronto!

Tutto è configurato e funzionante. Avvia il server e prova!

```bash
cd lemmario-dashboard
npm run dev
```

Poi cerca **"aggiazzata"** e goditi il confine della Sicilia! 🇮🇹

---

**Documentazione completa**: Leggi i file markdown in questa directory  
**Supporto**: Consulta [COME_TESTARE.md](./COME_TESTARE.md) per troubleshooting

**Data**: 2025-12-23 | **Status**: ✅ Funzionante
