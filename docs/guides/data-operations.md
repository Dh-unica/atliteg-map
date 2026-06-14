---
status: "[OPERATIVO]"
owner: "DevOps"
last-updated: "2026-06-14"
---

# Guida Operativa: Data Operations

Questa guida unifica tutte le operazioni sui dati: upload CSV, refresh, sincronizzazione remota.

**Destinatari**: DevOps, Amministratori

---

## 📋 Panoramica

Il sistema AtLiTeG gestisce i dati lemmi attraverso tre operazioni principali:

1. **Upload CSV** → Caricamento dati admin via API
2. **Refresh visuale** → Aggiornamento della dashboard nel browser
3. **Sincronizzazione remota** → Backup e sync tra locale e server remoto

---

## 1. Upload CSV - Caricamento Dati Admin

### Prerequisiti

- Docker e Docker Compose installati
- Applicazione AtLiTeG in esecuzione (vedi [docs/guides/deployment-guide.md](deployment-guide.md))
- Tool `curl` e `jq` installati (opzionali ma consigliati)
- File CSV con i lemmi da caricare

### Struttura CSV Attesa

Il CSV deve contenere le seguenti colonne (vedi [docs/architecture/dataset-specification.md](../architecture/dataset-specification.md)):

```csv
Lemma,Forma,Coll.Geografica,Latitudine,Longitudine,Tipo coll.Geografica,Anno,Periodo,Categoria,reg_istat_code
```

### Procedura di Upload

#### Step 1: Autenticazione Admin

```bash
TOKEN=$(curl -s -X POST http://localhost:9000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.token')

echo "Token: $TOKEN"
```

**Risposta Successo**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Risposta Errore**:
```json
{
  "success": false,
  "message": "Credenziali non valide"
}
```

#### Step 2: Upload del File CSV

```bash
curl -X POST http://localhost:9000/api/admin/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@Lemmi_forme_atliteg_updated.csv"
```

**Risposta Successo**:
```json
{
  "success": true,
  "message": "CSV processato con successo",
  "stats": {
    "total_records": 2345,
    "inserted": 2100,
    "updated": 245,
    "errors": 0
  }
}
```

#### Step 3: Verifica Upload

```bash
# Conta record totali
curl -s "http://localhost:9000/api/lemmi" \
  -H "X-API-Key: default_dev_key" | \
  python3 -c "import sys,json; print(f'Record totali: {len(json.load(sys.stdin))}')"

# Leggi i primi 5 lemmi
curl -s "http://localhost:9000/api/lemmi" \
  -H "X-API-Key: default_dev_key" | \
  python3 -c "import sys,json; data=json.load(sys.stdin); [print(d['Lemma']) for d in data[:5]]"
```

### Errori Comuni

| Errore | Causa | Soluzione |
|--------|-------|-----------|
| `Credenziali non valide` | Password sbagliata | Verifica `.env` |
| `File troppo grande` | CSV > 50MB | Dividi in file più piccoli |
| `Formato CSV non valido` | Colonne mancanti | Usa template con tutte le colonne |
| `Errore 404 su /api/admin/upload` | Endpoint non disponibile | Verifica che il backend sia attivo |

---

## 2. Refresh Visuale - Aggiornamento Dashboard

Dopo il caricamento CSV, il **browser usa cache** e non mostra i dati aggiornati immediatamente.

### Metodo 1: Hard Refresh ⭐ (CONSIGLIATO)

1. Chiudi la pagina admin
2. Vai alla homepage (`http://localhost:9000`)
3. **Forza il refresh** del browser:
   - **Windows/Linux**: `Ctrl + Shift + R` oppure `Ctrl + F5`
   - **Mac**: `Cmd + Shift + R`
4. Attendi 2-3 secondi per il caricamento
5. ✅ I nuovi dati saranno visibili!

### Metodo 2: Cancella Cache Browser

1. Apri DevTools (`F12`)
2. Vai alla tab **Application** (Chrome) o **Storage** (Firefox)
3. Click destro su cache entries → **Clear**
4. Oppure: Settings → Privacy → Clear browsing data → Cached images and files
5. Ricarica la pagina

### Metodo 3: Modalità Incognito

1. Apri una nuova finestra in **modalità incognito/privata**
2. Vai a `http://localhost:9000`
3. I dati saranno freschi (no cache)

### Metodo 4: DevTools Network (Per Sviluppatori)

