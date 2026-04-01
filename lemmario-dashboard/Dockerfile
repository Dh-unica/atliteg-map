# ================================
# Stage 1: Build Next.js app
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia package files per dependency caching
COPY package*.json ./
RUN npm ci

# Copia il resto del codice
COPY . .

# Accept build arguments for Next.js environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_KEY
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_SITE_URL

# Build Next.js (static export)
# NEXT_PUBLIC_API_URL= (vuoto) fa sì che le chiamate API siano relative (es: /api/lemmi)
# Nginx le proxierà poi al backend:3001 (vedi nginx.conf)
# NEXT_PUBLIC_BASE_PATH=/atliteg per deployment su subpath
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-}
ENV NEXT_PUBLIC_API_KEY=${NEXT_PUBLIC_API_KEY:-default_dev_key}
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH:-}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://atlante.atliteg.org}
RUN npm run build

# ================================
# Stage 2: Production Nginx
# ================================
FROM nginx:alpine

# Copia configurazione Nginx personalizzata
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia i file build da Next.js dal builder stage
COPY --from=builder /app/out /usr/share/nginx/html

# Esponi porta 9000
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:9000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
