# Confronto Tecnico Codice: Leaflet vs mapcn

**Documento complementare a:** `MAPCN_INTEGRATION_ANALYSIS.md`  
**Scopo:** Fornire esempi concreti di codice per facilitare comparazione tecnica

---

## 1. Setup Iniziale & Import

### AtLiTeG (Leaflet)

```typescript
// lemmario-dashboard/components/GeographicalMap.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// SSR-safe import
if (typeof window !== 'undefined') {
  require('leaflet.markercluster');
}

export function GeographicalMap() {
  const { filteredLemmi, geoAreas } = useApp();
  // ... resto componente
}
```

### mapcn (MapLibre)

```typescript
// Ipotetico componente con mapcn
'use client';

import { Map, MapMarker, MarkerContent, MapClusterLayer } from '@/registry/map';
import { useState, useMemo } from 'react';

export function GeographicalMap() {
  const { filteredLemmi, geoAreas } = useApp();
  // ... resto componente
}
```

**Nota:** mapcn richiede meno import e gestisce SSR automaticamente.

---

## 2. Container Mappa Base

### AtLiTeG (Leaflet)

```typescript
<div className="relative h-[580px] w-full">
  <MapContainer
    center={[40.5, 12.5]}
    zoom={6}
    style={{ height: '100%', width: '100%' }}
    className="rounded-lg"
    zoomControl={true}
    scrollWheelZoom={true}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {/* Contenuto mappa */}
  </MapContainer>
</div>
```

### mapcn (MapLibre)

```typescript
<div className="h-[580px] w-full rounded-lg">
  <Map 
    center={[12.5, 40.5]} // Nota: lng, lat (inverso!)
    zoom={6}
    scrollZoom={true}
  >
    {/* Contenuto mappa - tiles automatici */}
  </Map>
</div>
```

**Differenze chiave:**
- mapcn ordine coordinate **[lng, lat]** vs Leaflet **[lat, lng]**
- Tiles automatici vs configurazione manuale
- Supporto tema automatico in mapcn

---

## 3. Marker Singolo

### AtLiTeG (Leaflet)

```typescript
// Creazione marker imperativa
const marker = L.marker([lat, lng], {
  icon: createClusterLikeIcon(totalFrequency, isHighlighted, isSelected)
});

// Popup con React component
const popupContainer = document.createElement('div');
const popup = L.popup({ maxWidth: 900 });
marker.bindPopup(popup);

marker.on('popupopen', () => {
  const root = createRoot(popupContainer);
  root.render(<MapBoundedPopup {...props} />);
  popup.setContent(popupContainer);
});

marker.on('popupclose', () => {
  popupContainer.innerHTML = ''; // Cleanup
});

markerClusterGroup.addLayer(marker);
```

### mapcn (MapLibre)

```typescript
// Approccio dichiarativo
<MapMarker 
  longitude={lng} 
  latitude={lat}
  onClick={(e) => handleMarkerClick(e)}
>
  <MarkerContent>
    <CustomMarkerIcon frequency={totalFrequency} />
  </MarkerContent>
  
  <MarkerPopup closeButton={false}>
    <MapBoundedPopup {...props} />
  </MarkerPopup>
</MapMarker>
```

**Vantaggi mapcn:**
- ✅ Codice più leggibile e dichiarativo
- ✅ Cleanup automatico
- ✅ TypeScript-friendly

**Svantaggi mapcn:**
- ❌ Meno controllo granulare eventi
- ❌ Customizzazione icone più limitata

---

## 4. Marker Clustering

### AtLiTeG (Leaflet) - ATTUALE

