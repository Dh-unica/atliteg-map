# Fix CI/CD Deploy Failure - Gennaio 2026

## Problema

Il deploy in produzione falliva dopo il merge del PR #46 con errore:

```
npm: command not found
Error: Process completed with exit code 127
```

## Causa

Il PR #46 aveva modificato il workflow per eseguire `npm install` e `npm run build` **direttamente sul self-hosted runner**, assumendo che Node.js fosse installato. Tuttavia, il runner aveva solo Docker disponibile.

## Soluzione Implementata

**Approccio**: Tornare al **multi-stage Docker build** dove Docker gestisce tutte le dipendenze internamente.

### Modifiche Effettuate

#### 1. Frontend Dockerfile (`lemmario-dashboard/Dockerfile`)

```dockerfile
# Stage 1: Build con Node.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_KEY=default_dev_key
RUN npm run build

# Stage 2: Nginx production
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 9000
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Backend Dockerfile (`lemmario-dashboard/server/Dockerfile`)

```dockerfile
FROM node:18-slim
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production  # Installa dipendenze nel container
COPY . .
RUN mkdir -p data uploads logs && chmod 755 data uploads logs
EXPOSE 3001
CMD ["node", "index.js"]
```

#### 3. Workflow CI/CD (`.github/workflows/deploy-production.yml`)

**Prima (PR #46 - rotto)**:
- Step 4: `npm install` sul runner
- Step 5: `npm install` backend sul runner  
- Step 6: `docker compose build`

**Dopo (fix)**:
- Step 4: `docker compose build` (fa tutto internamente)

#### 4. `.dockerignore` Files

Aggiunto `node_modules` a `lemmario-dashboard/server/.dockerignore` per evitare di copiare dipendenze locali.

## Vantaggi di Questo Approccio

✅ **Portabilità**: Il runner ha bisogno solo di Docker, non di Node.js/npm  
✅ **Consistenza**: Stesso ambiente build ovunque (locale, CI/CD, produzione)  
✅ **Caching Docker**: Le dipendenze vengono cachate in layer Docker separati  
✅ **Isolamento**: Ogni build parte da ambiente pulito  
✅ **Sicurezza**: Nessuna dipendenza installata direttamente sul runner  

## Alternative Considerate

### Opzione 1: Installare Node.js sul self-hosted runner
- ❌ Richiede configurazione manuale del server
- ❌ Manutenzione di versioni Node.js
- ❌ Potenziali conflitti tra progetti

### Opzione 2: Usare `actions/setup-node` nel workflow
- ❌ Comportamento non standard su self-hosted runners
- ❌ Richiede download dipendenze ad ogni deploy

### Opzione 3: Container job con Node.js (scelta iniziale tentata)
```yaml
jobs:
  deploy:
    runs-on: self-hosted
    container:
      image: node:20-alpine
```
- ❌ Perde accesso a Docker del runner (Docker-in-Docker complicato)

## Conclusione

La soluzione implementata è la più robusta: **tutto il build avviene dentro container Docker**, il runner ha solo bisogno di Docker Engine.

## Testing

```bash
# Test build locale
docker compose build --no-cache

# Test deploy completo (da repo root)
docker compose up --build -d

# Verifica container
docker compose ps
docker compose logs -f
```

## Riferimenti

- PR #46: https://github.com/Unica-dh/atliteg-map/pull/46
- Commit fix: `adcca52`
- GitHub Actions Logs: https://github.com/Unica-dh/atliteg-map/actions