1. Apri DevTools (`F12`)
2. Vai alla tab **Network**
3. Spunta "**Disable cache**"
4. Tieni i DevTools aperti
5. Ricarica la pagina

### Verifica Aggiornamento

**Verifica Visuale**:
- Controlla il **numero di lemmi** nella dashboard
- Verifica i **marker sulla mappa**
- Cerca uno dei lemmi che hai caricato

**Verifica da DevTools**:
1. Apri DevTools (`F12`)
2. Tab **Network** → Filtra per `lemmi`
3. Ricarica → Click sulla richiesta `/api/lemmi`
4. Verifica il **Response** contiene i tuoi dati

---

## 3. Sincronizzazione Remota - Sync Locale ↔ Server

Lo script `sync-data.sh` sincronizza i file nella cartella `/data` tra ambiente locale e server remoto.

### Configurazione Server

- **Host**: 90.147.144.147
- **User**: dhruby
- **Path remoto**: `/home/dhruby/docker/atliteg-map/data`
- **Path locale**: `./data`

### Prerequisiti

#### 1. Accesso SSH

```bash
ssh dhruby@90.147.144.147
```

#### 2. Configurazione SSH Senza Password (Consigliata)

```bash
# Genera chiave SSH se non ce l'hai già
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copia la chiave sul server
ssh-copy-id dhruby@90.147.144.147
```

#### 3. rsync Installato

Su Linux è generalmente già installato. Verifica:

```bash
which rsync
```

### Utilizzo

#### Visualizzare l'Aiuto

```bash
./sync-data.sh help
```

#### Confrontare i File

Prima di sincronizzare, vedi le differenze:

```bash
./sync-data.sh compare
```

Mostra:
- File presenti solo in locale
- File presenti solo in remoto  
- File modificati più recenti

#### Vedere le Dimensioni

```bash
./sync-data.sh sizes
```

#### Elencare i File

```bash
./sync-data.sh list
```

#### Creare un Backup Locale

Prima di operazioni importanti:

```bash
./sync-data.sh backup
```

Crea una copia della directory locale con timestamp.

### Sincronizzazione

#### Push: Locale → Remoto

Invia i dati locali al server:

```bash
# Con dry-run (simulazione + conferma)
./sync-data.sh push

# Senza dry-run (diretto)
./sync-data.sh push --no-dry-run
```

**Quando usarlo**:
- Hai modificato/aggiunto file localmente
- Vuoi aggiornare il server con le tue modifiche

#### Pull: Remoto → Locale

Scarica i dati dal server:

```bash
# Con dry-run (simulazione + conferma)
./sync-data.sh pull

# Senza dry-run (diretto)
./sync-data.sh pull --no-dry-run
```

**Quando usarlo**:
- Il server ha dati più recenti
- Vuoi allineari con la versione remota

### Workflow Tipico

```bash
# 1. Confronta prima di agire
./sync-data.sh compare

# 2. Se modifiche locali → push
./sync-data.sh push

# 3. Crea backup dopo push importante
./sync-data.sh backup

# 4. Se modifiche remote → pull
./sync-data.sh pull
```

### Troubleshooting

| Problema | Causa | Soluzione |
|----------|-------|-----------|
| `Permission denied` | SSH non configurato | Esegui `ssh-copy-id` |
| `rsync not found` | rsync non installato | Installa: `sudo apt install rsync` |
| `Connection refused` | Server offline | Verifica connessione a 90.147.144.147 |
| `Different directory structures` | Path remoto non esiste | Crea `/home/dhruby/docker/atliteg-map/data/` |

---

## 📚 Riferimenti Correlati

- [docs/guides/deployment-guide.md](deployment-guide.md) — Procedura di deployment
- [docs/architecture/dataset-specification.md](../architecture/dataset-specification.md) — Specifiche CSV
- [docs/security/security-handbook.md](../security/security-handbook.md) — Protezione dati sensibili
- [.env](.env) — Configurazione credenziali admin

---

## ✅ Checklist Post-Upload

- [ ] CSV caricato senza errori
- [ ] Record count verificato (`curl /api/lemmi`)
- [ ] Dashboard aggiornata con hard refresh
- [ ] Nuovi marker visibili sulla mappa
- [ ] Ricerca trova i nuovi lemmi
- [ ] Backup locale creato (`sync-data.sh backup`)
- [ ] Dati sincronizzati al server remoto (`sync-data.sh push`)
