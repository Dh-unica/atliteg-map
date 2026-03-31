#!/bin/sh
# Entrypoint del backend API
# Controlla la disponibilità dei dati e tenta il recupero automatico

DATA_FILE="/app/data/lemmi.json"
BACKUP_DIR="/app/uploads/backup"

echo "🚀 Avvio backend API AtLiTeG..."

# Controlla se lemmi.json è già disponibile
if [ -f "$DATA_FILE" ]; then
  echo "✅ lemmi.json trovato, avvio normale."
else
  echo "⚠️  lemmi.json non trovato in $DATA_FILE"
  echo "   Tentativo di recupero automatico da backup CSV..."

  # Cerca il CSV di backup più recente
  LATEST_CSV=""
  if [ -d "$BACKUP_DIR" ]; then
    LATEST_CSV=$(find "$BACKUP_DIR" -name "*.csv" -type f 2>/dev/null | sort -r | head -1)
  fi

  if [ -n "$LATEST_CSV" ]; then
    echo "   CSV backup trovato: $LATEST_CSV"
    echo "   Esecuzione preprocessamento..."

    # Esegui il preprocessamento via Node.js
    node -e "
      const csvProcessor = require('./services/csvProcessor');
      const jobId = 'startup-recovery-' + Date.now();
      csvProcessor.processCSV('$LATEST_CSV', jobId)
        .then(result => {
          console.log('✅ Recupero completato: ' + result.recordCount + ' record');
        })
        .catch(err => {
          console.error('❌ Errore recupero:', err.message);
          process.exit(1);
        });
    "
    RECOVERY_EXIT=$?
    if [ $RECOVERY_EXIT -eq 0 ]; then
      echo "✅ Dati recuperati con successo"
    else
      echo "⚠️  Recupero fallito (exit code $RECOVERY_EXIT), avvio in modalità degradata"
    fi
  else
    echo "   Nessun backup CSV trovato in $BACKUP_DIR"
    echo "   Il backend avvia in modalità degradata."
    echo "   Caricare il file CSV tramite l'interfaccia admin su /api/admin/upload"
  fi
fi

echo ""
echo "▶️  Avvio server Node.js..."
exec node index.js