```typescript
// Configurazione avanzata clustering
const markerClusterGroup = L.markerClusterGroup({
  maxClusterRadius: 120,
  disableClusteringAtZoom: 25, // Mai disabilitare
  spiderfyOnMaxZoom: false,
  singleMarkerMode: false,
  animate: false,
  
  // CHIAVE: Somma frequenze personalizzata
  iconCreateFunction: function(cluster) {
    const markers = cluster.getAllChildMarkers();
    let totalFrequency = 0;
    
    markers.forEach(marker => {
      if (marker.options.customData?.lemmi) {
        marker.options.customData.lemmi.forEach(lemma => {
          totalFrequency += parseInt(lemma.Frequenza) || 0;
        });
      }
    });
    
    // Dimensione/colore basato su frequenza aggregata
    let className = 'marker-cluster-small';
    if (totalFrequency > 100) className = 'marker-cluster-large';
    else if (totalFrequency > 20) className = 'marker-cluster-medium';
    
    return L.divIcon({
      html: `<div><span>${totalFrequency}</span></div>`,
      className: `marker-cluster ${className}`,
      iconSize: L.point(40, 40)
    });
  }
});

// Aggiungi marker con dati custom
markers.forEach(marker => {
  const leafletMarker = L.marker([marker.lat, marker.lng], {
    customData: { lemmi: marker.lemmi } // Dati per aggregazione
  });
  markerClusterGroup.addLayer(leafletMarker);
});

map.addLayer(markerClusterGroup);
```

### mapcn (MapLibre) - MIGRAZIONE PROPOSTA

```typescript
// Conversione dati a GeoJSON
const geojsonData: GeoJSON.FeatureCollection = useMemo(() => {
  return {
    type: 'FeatureCollection',
    features: markers.map(marker => {
      // Calcola frequenza totale per questo punto
      const totalFrequency = marker.lemmi.reduce((sum, l) => 
        sum + (parseInt(l.Frequenza) || 0), 0
      );
      
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [marker.lng, marker.lat] // lng, lat!
        },
        properties: {
          totalFrequency, // Memorizza frequenza
          lemmi: marker.lemmi,
          // ... altre proprietà
        }
      };
    })
  };
}, [markers]);

// Componente clustering
<MapClusterLayer
  data={geojsonData}
  clusterRadius={120}
  clusterMaxZoom={18}
  
  // PROBLEMA: Non supporta somma proprietà custom
  // Il numero mostrato è COUNT di punti, non somma frequenze
  onClusterClick={(clusterId, coords, pointCount) => {
    // pointCount = numero punti, NON somma frequenze
    console.log(`Cluster con ${pointCount} punti`);
  }}
  
  onPointClick={(feature, coords) => {
    const frequency = feature.properties.totalFrequency;
    showPopup(feature.properties.lemmi, coords);
  }}
/>
```

**PROBLEMA CRITICO:**
```typescript
// MapLibre clustering nativo mostra COUNT, non somma custom property
// Per replicare comportamento attuale servirebbe:

// 1. Custom layer con MapLibre GL API diretta (complesso)
map.addSource('lemmi-source', {
  type: 'geojson',
  data: geojsonData,
  cluster: true,
  clusterRadius: 120,
  clusterProperties: {
    // QUESTO funzionerebbe ma richiede low-level API
    totalFreq: ['+', ['get', 'totalFrequency']]
  }
});

// 2. Rendering custom icone cluster (ancora più complesso)
map.addLayer({
  id: 'clusters',
  type: 'circle',
  source: 'lemmi-source',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'totalFreq'], // Usa frequenza aggregata
      '#3B82F6',  // < 20
      20, '#FB923C', // 20-100
      100, '#EF4444'  // > 100
    ],
    'circle-radius': [/* ... */]
  }
});
```

**Conclusione:** Clustering con somma frequenze richiede **uscire dall'astrazione mapcn** e usare MapLibre API direttamente = perdita benefici libreria.

---

## 5. GeoJSON Poligoni

### AtLiTeG (Leaflet)

```typescript
{polygons.map((poly) => {
  const isHighlighted = poly.lemmi.some(l => 
    highlightState.highlightedLemmaIds.has(/* ... */)
  );
  
  return (
    <GeoJSON
      key={`polygon-${poly.geoArea.properties.id}`}
      data={poly.geoArea}
      style={{
        fillColor: isHighlighted ? '#2563eb' : '#3b82f6',
        fillOpacity: isHighlighted ? 0.5 : 0.3,
        color: isHighlighted ? '#1e40af' : '#2563eb',
        weight: isHighlighted ? 3 : 2,
      }}
      onEachFeature={(_, layer) => {
        // Popup setup
        layer.bindPopup(/* ... */);
      }}
    />
  );
})}
```

### mapcn (MapLibre) - Equivalente

