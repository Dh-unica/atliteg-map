---
status: "[OPERATIVO]"
last-updated: 2026-06-14
owner: DevOps/Tech Lead
---

# Deployment Runbook — ATLITEG

**CANONICAL DEPLOYMENT GUIDE**. Segui esattamente questi step.

## Quick Deploy (5 min)

```bash
# Da /home/ale/docker/dh-unica/atliteg-map
cd lemmario-dashboard

# 1. Preprocess CSV → JSON
npm run preprocess

# 2. Build static export
npm run build

# 3. Docker build + run
cd .. && docker-compose build
docker-compose up -d

# Verifica: http://localhost:9000
```

## Prerequisites

- Docker 20.10+ + Docker Compose 2.0+
- Node.js 20+, npm 10+ (per local dev)
- Git 2.30+

## Workflow Completo

### Fase 1: Preparazione Dati

```bash
cd lemmario-dashboard

# Se CSV è stato aggiornato:
# 1. Copia nuovo CSV in /data/ o modifica quello in /public/data/
# 2. Preprocess: converte CSV → JSON ottimizzato
npm run preprocess

# Output: /public/data/lemmi.json + geojson.json
ls -lh public/data/
```

### Fase 2: Build Next.js (Static Export)

```bash
# Clean build
rm -rf .next out

# Build (output → /out/)
npm run build

# Verifica output
ls -lh out/ | head -20
find out -name '*.html' | wc -l  # Deve avere index.html
```

### Fase 3: Docker Build

```bash
cd ..

# Build immagine (multi-stage)
docker-compose build

# Verifica immagine
docker images | grep atliteg
```

### Fase 4: Run e Verifica

```bash
# Start container
docker-compose up -d

# Logs
docker-compose logs -f lemmario-dashboard

# Health check
curl http://localhost:9000/  # 200 OK?
docker-compose ps  # Status: healthy?
```

### Fase 5: Test Base

- [ ] http://localhost:9000 carica mappa
- [ ] Ricerca: digita parola, mappa si aggiorna
- [ ] Filtri: categoria/periodo funzionano
- [ ] Timeline: scrolling temporale funziona
- [ ] Mobile: layout responsive

## Troubleshooting

### Build fallisce

```bash
# Pulisci e riprova
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Mappa non carica dati

```bash
# Verifica file dati
ls -lh lemmario-dashboard/public/data/

# Se mancanti:
cd lemmario-dashboard
npm run preprocess
```

### Docker non accetta porte

```bash
# Cambia porta in docker-compose.yml (default: 9000)
# Oppure uccidi processo esistente:
lsof -i :9000
kill -9 <PID>
```

## Ambienti

### Sviluppo

```bash
cd lemmario-dashboard
npm install
npm run dev  # http://localhost:3000
```

### Staging/Produzione
cd /home/ale/docker/atliteg-map/Lemmario_figma

# 2. Build immagine
docker-compose build

# 3. Avvia container
docker-compose up -d

# 4. Apri browser su http://localhost:9000
```

**Monitoring**:

```bash
# Visualizza logs
docker-compose logs -f

# Verifica status container
docker-compose ps

# Restart servizio
docker-compose restart

# Stop servizi
docker-compose down
```

## Ambiente di Produzione

### Deployment Docker (Consigliato)

#### Step 1: Preparazione Server

```bash
# Installa Docker su server Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Aggiungi utente al gruppo docker
sudo usermod -aG docker $USER
newgrp docker

# Installa Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verifica installazioni
docker --version
docker compose version
```

#### Step 2: Clona Repository

```bash
# SSH nel server
ssh user@your-server.com

# Clona repository
git clone https://github.com/your-org/atliteg-map.git
cd atliteg-map/Lemmario_figma

# (Opzionale) Checkout branch specifico
git checkout production
```

#### Step 3: Configurazione Ambiente

**Crea file `.env.production`**:

```env
# Configurazione Produzione
NODE_ENV=production
VITE_API_BASE_URL=https://your-domain.com
VITE_DATA_PATH=/data

# Nginx
NGINX_PORT=9000
NGINX_WORKERS=auto
NGINX_WORKER_CONNECTIONS=1024

# Health Check
HEALTH_CHECK_INTERVAL=30s
HEALTH_CHECK_TIMEOUT=3s
HEALTH_CHECK_RETRIES=3
```

**Opzionale: Modifica `docker-compose.yml` per produzione**:

```yaml
version: '3.8'

services:
  lemmario-dashboard:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    container_name: atliteg-lemmario-prod
    restart: unless-stopped
    ports:
      - "9000:9000"
    volumes:
      - ../data:/usr/share/nginx/html/data:ro
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - atliteg-network

networks:
  atliteg-network:
    driver: bridge
```

