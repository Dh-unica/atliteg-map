# Soluzione per linguistica.dh.unica.it/atliteg

## Problema Diagnosticato

L'applicazione mostra una **pagina bianca** su `https://linguistica.dh.unica.it/atliteg` perché:

- Gli asset Next.js (JavaScript, CSS) sono caricati con path assoluti: `/_next/static/...`
- Su `linguistica.dh.unica.it/atliteg`, questi diventano `https://linguistica.dh.unica.it/_next/static/...` (404)
- Dovrebbero essere `https://linguistica.dh.unica.it/atliteg/_next/static/...`

## Soluzioni Disponibili

### ✅ Soluzione 1: Redirect al Dominio Primario (RACCOMANDATO - PIÙ SEMPLICE)

Configura il reverse proxy Nginx per **redirezionare** automaticamente da `linguistica.dh.unica.it/atliteg` a `atlante.atliteg.org`:

```nginx
# /etc/nginx/sites-available/linguistica
server {
    listen 443 ssl http2;
    server_name linguistica.dh.unica.it;

    ssl_certificate /etc/letsencrypt/live/linguistica.dh.unica.it/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/linguistica.dh.unica.it/privkey.pem;

    # Redirect /atliteg al dominio primario
    location /atliteg {
        return 301 https://atlante.atliteg.org$request_uri;
    }
}
```

**Vantaggi**:
- ✅ Nessuna modifica al codice
- ✅ Un solo container Docker
- ✅ SEO ottimale (un solo dominio canonico)
- ✅ Setup immediato

**Svantaggi**:
- ❌ Gli utenti vedranno l'URL cambiare nel browser

**Applicazione**:
1. Modifica `/etc/nginx/sites-available/linguistica`
2. `sudo nginx -t`
3. `sudo systemctl reload nginx`
4. Test: `curl -I https://linguistica.dh.unica.it/atliteg` (dovrebbe mostrare `301 Moved Permanently`)

---

### ⚙️ Soluzione 2: Build Separata con BasePath (AVANZATA)

Crea un **secondo container** che serve l'app con basePath `/atliteg`:

#### Passo 1: Build del Container con BasePath

```bash
# Dalla directory root del progetto
docker compose -f docker-compose.subpath.yml build
docker compose -f docker-compose.subpath.yml up -d
```

Questo creerà:
- Container `atliteg-lemmario-dashboard-subpath` sulla porta `9001`
- Build Next.js con `basePath=/atliteg`