```typescript
// Richiede uso MapLibre API diretta, mapcn non ha wrapper GeoJSON
import { useMap } from '@/registry/map';

function GeoJSONLayer({ polygons }) {
  const { map, isLoaded } = useMap();
  
  useEffect(() => {
    if (!isLoaded || !map) return;
    
    polygons.forEach((poly, idx) => {
      const sourceId = `polygon-source-${idx}`;
      const layerId = `polygon-layer-${idx}`;
      
      // Aggiungi source
      map.addSource(sourceId, {
        type: 'geojson',
        data: poly.geoArea
      });
      
      // Aggiungi layer
      map.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': isHighlighted ? '#2563eb' : '#3b82f6',
          'fill-opacity': isHighlighted ? 0.5 : 0.3
        }
      });
      
      // Aggiungi bordo
      map.addLayer({
        id: `${layerId}-outline`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': isHighlighted ? '#1e40af' : '#2563eb',
          'line-width': isHighlighted ? 3 : 2
        }
      });
      
      // Click handler
      map.on('click', layerId, (e) => {
        // Show popup
      });
    });
    
    // Cleanup
    return () => {
      polygons.forEach((_, idx) => {
        map.removeLayer(`polygon-layer-${idx}`);
        map.removeLayer(`polygon-layer-${idx}-outline`);
        map.removeSource(`polygon-source-${idx}`);
      });
    };
  }, [isLoaded, map, polygons]);
  
  return null;
}

// Uso
<Map>
  <GeoJSONLayer polygons={polygons} />
</Map>
```

**Nota:** mapcn **non fornisce wrapper React per GeoJSON layers**, serve usare API MapLibre diretta (più verboso).

---

## 6. Highlighting Dinamico

### AtLiTeG (Leaflet)

```typescript
// Update marker icons on highlight change
useEffect(() => {
  markers.forEach(marker => {
    const markerKey = `${marker.lat}-${marker.lng}`;
    const leafletMarker = markersMapRef.current.get(markerKey);
    
    if (leafletMarker) {
      const isHighlighted = marker.lemmi.some(l => 
        highlightedLemmi.has(getUniqueId(l))
      );
      
      // Aggiorna icona
      leafletMarker.setIcon(
        createClusterLikeIcon(totalFrequency, isHighlighted)
      );
    }
  });
}, [highlightedLemmi, markers]);
```

### mapcn (MapLibre)

```typescript
// Richiede re-render componenti o update layer paint properties
function HighlightableMarkers({ markers, highlightedIds }) {
  return (
    <>
      {markers.map(marker => {
        const isHighlighted = marker.lemmi.some(l => 
          highlightedIds.has(getUniqueId(l))
        );
        
        return (
          <MapMarker key={marker.id} {...marker}>
            <MarkerContent className={isHighlighted ? 'highlighted' : ''}>
              <CustomIcon highlighted={isHighlighted} />
            </MarkerContent>
          </MapMarker>
        );
      })}
    </>
  );
}

// OPPURE con MapLibre API diretta per performance
useEffect(() => {
  if (!map) return;
  
  // Update paint property dinamicamente
  map.setPaintProperty(
    'markers-layer',
    'circle-color',
    highlightedIds.size > 0 ? '#2563eb' : '#3b82f6'
  );
}, [highlightedIds, map]);
```

**Confronto Performance:**
- Leaflet: Update singole icone DOM (efficiente)
- mapcn (re-render): Potenzialmente lento con molti marker
- mapcn (paint update): Efficiente ma richiede low-level API

---

## 7. Popup Complessi con React

### AtLiTeG (Leaflet)

```typescript
// Pattern attuale
const popupContainer = document.createElement('div');
const popup = L.popup({ maxWidth: 900, closeButton: false });

marker.on('popupopen', () => {
  const root = createRoot(popupContainer);
  root.render(
    <MapBoundedPopup
      lemmaGroups={lemmaGroups}
      locationName={locationName}
      onClose={() => marker.closePopup()}
    />
  );
  popup.setContent(popupContainer);
});

marker.on('popupclose', () => {
  popupContainer.innerHTML = ''; // Cleanup React
});
```

### mapcn (MapLibre)

```typescript
// Pattern equivalente (già integrato)
<MapMarker longitude={lng} latitude={lat}>
  <MarkerContent>
    <MarkerIcon />
  </MarkerContent>
  
  <MarkerPopup closeButton={false} className="max-w-[900px]">
    <MapBoundedPopup
      lemmaGroups={lemmaGroups}
      locationName={locationName}
      onClose={() => {/* gestito automaticamente */}}
    />
  </MarkerPopup>
</MapMarker>
```