#### Step 4: Build e Deploy

```bash
# Build immagine ottimizzata
docker-compose build --no-cache

# Avvia container in background
docker-compose up -d

# Verifica logs
docker-compose logs -f

# Verifica health check
docker ps
# STATUS: Up X minutes (healthy)
```

#### Step 5: Verifica Deployment

```bash
# Test endpoint
curl -I http://localhost:9000

# Dovrebbe ritornare:
# HTTP/1.1 200 OK
# Content-Type: text/html

# Test health check
curl http://localhost:9000/health

# Verifica metriche container
docker stats lemmario-dashboard
```

### Configurazione Nginx Reverse Proxy (Opzionale)

Se vuoi esporre l'applicazione su dominio pubblico con HTTPS:

**File `/etc/nginx/sites-available/atliteg`**:

```nginx
server {
    listen 80;
    server_name atliteg.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name atliteg.example.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/atliteg.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/atliteg.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy to Docker container
    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # Logs
    access_log /var/log/nginx/atliteg-access.log;
    error_log /var/log/nginx/atliteg-error.log;
}
```

**Abilita configurazione**:

```bash
# Crea symbolic link
sudo ln -s /etc/nginx/sites-available/atliteg /etc/nginx/sites-enabled/

# Test configurazione
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Ottieni certificato SSL (Let's Encrypt)
sudo certbot --nginx -d atliteg.example.com
```

## Dockerfile Multi-Stage Build

### Analisi Dockerfile

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm ci --legacy-peer-deps

# Copia sorgenti
COPY . .

# Build produzione
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copia configurazione Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copia build artifacts da builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Esponi porta 9000
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:9000/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Ottimizzazioni

**Layer Caching**:
- `package*.json` copiati prima dei sorgenti
- Rebuild solo se dipendenze cambiano

**Multi-Stage**:
- Builder stage: 1.2GB (Node.js + deps)
- Production stage: 45MB (Nginx + static files)
- Riduzione 96% dimensione immagine finale

**Alpine Linux**:
- Immagine base minimale
- Riduzione superficie di attacco
- Aggiornamenti sicurezza rapidi

## Configurazione Nginx

### File `nginx.conf`

```nginx
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript image/svg+xml;
    gzip_disable "msie6";

    server {
        listen 9000;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security Headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA Fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Data files (CSV/GeoJSON)
        location /data/ {
            expires 1d;
            add_header Cache-Control "public, must-revalidate";
        }
    }
}
```

### Ottimizzazioni Nginx

1. **Gzip Compression**: Riduce payload 70-80%
2. **Cache Headers**: Browser cache per static assets (1 anno)
3. **Sendfile**: Zero-copy file serving (performance)
4. **Keepalive**: Riusa connessioni TCP
5. **Security Headers**: Protezione XSS, clickjacking

## Aggiornamenti e Manutenzione

### Aggiornamento Applicazione

```bash
# 1. SSH nel server
ssh user@your-server.com
cd atliteg-map/Lemmario_figma

# 2. Pull ultimi cambiamenti
git pull origin production

# 3. Rebuild immagine
docker-compose build --no-cache

# 4. Restart container (zero-downtime con health check)
docker-compose up -d

# 5. Verifica logs
docker-compose logs -f --tail=100

# 6. Cleanup immagini vecchie
docker image prune -f
```

### Aggiornamento Dati (CSV/GeoJSON)

```bash
# Opzione 1: Update file su host
cd /home/ale/docker/atliteg-map/data
# Sostituisci file CSV/GeoJSON
cp nuovo_file.csv Lemmi_forme_atliteg_updated.csv

# Il volume Docker monta la directory, nessun restart necessario
# L'applicazione ricarica i dati al prossimo refresh browser

# Opzione 2: Update da repository
git pull origin production
# Se i dati sono nel repo, vengono aggiornati automaticamente
```

### Rollback

```bash
# Rollback a commit precedente
git log --oneline  # Trova commit hash
git checkout <commit-hash>

# Rebuild e redeploy
docker-compose build --no-cache
docker-compose up -d

# Verifica rollback
docker-compose logs -f
```

### Backup

```bash
# Backup container image
docker save atliteg-lemmario:latest | gzip > atliteg-backup-$(date +%Y%m%d).tar.gz

# Backup dati
tar -czf data-backup-$(date +%Y%m%d).tar.gz ../data/

# Backup configurazioni
tar -czf config-backup-$(date +%Y%m%d).tar.gz \
  docker-compose.yml Dockerfile nginx.conf .env.production
```

### Restore

```bash
# Restore image
docker load < atliteg-backup-20240115.tar.gz

# Restore dati
tar -xzf data-backup-20240115.tar.gz -C /path/to/restore/

# Restart container
docker-compose up -d
```

