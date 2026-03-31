FROM node:18-slim

# Install wget for health check
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia package files per dependency caching
COPY package*.json ./

# Installa dipendenze
RUN npm ci --only=production

# Copia il resto del codice
COPY . .

# Crea directory necessarie
RUN mkdir -p data uploads logs && \
    chmod 755 data uploads logs

# Rendi eseguibile l'entrypoint
RUN chmod +x entrypoint.sh

# Esponi porta 3001
EXPOSE 3001

# Avvia tramite entrypoint che controlla disponibilità dati
CMD ["./entrypoint.sh"]