**Vantaggi mapcn:** 
- ✅ Pattern più React-idiomatico
- ✅ Cleanup automatico
- ✅ TypeScript props validation

---

## 8. Animazioni & Navigazione

### AtLiTeG (Leaflet)

```typescript
// FlyTo con bounds
const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
map.flyToBounds(bounds, {
  padding: [80, 80],
  duration: 1.2,
  easeLinearity: 0.25
});

// FitBounds iniziale
map.fitBounds(bounds, { 
  padding: [50, 50],
  animate: true,
  duration: 0.8
});
```

### mapcn (MapLibre)

```typescript
// Equivalente con MapLibre API
const { map } = useMap();

// FlyTo
const bounds = new MapLibreGL.LngLatBounds();
markers.forEach(m => bounds.extend([m.lng, m.lat]));

map.fitBounds(bounds, {
  padding: { top: 80, bottom: 80, left: 80, right: 80 },
  duration: 1200, // ms
  easing: (t) => t * (2 - t) // easeOut
});
```

**Equivalenza:** API molto simili, migrazione diretta possibile.

---

## 9. Controlli Mappa

### AtLiTeG (Leaflet)

```typescript
// Controlli nativi Leaflet (base)
<MapContainer
  zoomControl={true}
  scrollWheelZoom={true}
>
  {/* Controlli personalizzati richiedono plugin */}
</MapContainer>
```

### mapcn (MapLibre)

```typescript
// Controlli preconfezionati e styled
<Map>
  <MapControls 
    position="bottom-right"
    showZoom={true}
    showCompass={true}
    showLocate={true}
    showFullscreen={true}
  />
  {/* Stile integrato con design system */}
</Map>
```

**Vantaggio mapcn:** Controlli pre-stilizzati con Tailwind, meno CSS custom necessario.

---

## 10. Loading States

### AtLiTeG (Leaflet)

```typescript
// Custom loading overlay
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  setIsLoading(true);
  const timer = setTimeout(() => setIsLoading(false), 500);
  return () => clearTimeout(timer);
}, [filteredLemmi]);

return (
  <div className="relative h-[580px] w-full">
    {isLoading && (
      <div className="map-loading-overlay">
        <div className="map-loading-spinner"></div>
      </div>
    )}
    <MapContainer>
      {/* ... */}
    </MapContainer>
  </div>
);
```

### mapcn (MapLibre)

```typescript
// Built-in loader
<Map>
  {/* Loader automatico durante caricamento tiles */}
  {/* Customizzabile via CSS */}
</Map>

// Custom loader se necessario
const { isLoaded } = useMap();

{!isLoaded && <CustomLoader />}
```

**Vantaggio mapcn:** Loading state gestito nativamente.

---

## 11. SSR & Hydration

### AtLiTeG (Leaflet)

```typescript
// Dynamic import per evitare SSR
if (typeof window !== 'undefined') {
  require('leaflet.markercluster');
}

// Componente già client-side per 'use client'
export function GeographicalMap() {
  // Safe da usare in Next.js
}
```

### mapcn (MapLibre)

```typescript
// Gestione automatica SSR
'use client';

import { Map } from '@/registry/map';

// Nessuna configurazione speciale necessaria
export function GeographicalMap() {
  return <Map>{/* ... */}</Map>;
}
```

**Equivalenza:** Entrambi gestiscono SSR correttamente con `'use client'`.

---

## 12. Tema Light/Dark

### AtLiTeG (Leaflet) - ATTUALE

```typescript
// Stile fisso OpenStreetMap (light)
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

// Per dark mode servirebbe:
const tileUrl = isDarkMode 
  ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png'
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

<TileLayer url={tileUrl} />
```

### mapcn (MapLibre)

```typescript
// Detect automatico tema
<Map theme={theme}> {/* light | dark | auto */}
  {/* Stile adatta automaticamente basemap */}
</Map>

// Oppure custom styles
<Map 
  styles={{
    light: 'https://custom-light-style.json',
    dark: 'https://custom-dark-style.json'
  }}
>
  {/* ... */}
</Map>
```

