# Guida al Deployment Multi-Dominio

## Panoramica

L'applicazione AtLiTeG supporta l'accesso da più domini contemporaneamente:

- **Dominio primario**: `https://atlante.atliteg.org`
- **Dominio secondario**: `https://linguistica.dh.unica.it/atliteg`

Entrambi i domini servono la stessa applicazione, con configurazioni SEO e CORS appropriate.

## Architettura Multi-Dominio

### 1. Configurazione Nginx

**File**: [lemmario-dashboard/nginx.conf](../../lemmario-dashboard/nginx.conf)

La direttiva `server_name` include entrambi i domini:

```nginx
server {
    listen 9000;
    server_name localhost atlante.atliteg.org linguistica.dh.unica.it;
    # ...
}
```

Questo permette a Nginx di accettare richieste da entrambi i domini sulla stessa porta.

### 2. Metadata SEO Dinamici

**File**: [lemmario-dashboard/app/layout.tsx](../../lemmario-dashboard/app/layout.tsx)

I metadata Next.js utilizzano la variabile d'ambiente `NEXT_PUBLIC_SITE_URL` per impostare il dominio primario nei tag SEO:

```typescript
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlante.atliteg.org';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // ...
  openGraph: {
    url: SITE_URL,
    // ...
  },
  alternates: {
    canonical: SITE_URL,
  },
};
```

### 3. CORS Backend

**File**: [.env](../../.env)

Il backend Express accetta richieste da entrambi i domini:

```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:9000,https://atlante.atliteg.org,https://linguistica.dh.unica.it
```

## Configurazione per Deployment

### Ambiente di Produzione

Per il deployment in produzione, assicurati che le variabili d'ambiente siano configurate correttamente:

```bash
# .env o variabili Docker Compose
NEXT_PUBLIC_SITE_URL=https://atlante.atliteg.org
ALLOWED_ORIGINS=https://atlante.atliteg.org,https://linguistica.dh.unica.it
```

### Cambio Dominio Primario

Se si desidera utilizzare `linguistica.dh.unica.it/atliteg` come dominio primario nei metadata SEO:

1. Modifica `.env`:
   ```bash
   NEXT_PUBLIC_SITE_URL=https://linguistica.dh.unica.it/atliteg
   ```

2. Rebuild dell'applicazione:
   ```bash
   docker compose up --build -d
   ```

## Configurazione DNS e Reverse Proxy

### Configurazione DNS

Entrambi i domini devono puntare allo stesso server:

```
atlante.atliteg.org        A      123.45.67.89
linguistica.dh.unica.it    A      123.45.67.89
```

### Reverse Proxy (Nginx Frontend)

Se utilizzi un reverse proxy upstream (es. per SSL termination), configura entrambi i domini:

```nginx
# Configurazione per atlante.atliteg.org
server {
    listen 443 ssl http2;
    server_name atlante.atliteg.org;

    ssl_certificate /path/to/atlante.atliteg.org.crt;
    ssl_certificate_key /path/to/atlante.atliteg.org.key;

    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Configurazione per linguistica.dh.unica.it
server {
    listen 443 ssl http2;
    server_name linguistica.dh.unica.it;

    ssl_certificate /path/to/linguistica.dh.unica.it.crt;
    ssl_certificate_key /path/to/linguistica.dh.unica.it.key;

    # SOLUZIONE SEMPLIFICATA: Redirect a dominio primario
    # Questa è la soluzione più semplice e affidabile
    location /atliteg {
        return 301 https://atlante.atliteg.org$request_uri;
    }
}

# ALTERNATIVA: Servire l'app anche su linguistica.dh.unica.it/atliteg
# Richiede build separata con basePath=/atliteg
# Commentare il blocco sopra e decommentare questo:
#
# server {
#     listen 443 ssl http2;
#     server_name linguistica.dh.unica.it;
#
#     ssl_certificate /path/to/linguistica.dh.unica.it.crt;
#     ssl_certificate_key /path/to/linguistica.dh.unica.it.key;
#
#     location /atliteg/ {
#         proxy_pass http://localhost:9001/;  # Porta diversa per build con basePath
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }
#
#     location /atliteg {
#         return 301 $scheme://$host$request_uri/;
#     }
# }
```

**Nota**: Per `linguistica.dh.unica.it/atliteg`, il reverse proxy rimuove il prefisso `/atliteg` prima di inoltrare al container Docker.

## Testing Post-Deploy

### Script di Test Automatico

Dopo il deployment, esegui lo script di test per verificare l'accessibilità:

```bash
# Test base
./test-deployment.sh

# Test con output dettagliato
./test-deployment.sh --verbose
```

Lo script verifica:

- ✅ HTTP status codes (200 OK)
- ✅ Content-Type headers (text/html)
- ✅ Presenza del titolo della pagina
- ✅ Meta tags SEO (description, Open Graph, viewport)
- ✅ Accessibilità assets statici (favicon, health endpoint)
- ✅ Certificati SSL e date di scadenza
- ✅ Performance (response time < 3s)

### Test Manuali

Verifica manuale dell'accessibilità:

```bash
# Test HTTP status
curl -I https://atlante.atliteg.org
curl -I https://linguistica.dh.unica.it/atliteg

# Test contenuto HTML
curl -s https://atlante.atliteg.org | grep -i "<title>"
curl -s https://linguistica.dh.unica.it/atliteg | grep -i "<title>"

# Test metadata SEO
curl -s https://atlante.atliteg.org | grep -i 'meta property="og:url"'
curl -s https://linguistica.dh.unica.it/atliteg | grep -i 'meta property="og:url"'

# Test API endpoint (se accessibile)
curl -I https://atlante.atliteg.org/api/lemmi
```

### Verifica Certificati SSL

Controlla i certificati SSL per entrambi i domini:

```bash
# Verifica validità certificato
echo | openssl s_client -servername atlante.atliteg.org -connect atlante.atliteg.org:443 2>/dev/null | openssl x509 -noout -dates

echo | openssl s_client -servername linguistica.dh.unica.it -connect linguistica.dh.unica.it:443 2>/dev/null | openssl x509 -noout -dates

# Verifica subject alternative names (SAN)
echo | openssl s_client -servername atlante.atliteg.org -connect atlante.atliteg.org:443 2>/dev/null | openssl x509 -noout -text | grep DNS:
```

## Troubleshooting

### Problema: 404 su linguistica.dh.unica.it/atliteg

**Causa**: Il reverse proxy non inoltra correttamente il path `/atliteg`.

**Soluzione**: Verifica la configurazione del reverse proxy upstream:

```nginx
location /atliteg/ {
    proxy_pass http://localhost:9000/;  # Trailing slash importante!
    # ...
}
```

### Problema: CORS errors nel browser

**Causa**: Il dominio non è incluso in `ALLOWED_ORIGINS`.

**Soluzione**: Aggiungi il dominio in `.env` e riavvia il backend:

```bash
ALLOWED_ORIGINS=https://atlante.atliteg.org,https://linguistica.dh.unica.it
docker compose restart backend
```

### Problema: Metadata SEO mostrano il dominio sbagliato

**Causa**: `NEXT_PUBLIC_SITE_URL` non è impostato correttamente.

**Soluzione**: Imposta la variabile e rebuild:

```bash
# In .env
NEXT_PUBLIC_SITE_URL=https://atlante.atliteg.org

# Rebuild frontend
docker compose up --build -d lemmario-dashboard
```

### Problema: Certificato SSL non valido

**Causa**: Il certificato non include entrambi i domini nei SAN (Subject Alternative Names).

**Soluzione**: Rigenera il certificato SSL includendo entrambi i domini:

```bash
# Esempio con Let's Encrypt
certbot certonly --nginx -d atlante.atliteg.org -d linguistica.dh.unica.it
```

Oppure usa certificati separati per ogni dominio (come nell'esempio del reverse proxy).

## Monitoraggio

### Health Checks

Configura health checks per entrambi i domini:

```bash
# Script di monitoraggio (es. cron job ogni 5 minuti)
*/5 * * * * /path/to/test-deployment.sh || echo "AtLiTeG deployment check failed" | mail -s "Alert: AtLiTeG Down" admin@example.com
```

### Log Nginx

Monitora i log Nginx per identificare pattern di accesso:

```bash
# Log access per dominio
docker compose exec lemmario-dashboard tail -f /var/log/nginx/access.log | grep "atlante.atliteg.org"
docker compose exec lemmario-dashboard tail -f /var/log/nginx/access.log | grep "linguistica.dh.unica.it"

# Log errori
docker compose exec lemmario-dashboard tail -f /var/log/nginx/error.log
```

## Migrazione da Dominio Singolo

Se stai migrando da un deployment a dominio singolo:

1. **Backup**: Esegui backup del container esistente
   ```bash
   docker commit atliteg-lemmario-dashboard atliteg-backup:$(date +%Y%m%d)
   ```

2. **Aggiorna configurazione**: Modifica [nginx.conf](../../lemmario-dashboard/nginx.conf) e [.env](../../.env)

3. **Test locale**: Verifica con `/etc/hosts` locale
   ```bash
   # Aggiungi in /etc/hosts (temporaneo)
   127.0.0.1 atlante.atliteg.org
   127.0.0.1 linguistica.dh.unica.it

   # Test
   curl http://atlante.atliteg.org:9000
   curl http://linguistica.dh.unica.it:9000/atliteg
   ```

4. **Deploy**: Esegui deploy in produzione
   ```bash
   docker compose up --build -d
   ```

5. **Verifica**: Esegui lo script di test
   ```bash
   ./test-deployment.sh
   ```

6. **Cleanup**: Rimuovi backup se tutto funziona
   ```bash
   docker rmi atliteg-backup:$(date +%Y%m%d)
   ```

## Riferimenti

- [Configurazione Nginx](../../lemmario-dashboard/nginx.conf)
- [Metadata Next.js](../../lemmario-dashboard/app/layout.tsx)
- [Variabili d'ambiente](../../.env)
- [Script di test](../../test-deployment.sh)
- [GitHub Actions deployment](.github/workflows/deploy-production.yml)
