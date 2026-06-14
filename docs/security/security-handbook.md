---
status: "[OPERATIVO]"
owner: "Security Lead"
last-updated: "2026-06-14"
---

# Security Handbook - AtLiTeG

Guida completa per la configurazione e il monitoraggio della sicurezza.

**Destinatari**: DevOps, System Administrators, Sviluppatori

---

## 🚨 Quick Start: 3 Passi di Sicurezza

### 1. Cambia Credenziali Admin di Default

```bash
# Modifica .env
cp .env.example .env
nano .env

# Cambia ADMIN_USERNAME e ADMIN_PASSWORD
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_very_secure_password
```

### 2. Genera JWT Secret

```bash
# Opzione 1: OpenSSL
openssl rand -hex 32

# Opzione 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia il risultato in `.env`:
```env
JWT_SECRET=il_tuo_secret_generato_qui
```

### 3. Riavvia Container

```bash
docker compose restart
```

✅ **Fatto!** Ora la tua istanza è più sicura.

---

## 🔐 Dati Sensibili - Data Security

### ⚠️ File Non Inclusi in Git

I file di dati lemmi **NON sono inclusi** nel repository per ragioni di sicurezza e privacy.

```
lemmario-dashboard/server/data/lemmi.json    # ❌ NON in Git
data/Lemmi_forme_atliteg_updated.csv         # ❌ NON in Git
```

Contengono dati di ricerca sensibili del progetto VoSLIG.

### 📁 File Required per Esecuzione

Per far funzionare l'applicazione, fornisci:

```bash
lemmario-dashboard/server/data/lemmi.json    # OBBLIGATORIO
```

### 🚀 Setup per Sviluppo Locale

#### Ottieni i File Dati

Contatta i responsabili del progetto:
- **Responsabili Atlante**: Giovanni Urraci, Monica Alba
- **PI PRIN**: Prof.ssa Giovanna Frosini

#### Posiziona i File

```bash
# File principale
cp /path/to/your/lemmi.json lemmario-dashboard/server/data/

# Verifica permessi
chmod 600 lemmario-dashboard/server/data/lemmi.json
```

#### Avvia Applicazione

```bash
docker compose up -d
```

---

## 🔒 Sicurezza Production

### Configurazione Server

#### 1. Carica File via SCP/SFTP

**MAI via git**:

```bash
scp lemmi.json user@server:/var/atliteg/data/
```

#### 2. Set Permessi Restrittivi

```bash
chmod 600 /var/atliteg/data/lemmi.json
chown app-user:app-group /var/atliteg/data/lemmi.json
```

#### 3. Volume Docker (Read-Only)

```yaml
volumes:
  - /var/atliteg/data:/app/data:ro  # Read-only!
```

### Nginx Security

Il file `nginx.conf` include protezioni per impedire download diretto dei dati sensibili:

```nginx
# ❌ BLOCCO file dati sensibili
location /data/ { deny all; return 404; }
location ~ \.(csv)$ { deny all; return 404; }
location ~ (lemmi|Lemmi_).*\.(json|csv)$ { deny all; return 404; }
```

### Test di Sicurezza

Questi endpoint **DEVONO fallire** (404):

```bash
curl http://your-domain/data/lemmi.json          # ❌ Deve fallire
curl http://your-domain/server/data/lemmi.json   # ❌ Deve fallire
```

Questo endpoint **DEVE funzionare** (con API key):

```bash
curl -H "X-API-Key: $KEY" http://your-domain/api/lemmi  # ✅ Deve funzionare
```

---

## 🔑 Configurazione Credenziali Admin

### Metodo 1: Password in Chiaro ⭐ (Per Sviluppo)

**SEMPLICE e RACCOMANDATO per iniziare**:

```bash
# .env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=miaPasswordSegreta123
```

**Vantaggi**:
- ✅ Semplicissimo da configurare
- ✅ Perfetto per sviluppo locale
- ✅ Facile da cambiare

**Nota**: Il file `.env` è in `.gitignore`, quindi non viene committato.

### Metodo 2: Hash Bcrypt 🔒 (Per Produzione)

**PIÙ SICURO** per ambienti esposti:

#### Opzione A: Script Automatico

```bash
npm install
npm run generate-password-hash
```

Lo script chiede la password e genera l'hash pronto.

#### Opzione B: Comando Manuale

```bash
docker compose exec backend node -e \
  "require('bcrypt').hash('la_tua_password', 10).then(h => console.log(h))"
```

Copia l'hash nel `.env`:

```env
ADMIN_USERNAME=admin
# ADMIN_PASSWORD=admin                          # Commenta questa riga
ADMIN_PASSWORD_HASH=$$2b$$10$$il_tuo_hash_qui
```

⚠️ **IMPORTANTE**: Nel file `.env` usa `$$` invece di `$` per escapare.

---

## 🔑 JWT Secret Configuration

### Genera un Secret Sicuro

```bash
# Opzione 1: OpenSSL (RACCOMANDATO)
openssl rand -hex 32

# Opzione 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opzione 3: Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Configura in .env

```env
JWT_SECRET=il_tuo_secret_generato_qui
```

### Rotazione Secret (Cambio Periodico)

Per sicurezza, ruota il secret ogni 6 mesi:

```bash
# 1. Genera nuovo secret
openssl rand -hex 32

# 2. Aggiorna .env
# 3. Tutti i token JWT precedenti diventeranno invalidi
# 4. Gli utenti dovranno fare nuovo login

# 5. Riavvia
docker compose restart
```

---

## 🛡️ Protezione CORS

### Configurazione CORS Corretta

Nel file `.env`:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:9000,https://atlante.atliteg.org,https://linguistica.dh.unica.it
```

### Verifica CORS

```bash
# Richiesta da origin autorizzato (deve funzionare)
curl -H "Origin: https://atlante.atliteg.org" \
  -H "Access-Control-Request-Method: GET" \
  http://localhost:9000/api/lemmi -v

# Richiesta da origin non autorizzato (deve fallire)
curl -H "Origin: https://malicious.com" \
  http://localhost:9000/api/lemmi -v
```

---

## 🔐 API Keys

### Generazione API Keys Sicure

```bash
# Genera una chiave casuale di 32 caratteri
openssl rand -hex 32

# Risultato esempio:
# a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4
```

### Configurazione in Backend

Nel file `.env`:

```env
API_KEYS=default_dev_key,your_generated_key_1,your_generated_key_2
```

### Utilizzo API Keys

```bash
curl -H "X-API-Key: your_generated_key" \
  http://localhost:9000/api/lemmi
```

---

## 📝 Environment Variables Sensibili

### Checklist di Sicurezza

- [ ] `ADMIN_USERNAME` — Cambiato da "admin"
- [ ] `ADMIN_PASSWORD` — Cambiato da "admin" (o usato hash bcrypt)
- [ ] `JWT_SECRET` — Generato con openssl/crypto
- [ ] `API_KEYS` — Generatei casuali di almeno 32 char
- [ ] `.env` è in `.gitignore` (non committato)
- [ ] File `.env` ha permessi `chmod 600`
- [ ] Dati lemmi **non sono in Git**
- [ ] Dati lemmi **non sono in Docker image**

### Verificare .env è Protetto

```bash
# Controlla che .env sia in .gitignore
grep "\.env" .gitignore

# Controlla permessi file
ls -la .env

# Deve mostrare: -rw------- (solo lettura per owner)
```

---

## 🚨 Incident Response

### Se Credenziali sono State Compromesse

**IMMEDIATAMENTE**:

1. Genera nuove credenziali:
   ```bash
   # Nuovo ADMIN_PASSWORD
   openssl rand -hex 16
   
   # Nuovo JWT_SECRET
   openssl rand -hex 32
   ```

2. Aggiorna `.env`:
   ```env
   ADMIN_PASSWORD=new_random_password
   JWT_SECRET=new_random_secret
   ```

3. Riavvia i container:
   ```bash
   docker compose down
   docker compose up -d
   ```

4. Revoca token JWT precedenti (i vecchi token diventeranno invalidi)

5. Monitora i log:
   ```bash
   docker compose logs -f backend
   ```

### Se Dati Sono Esposti

1. **Backup immediato** dei dati sensibili
2. **Isola il server** (revoca accesso esterno temporaneamente)
3. **Analyza i log** per capire come è stato accesso
4. **Notifica i stakeholder** (responsabili progetto, università)
5. **Ripristina** solo dopo audit di sicurezza

---

## 📊 Monitoraggio e Logging

### Visualizza Log di Errori di Autenticazione

```bash
docker compose logs backend | grep -i "auth\|failed\|denied"
```

### Monitora Accessi Admin

```bash
# Cerca tutti i login
docker compose logs backend | grep "POST /api/admin/login"

# Conta numero di accessi
docker compose logs backend | grep "POST /api/admin/login" | wc -l
```

### Monitora Upload CSV

```bash
docker compose logs backend | grep -i "upload\|csv"
```

---

## 📚 Riferimenti Correlati

- [docs/guides/data-operations.md](../guides/data-operations.md) — Data management
- [docs/guides/deployment-guide.md](../guides/deployment-guide.md) — Deployment sicuro
- [.env.example](.env.example) — Variabili d'ambiente disponibili

---

## ✅ Checklist Sicurezza Pre-Deployment

### Locale (Sviluppo)

- [ ] `.env` creato da `.env.example`
- [ ] ADMIN_USERNAME non è "admin"
- [ ] ADMIN_PASSWORD non è "admin"
- [ ] JWT_SECRET è un valore casuale
- [ ] File `.env` in `.gitignore`
- [ ] Nessun secret committato in Git

### Produzione

- [ ] `.env` è **esterno al repository** (caricato via secret manager)
- [ ] Credenziali admin con hash bcrypt
- [ ] JWT_SECRET è forte (32+ char random)
- [ ] Dati sensibili **non sono nella Docker image**
- [ ] Dati sensibili in volume **read-only**
- [ ] CORS è configurato per domini specifici
- [ ] Nginx blocca accesso diretto a file sensibili
- [ ] Backup dati regolari (giornalieri/settimanali)
- [ ] Monitoring e alerting attivi
- [ ] Firewall consente solo HTTPS (porta 443)

---

**Ultima revisione**: 2026-06-14  
**Prossima revisione consigliata**: 2026-09-14 (dopo 3 mesi)