#### Passo 2: Configurare Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/linguistica
server {
    listen 443 ssl http2;
    server_name linguistica.dh.unica.it;

    ssl_certificate /etc/letsencrypt/live/linguistica.dh.unica.it/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/linguistica.dh.unica.it/privkey.pem;

    # Proxy per /atliteg al container dedicato
    location /atliteg/ {
        proxy_pass http://localhost:9001/atliteg/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Redirect /atliteg senza trailing slash
    location = /atliteg {
        return 301 $scheme://$host$request_uri/;
    }
}
```

#### Passo 3: Applicare Configurazione

```bash
# Testa configurazione
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Passo 4: Verifica

```bash
# Test HTTP status
curl -I https://linguistica.dh.unica.it/atliteg/

# Test contenuto
curl -s https://linguistica.dh.unica.it/atliteg/ | grep -i "<title>"
```

**Vantaggi**:
- ✅ L'app funziona su entrambi i domini senza redirect
- ✅ URL rimane `linguistica.dh.unica.it/atliteg`

**Svantaggi**:
- ❌ Due container Docker da mantenere
- ❌ Doppio consumo di risorse (RAM, storage)
- ❌ SEO: contenuto duplicato su due domini

---

## Raccomandazione

**Usa la Soluzione 1 (Redirect)** a meno che non ci siano requisiti specifici per mantenere l'URL `linguistica.dh.unica.it/atliteg`.

### Motivi:

1. **SEO**: Google preferisce un solo dominio canonico
2. **Manutenzione**: Un solo container da aggiornare
3. **Performance**: Meno risorse server
4. **Semplicità**: Configurazione immediata

### Quando usare Soluzione 2:

- Requisiti istituzionali che impongono l'URL `linguistica.dh.unica.it/atliteg`
- Branding: necessità di mostrare il dominio dell'università
- Accesso limitato al controllo del DNS

---

## Quick Fix Immediato (Soluzione 1)

Esegui questi comandi sul server di produzione:

```bash
# 1. Modifica configurazione Nginx
sudo nano /etc/nginx/sites-available/linguistica

# Aggiungi questo blocco:
# server {
#     listen 443 ssl http2;
#     server_name linguistica.dh.unica.it;
#     ssl_certificate /etc/letsencrypt/live/linguistica.dh.unica.it/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/linguistica.dh.unica.it/privkey.pem;
#     location /atliteg {
#         return 301 https://atlante.atliteg.org$request_uri;
#     }
# }

# 2. Testa configurazione
sudo nginx -t

# 3. Reload Nginx
sudo systemctl reload nginx

# 4. Test
curl -I https://linguistica.dh.unica.it/atliteg
# Dovrebbe mostrare: HTTP/2 301
# Location: https://atlante.atliteg.org/atliteg
```

---

## Test Post-Fix

Dopo aver applicato una delle soluzioni:

```bash
# Test manuale
curl -I https://linguistica.dh.unica.it/atliteg/
curl -s https://linguistica.dh.unica.it/atliteg/ | grep -i "<title>"

# Test automatico (se Soluzione 2)
./test-deployment.sh
```

---

## Troubleshooting

### Problema: Ancora pagina bianca dopo redirect (Soluzione 1)

**Verifica**:
```bash
curl -I https://linguistica.dh.unica.it/atliteg
```

Dovrebbe mostrare:
```
HTTP/2 301
Location: https://atlante.atliteg.org/atliteg
```

Se non vedi `301`, controlla:
- Configurazione Nginx corretta
- Nginx reloaded: `sudo systemctl status nginx`

### Problema: 404 su asset con Soluzione 2

**Verifica build con basePath**:
```bash
docker compose -f docker-compose.subpath.yml logs lemmario-dashboard-subpath | grep "basePath"
```

**Ribuilding se necessario**:
```bash
docker compose -f docker-compose.subpath.yml down
docker compose -f docker-compose.subpath.yml build --no-cache
docker compose -f docker-compose.subpath.yml up -d
```

### Problema: Container subpath non si avvia

**Check logs**:
```bash
docker compose -f docker-compose.subpath.yml logs --tail=50
```

**Common issues**:
- Porta 9001 già in uso: `sudo netstat -tlnp | grep 9001`
- Backend non healthy: `docker compose -f docker-compose.subpath.yml ps`

---

## File Modificati

Per supportare entrambe le soluzioni, sono stati modificati:

1. [lemmario-dashboard/next.config.ts](lemmario-dashboard/next.config.ts)
   - Aggiunto supporto `basePath` condizionale

2. [lemmario-dashboard/Dockerfile](lemmario-dashboard/Dockerfile)
   - Aggiunto ARG `NEXT_PUBLIC_BASE_PATH`
   - Aggiunto ARG `NEXT_PUBLIC_SITE_URL`

3. [docker-compose.subpath.yml](docker-compose.subpath.yml) (NUOVO)
   - Configurazione separata per build con basePath

4. [docs/guides/multi-domain-deployment.md](docs/guides/multi-domain-deployment.md)
   - Documentazione reverse proxy aggiornata

---

## Riferimenti

- [Next.js basePath Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/basePath)
- [Nginx Redirect Guide](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#return)
- [Multi-Domain Deployment Guide](docs/guides/multi-domain-deployment.md)
- [Docker Compose File](docker-compose.subpath.yml)

---

**Versione**: 1.0.0
**Data**: 2026-01-20
**Issue**: Pagina bianca su linguistica.dh.unica.it/atliteg
**Status**: Soluzioni documentate