## Monitoring e Logging

### Monitoring Docker

```bash
# Real-time stats
docker stats lemmario-dashboard

# Output:
# CONTAINER ID   CPU %   MEM USAGE / LIMIT   MEM %   NET I/O
# abc123         0.5%    85MiB / 2GiB        4.2%    1.2MB / 850kB

# Inspect container
docker inspect lemmario-dashboard

# Health status
docker ps --filter name=lemmario-dashboard --format "{{.Status}}"
```

### Logging

```bash
# View logs
docker-compose logs -f

# Logs ultimi 100 righe
docker-compose logs --tail=100

# Logs con timestamp
docker-compose logs -t

# Logs specifici servizio
docker-compose logs lemmario-dashboard

# Export logs
docker-compose logs > logs-$(date +%Y%m%d).log
```

### Nginx Access Logs

```bash
# Exec nel container
docker exec -it lemmario-dashboard sh

# View access log
tail -f /var/log/nginx/access.log

# View error log
tail -f /var/log/nginx/error.log

# Exit
exit
```

## Performance Tuning

### Ottimizzazione Docker

**Aumenta risorse container** (`docker-compose.yml`):

```yaml
services:
  lemmario-dashboard:
    # ... altre configurazioni ...
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Ottimizzazione Nginx

**Aumenta worker connections** (`nginx.conf`):

```nginx
events {
    worker_connections 2048;  # Default: 1024
    use epoll;  # Linux event model
}
```

**Abilita caching Nginx**:

```nginx
http {
    proxy_cache_path /tmp/nginx-cache levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

    server {
        location / {
            proxy_cache my_cache;
            proxy_cache_valid 200 1h;
            add_header X-Cache-Status $upstream_cache_status;
        }
    }
}
```

## Sicurezza

### Hardening Docker

```bash
# Run container come non-root user
# Modifica Dockerfile:
USER nginx

# Limita capabilities
docker-compose.yml:
  cap_drop:
    - ALL
  cap_add:
    - NET_BIND_SERVICE

# Read-only filesystem
  read_only: true
  tmpfs:
    - /tmp
    - /var/run
```

### Hardening Nginx

```nginx
# Nascondi versione Nginx
server_tokens off;

# Limita dimensione body
client_max_body_size 10M;

# Timeout
client_body_timeout 12;
client_header_timeout 12;
send_timeout 10;

# Rate limiting
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;
limit_req zone=mylimit burst=20;
```

## Troubleshooting

### Container Non Si Avvia

```bash
# Verifica logs
docker-compose logs

# Verifica conflitti porta
sudo lsof -i :9000
# Uccidi processo se necessario
sudo kill -9 <PID>

# Rebuild pulito
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Errori Build

```bash
# Pulisci cache Docker
docker builder prune -af

# Rebuild senza cache
docker-compose build --no-cache --pull

# Verifica spazio disco
df -h
```

### Performance Lente

```bash
# Verifica risorse container
docker stats

# Aumenta memoria allocata (Docker Desktop)
# Settings > Resources > Memory: 4GB+

# Prune risorse inutilizzate
docker system prune -a
```

## Checklist Deployment

### Pre-Deployment

- [ ] Codice committato su branch production
- [ ] Tests passano (unit + E2E)
- [ ] Build locale successo (`npm run build`)
- [ ] Nessun errore ESLint/TypeScript
- [ ] Dataset CSV/GeoJSON aggiornati
- [ ] Variabili ambiente configurate (`.env.production`)
- [ ] Documentazione aggiornata
- [ ] Changelog aggiornato

### Deployment

- [ ] Docker e Docker Compose installati su server
- [ ] Repository clonato/aggiornato
- [ ] Build immagine Docker successo
- [ ] Container avviato (`docker-compose up -d`)
- [ ] Health check passa
- [ ] Logs non mostrano errori
- [ ] Accessibile su porta 9000
- [ ] Nginx reverse proxy configurato (se applicabile)
- [ ] SSL certificato installato (se applicabile)

### Post-Deployment

- [ ] Test funzionalità critiche
  - [ ] Caricamento dati CSV/GeoJSON
  - [ ] Filtri funzionano
  - [ ] Ricerca funziona
  - [ ] Mappa visualizza correttamente
  - [ ] Timeline navigabile
  - [ ] Dettaglio lemma si apre
- [ ] Performance accettabili
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] Bundle size < 500KB
- [ ] Accessibilità verificata (axe DevTools)
- [ ] Monitoring attivo
- [ ] Backup eseguito
- [ ] Team notificato

## Riferimenti

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Let's Encrypt](https://letsencrypt.org/)