**Vantaggio mapcn:** Supporto dark mode nativo, più semplice da implementare.

---

## 13. Stima LOC (Lines of Code)

### Componente Completo Equivalente

**AtLiTeG (Leaflet):** ~640 righe  
- GeographicalMap.tsx: 640 LOC
- CSS custom: ~100 LOC
- Utilities: ~50 LOC
**Totale:** ~790 LOC

**mapcn (stimato):** ~450 righe
- GeographicalMap.tsx: 350 LOC (clustering custom +50, GeoJSON +50)
- CSS custom: ~30 LOC (meno override necessari)
- Utilities: ~50 LOC
**Totale:** ~480 LOC

**Riduzione stimata:** -35-40% LOC (ma con perdita flessibilità clustering)

---

## 14. Bundle Size

### AtLiTeG (Leaflet)

```
leaflet: ~140 KB
react-leaflet: ~15 KB
leaflet.markercluster: ~30 KB
Total: ~185 KB (gzipped ~60 KB)
```

### mapcn (MapLibre)

```
maplibre-gl: ~280 KB
mapcn components: ~20 KB (stimato)
Total: ~300 KB (gzipped ~90 KB)
```

**Conclusione:** MapLibre è **+50% più grande** (+30 KB gzipped), ma include features 3D/WebGL.

---

## 15. Migrazione Pattern: Esempio Completo

### Prima (Leaflet)

```typescript
export function GeographicalMap() {
  const { filteredLemmi } = useApp();
  
  const markers = useMemo(() => {
    // Raggruppa per coordinate
    const coordMap = new Map();
    filteredLemmi.forEach(lemma => {
      const key = `${lemma.Latitudine},${lemma.Longitudine}`;
      if (!coordMap.has(key)) coordMap.set(key, []);
      coordMap.get(key).push(lemma);
    });
    return Array.from(coordMap.values());
  }, [filteredLemmi]);
  
  return (
    <MapContainer center={[40.5, 12.5]} zoom={6}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MarkerClusterGroup markers={markers} />
    </MapContainer>
  );
}
```

### Dopo (mapcn) - Versione Semplificata

```typescript
export function GeographicalMap() {
  const { filteredLemmi } = useApp();
  
  const geojsonData = useMemo(() => ({
    type: 'FeatureCollection',
    features: filteredLemmi.map(lemma => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lemma.Longitudine, lemma.Latitudine]
      },
      properties: { lemma }
    }))
  }), [filteredLemmi]);
  
  return (
    <Map center={[12.5, 40.5]} zoom={6}>
      <MapClusterLayer 
        data={geojsonData}
        onPointClick={(feature) => showPopup(feature.properties.lemma)}
      />
    </Map>
  );
}
```

**Nota:** Versione semplificata perde aggregazione frequenze custom.

---

## Conclusioni Tecniche

### Complessità Migrazione per Componente

| Componente | Difficoltà | Motivo |
|------------|-----------|--------|
| Map Container | 🟢 Facile | API simile |
| Marker Singoli | 🟢 Facile | Pattern dichiarativo migliore |
| Popup React | 🟢 Facile | Built-in in mapcn |
| Clustering Base | 🟡 Media | Richiede conversione GeoJSON |
| Clustering Avanzato | 🔴 Difficile | Somma proprietà custom problematica |
| GeoJSON Polygons | 🟡 Media | Richiede API diretta MapLibre |
| Highlighting | 🟡 Media | Pattern diverso, re-render pesante |
| Animazioni | 🟢 Facile | API equivalenti |
| Dark Mode | 🟢 Facile | Built-in in mapcn |

### Quando Leaflet è Migliore

- ✅ Clustering complesso con aggregazioni custom
- ✅ Ecosistema plugin maturo
- ✅ Compatibilità browser legacy importante
- ✅ Bundle size è critico
- ✅ Team già esperto Leaflet

### Quando mapcn è Migliore

- ✅ Marker individuali senza clustering pesante
- ✅ Dark mode è requisito
- ✅ Performance 3D/animazioni importanti
- ✅ Design system shadcn/ui già adottato
- ✅ Nuovi progetti senza legacy code

---

**Prossimo Step:** Leggere `MAPCN_INTEGRATION_ANALYSIS.md` per decisione strategica finale.
