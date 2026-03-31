const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

/**
 * Script per pre-processare i dati CSV in JSON ottimizzato
 * Eseguito al build time per migliorare le performance di caricamento
 */

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const SERVER_DATA_DIR = path.join(__dirname, '..', 'server', 'data');

// Cerca il CSV in più posizioni possibili
const CSV_CANDIDATES = [
  path.join(DATA_DIR, 'Lemmi_forme_atliteg_updated.csv'),
  path.join(__dirname, '..', '..', 'data', 'Lemmi_forme_atliteg_updated.csv'),
  path.join(SERVER_DATA_DIR, 'Lemmi_forme_atliteg_updated.csv'),
];

const JSON_OUTPUT = path.join(DATA_DIR, 'lemmi.json');
const GEO_INPUT = path.join(DATA_DIR, 'Ambiti geolinguistici newline.json');
const GEO_OUTPUT = path.join(DATA_DIR, 'geojson.json');

console.log('🔄 Pre-processing dati...\n');

/**
 * Processa il CSV e genera lemmi.json in public/data/ e server/data/
 */
function processCSV(csvPath) {
  console.log(`   Trovato CSV in: ${csvPath}`);
  const csvText = fs.readFileSync(csvPath, 'utf-8');

  Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      const headerMap = {
        'IdLemma': 'IdLemma',
        'Lemma': 'Lemma',
        'Forma': 'Forma',
        'Coll.Geografica': 'CollGeografica',
        'Latitudine': 'Latitudine',
        'Longitudine': 'Longitudine',
        'Tipo coll.Geografica': 'TipoCollGeografica',
        'Anno': 'Anno',
        'Periodo': 'Periodo',
        'IDPeriodo': 'IDPeriodo',
        'Datazione': 'Datazione',
        'Categoria': 'Categoria',
        'Frequenza': 'Frequenza',
        'URL': 'URL',
        'IdAmbito': 'IdAmbito',
        'reg_istat_code': 'RegionIstatCode',
      };
      return headerMap[header] || header;
    },
    complete: (results) => {
      const lemmi = results.data;

      // Debug: conta lemmi Friuli
      const friuliCount = lemmi.filter(l => l.RegionIstatCode === '06').length;
      console.log(`   DEBUG: Friuli entries found: ${friuliCount}`);

      // Salva JSON in public/data/
      fs.writeFileSync(JSON_OUTPUT, JSON.stringify(lemmi, null, 0));

      const csvSize = fs.statSync(csvPath).size;
      const jsonSize = fs.statSync(JSON_OUTPUT).size;

      console.log(`✅ CSV processato: ${lemmi.length} record`);
      console.log(`   CSV:  ${(csvSize / 1024).toFixed(2)} KB`);
      console.log(`   JSON: ${(jsonSize / 1024).toFixed(2)} KB`);
      console.log(`   Riduzione: ${((1 - jsonSize/csvSize) * 100).toFixed(1)}%\n`);

      // Copia lemmi.json anche in server/data/ per il backend API
      if (fs.existsSync(SERVER_DATA_DIR)) {
        const serverJsonOutput = path.join(SERVER_DATA_DIR, 'lemmi.json');
        fs.copyFileSync(JSON_OUTPUT, serverJsonOutput);
        console.log(`✅ Copiato lemmi.json in server/data/ per il backend API`);
      }
    },
    error: (error) => {
      console.error('❌ Errore parsing CSV:', error);
      process.exit(1);
    }
  });
}

// 1. Processa CSV -> JSON
console.log('📄 Caricamento CSV...');

const csvPath = CSV_CANDIDATES.find(p => fs.existsSync(p));

if (!csvPath) {
  console.warn('⚠️  CSV non trovato in nessuna delle posizioni cercate:');
  CSV_CANDIDATES.forEach(p => console.warn(`   - ${p}`));
  console.warn('   Saltando la generazione di lemmi.json\n');
} else {
  processCSV(csvPath);
}

// 2. Processa GeoJSON (newline-delimited -> array)
console.log('🗺️  Caricamento GeoJSON...');
const geoText = fs.readFileSync(GEO_INPUT, 'utf-8');
const lines = geoText.trim().split('\n');
const features = lines
  .filter(line => line.trim())
  .map(line => JSON.parse(line));

fs.writeFileSync(GEO_OUTPUT, JSON.stringify(features, null, 0));

const geoInputSize = fs.statSync(GEO_INPUT).size;
const geoOutputSize = fs.statSync(GEO_OUTPUT).size;

console.log(`✅ GeoJSON processato: ${features.length} features`);
console.log(`   Input:  ${(geoInputSize / 1024).toFixed(2)} KB`);
console.log(`   Output: ${(geoOutputSize / 1024).toFixed(2)} KB\n`);

console.log('✨ Pre-processing completato!\n');
