'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useApp } from '@/context/AppContext';
import { useHighlight } from '@/context/HighlightContext';
import { MapBoundedPopup } from './MapBoundedPopup';
import { useRegions } from '@/hooks/useRegions';
import { getRegionCodesFromLemmas, countLemmasByRegion } from '@/utils/regionUtils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Import dinamico per evitare problemi SSR
if (typeof window !== 'undefined') {
  require('leaflet.markercluster');
}

/** Mobile breakpoint (px): below this width use the full-screen modal for popups */
const MOBILE_BREAKPOINT = 640;

/** Returns true when the viewport width is below the mobile breakpoint */
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;

/**
 * Icona marker come cluster circolare (sostituisce completamente i pin tradizionali)
 *
 * COMPORTAMENTO:
 * - Tutti i marker sulla mappa vengono visualizzati SEMPRE come cerchi circolari
 * - Non esistono più pin individuali a forma di goccia
 * - Anche un singolo lemma in una località viene mostrato come cerchio
 * - Il numero all'interno del cerchio rappresenta la somma delle occorrenze (Frequenza) dei lemmi
 *
 * DIMENSIONI E COLORI:
 * - Small (blu): totalFrequency <= 20
 * - Medium (arancione): 20 < totalFrequency <= 100
 * - Large (rosso): totalFrequency > 100
 *
 * HIGHLIGHTING:
 * - I cerchi highlighted/selected hanno colori più intensi
 *
 * @param totalFrequency Somma delle frequenze di tutti i lemmi nel marker
 * @param highlighted Se il marker è evidenziato (hover o filtro)
 * @param selected Se il marker è selezionato (click)
 */
const createClusterLikeIcon = (totalFrequency: number, highlighted = false, selected = false) => {
  // Determina dimensione e classe basata sulla frequenza totale
  let size = 'small';
  let backgroundColor = 'rgba(59, 130, 246, 0.6)';
  let innerColor = 'rgba(59, 130, 246, 0.8)';

  if (totalFrequency > 100) {
    size = 'large';
    backgroundColor = 'rgba(239, 68, 68, 0.6)';
    innerColor = 'rgba(239, 68, 68, 0.8)';
  } else if (totalFrequency > 20) {
    size = 'medium';
    backgroundColor = 'rgba(251, 146, 60, 0.6)';
    innerColor = 'rgba(251, 146, 60, 0.8)';
  }

  // Applica evidenziazione se necessario
  if (highlighted || selected) {
    backgroundColor = 'rgba(37, 99, 235, 0.7)';
    innerColor = 'rgba(37, 99, 235, 0.9)';
  }

  const className = selected ? 'marker-cluster selected' : highlighted ? 'marker-cluster highlighted' : 'marker-cluster';

  return L.divIcon({
    html: `<div><span>${totalFrequency}</span></div>`,
    className: `marker-cluster marker-cluster-${size}`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

function MapUpdater({ markers, highlightedAreas }: { markers: any[]; highlightedAreas: Set<string> }) {
  const map = useMap();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (markers.length > 0 && !hasInitialized.current) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { 
        padding: [50, 50],
        animate: true,
        duration: 0.8
      });
      hasInitialized.current = true;
    }
  }, [markers, map]);

  // FlyTo animation quando ci sono aree evidenziate
  useEffect(() => {
    if (highlightedAreas.size > 0 && markers.length > 0) {
      const highlightedMarkers = markers.filter(m => 
        m.lemmi.some((l: any) => highlightedAreas.has(l.CollGeografica))
      );
      
      if (highlightedMarkers.length > 0) {
        const bounds = L.latLngBounds(highlightedMarkers.map(m => [m.lat, m.lng]));
        map.flyToBounds(bounds, {
          padding: [80, 80],
          duration: 1.2,
          easeLinearity: 0.25,
          animate: true
        });
      }
    }
  }, [highlightedAreas, markers, map]);

  return null;
}

// Componente per gestire MarkerCluster con React Leaflet e Highlighting
function MarkerClusterGroup({ 
  children, 
  markers, 
  highlightedLemmi,
  highlightedAreas,
  onMobileClick
}: { 
  children?: React.ReactNode; 
  markers: any[];
  highlightedLemmi: Set<string>;
  highlightedAreas: Set<string>;
  onMobileClick: (data: { lemmaGroups: Map<string, any[]>; locationName: string }) => void;
}) {
  const map = useMap();
  const clusterGroupRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    /**
     * CONFIGURAZIONE CLUSTERING MAPPA
     *
     * OBIETTIVO: Mostrare SEMPRE cerchi di clustering, mai pin individuali
     *
     * STRATEGIA:
     * 1. disableClusteringAtZoom: 25 -> Il clustering non viene mai disabilitato
     *    (il max zoom di Leaflet è 18, quindi 25 è oltre il limite)
     * 2. maxClusterRadius: 120 -> Raggio ampio per aggregare marker anche a zoom elevati
     * 3. spiderfyOnMaxZoom: false -> Non esplodere i cluster in pin individuali
     * 4. singleMarkerMode: false -> Non mostrare mai pin singoli
     * 5. Ogni marker usa createClusterLikeIcon() -> Anche i singoli appaiono come cerchi
     *
     * RISULTATO:
     * - A qualsiasi livello di zoom, si vedono solo cerchi circolari
     * - Il numero nel cerchio rappresenta la somma delle occorrenze (Frequenza)
     * - I cerchi possono contenere valore 1 (per un singolo lemma con freq. 1)
     */
    const markerClusterGroup = (L as any).markerClusterGroup({
      // Opzioni di performance
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 50,

      // Opzioni di clustering - SEMPRE CLUSTER, MAI PIN INDIVIDUALI
      maxClusterRadius: 120, // Aumentato per forzare clustering anche a zoom elevati
      spiderfyOnMaxZoom: false, // Disabilita spiderfy - mantiene sempre cluster
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      singleMarkerMode: false, // Non mostrare mai pin singoli, sempre cluster
      disableClusteringAtZoom: 25, // Valore oltre il max zoom (18) per non disabilitare mai il clustering

      // Animazioni - disabilitate per evitare movimento pin
      animate: false,
      animateAddingMarkers: false,
      spiderfyDistanceMultiplier: 1.5,

      // Icone cluster personalizzate - mostra FREQUENZA (somma occorrenze)
      iconCreateFunction: function(cluster: any) {
        const markers = cluster.getAllChildMarkers();

        // Calcola somma frequenze dai marker figli
        let totalFrequency = 0;
        markers.forEach((marker: any) => {
          if (marker.options.customData && marker.options.customData.lemmi) {
            marker.options.customData.lemmi.forEach((lemma: any) => {
              const freq = parseInt(lemma.Frequenza) || 0;
              totalFrequency += freq;
            });
          }
        });

        let size = 'small';
        let className = 'marker-cluster-small';

        if (totalFrequency > 100) {
          size = 'large';
          className = 'marker-cluster-large';
        } else if (totalFrequency > 20) {
          size = 'medium';
          className = 'marker-cluster-medium';
        }

        return L.divIcon({
          html: `<div><span>${totalFrequency}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: L.point(40, 40)
        });
      }
    });

    clusterGroupRef.current = markerClusterGroup;
    const newMarkersMap = new Map<string, L.Marker>();

    // Aggiungi marker al cluster
    markers.forEach((marker) => {
      // Calcola frequenza totale per questo marker
      let totalFrequency = 0;
      marker.lemmi.forEach((lemma: any) => {
        const freq = parseInt(lemma.Frequenza) || 0;
        totalFrequency += freq;
      });

      // Check se marker è evidenziato
      const isHighlighted = marker.lemmi.some((l: any) => {
        const uniqueId = `${l.IdLemma}-${l.Forma}-${l.CollGeografica}-${l.Anno}`;
        return highlightedLemmi.has(uniqueId) || highlightedAreas.has(l.CollGeografica);
      });

      const isSelected = marker.lemmi.some((l: any) => {
        const uniqueId = `${l.IdLemma}-${l.Forma}-${l.CollGeografica}-${l.Anno}`;
        return highlightedLemmi.has(uniqueId);
      });

      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: createClusterLikeIcon(totalFrequency, isHighlighted, isSelected),
        customData: { lemmi: marker.lemmi } // Aggiungi dati personalizzati per il cluster
      } as any);

      // Raggruppa per Lemma
      const lemmaGroups = new Map<string, any[]>();
      marker.lemmi.forEach((lemma: any) => {
        const lemmaKey = lemma.Lemma;
        if (!lemmaGroups.has(lemmaKey)) {
          lemmaGroups.set(lemmaKey, []);
        }
        lemmaGroups.get(lemmaKey)!.push(lemma);
      });

      // Determina nome località per il popup
      const locationName = marker.lemmi[0]?.CollGeografica || 'Località';

      // Crea un container per il popup React (usato solo su desktop)
      const popupContainer = document.createElement('div');
      popupContainer.className = 'map-popup-container';

      const popup = L.popup({
        maxWidth: 900,
        className: 'map-bounded-popup',
        closeButton: false,
      });

      // Sempre bind del popup — il redirect a modal avviene in popupopen
      leafletMarker.bindPopup(popup);

      leafletMarker.on('popupopen', (e) => {
        // Controlla il viewport AL MOMENTO del click (non alla creazione del marker)
        if (isMobile()) {
          // Mobile: chiudi il popup immediatamente e mostra il modal full-screen
          leafletMarker.closePopup();
          onMobileClick({ lemmaGroups, locationName });
          return;
        }

        // Desktop: render componente React nel popup
        const root = createRoot(popupContainer);
        root.render(
          <MapBoundedPopup
            lemmaGroups={lemmaGroups}
            locationName={locationName}
            onClose={() => leafletMarker.closePopup()}
          />
        );
        popup.setContent(popupContainer);

        // Centra la mappa sul popup con un leggero offset verso l'alto
        setTimeout(() => {
          const px = map.project(e.target.getLatLng());
          px.y -= 180;
          map.panTo(map.unproject(px), { animate: true, duration: 0.5 });
        }, 100);
      });

      // Cleanup quando popup si chiude
      leafletMarker.on('popupclose', () => {
        popupContainer.innerHTML = '';
      });
      
      // Store marker reference con key unico
      const markerKey = `${marker.lat}-${marker.lng}`;
      newMarkersMap.set(markerKey, leafletMarker);
      
      markerClusterGroup.addLayer(leafletMarker);
    });

    markersMapRef.current = newMarkersMap;

    // Aggiungi alla mappa
    map.addLayer(markerClusterGroup);

    // Cleanup
    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [map, markers, highlightedLemmi, highlightedAreas]);

  // Update marker icons quando highlighting cambia
  useEffect(() => {
    console.log('[Map] Highlight changed. Lemmi:', highlightedLemmi.size, 'Areas:', highlightedAreas.size);

    if (!clusterGroupRef.current || markersMapRef.current.size === 0) {
      console.log('[Map] Cluster group not ready');
      return;
    }

    let updatedCount = 0;
    markers.forEach(marker => {
      const markerKey = `${marker.lat}-${marker.lng}`;
      const leafletMarker = markersMapRef.current.get(markerKey);

      if (leafletMarker) {
        // Calcola frequenza totale per questo marker
        let totalFrequency = 0;
        marker.lemmi.forEach((lemma: any) => {
          const freq = parseInt(lemma.Frequenza) || 0;
          totalFrequency += freq;
        });

        const isHighlighted = marker.lemmi.some((l: any) => {
          const uniqueId = `${l.IdLemma}-${l.Forma}-${l.CollGeografica}-${l.Anno}`;
          return highlightedLemmi.has(uniqueId) || highlightedAreas.has(l.CollGeografica);
        });
        const isSelected = marker.lemmi.some((l: any) => {
          const uniqueId = `${l.IdLemma}-${l.Forma}-${l.CollGeografica}-${l.Anno}`;
          return highlightedLemmi.has(uniqueId);
        });

        if (isHighlighted || isSelected) {
          updatedCount++;
        }

        // Update icon
        leafletMarker.setIcon(createClusterLikeIcon(totalFrequency, isHighlighted, isSelected));
      }
    });

    console.log('[Map] Updated', updatedCount, 'highlighted markers out of', markers.length);
  }, [highlightedLemmi, highlightedAreas, markers]);

  return null;
}

export function GeographicalMap() {
  const { filteredLemmi, geoAreas } = useApp();
  const { highlightState } = useHighlight();
  const { regions, loading: regionsLoading } = useRegions();
  const [isLoading, setIsLoading] = useState(true);
  const [mobileModalData, setMobileModalData] = useState<{
    lemmaGroups: Map<string, any[]>;
    locationName: string;
  } | null>(null);

  // Cache Map per IdAmbito -> GeoArea (ottimizzazione)
  const geoAreasMap = useMemo(() => {
    const map = new Map<number, any>();
    geoAreas.forEach(area => {
      map.set(area.properties.id, area);
    });
    return map;
  }, [geoAreas]);

  // Prepara marker per località puntuali (raggruppati per coordinate)
  const markers = useMemo(() => {
    // Raggruppa per coordinate per gestire forme multiple nella stessa località
    const coordMap = new Map<string, { lat: number; lng: number; lemmi: any[] }>();

    filteredLemmi.forEach(lemma => {
      // Solo località con coordinate valide
      if (lemma.Latitudine && lemma.Longitudine &&
          lemma.Latitudine !== '#N/A' && lemma.Longitudine !== '#N/A') {
        const lat = parseFloat(lemma.Latitudine.replace(',', '.'));
        const lng = parseFloat(lemma.Longitudine.replace(',', '.'));

        if (!isNaN(lat) && !isNaN(lng)) {
          const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;

          if (!coordMap.has(key)) {
            coordMap.set(key, { lat, lng, lemmi: [] });
          }
          coordMap.get(key)!.lemmi.push(lemma);
        }
      }
    });

    return Array.from(coordMap.values());
  }, [filteredLemmi]);

  // Prepara aree geografiche poligonali (OTTIMIZZATO con Map)
  const polygons = useMemo(() => {
    const polygonMap = new Map<number, { geoArea: any; lemmi: any[] }>();

    filteredLemmi.forEach(lemma => {
      if (lemma.IdAmbito && lemma.IdAmbito.trim()) {
        const idAmbito = parseInt(lemma.IdAmbito);
        const geoArea = geoAreasMap.get(idAmbito);

        if (geoArea) {
          if (!polygonMap.has(idAmbito)) {
            polygonMap.set(idAmbito, { geoArea, lemmi: [] });
          }
          polygonMap.get(idAmbito)!.lemmi.push(lemma);
        }
      }
    });

    return Array.from(polygonMap.values());
  }, [filteredLemmi, geoAreasMap]);

  // Prepara confini regionali (NUOVO)
  const regionBoundaries = useMemo(() => {
    if (!regions) return [];

    // Estrai codici ISTAT dai lemmi filtrati
    const regionCodes = getRegionCodesFromLemmas(filteredLemmi);
    if (regionCodes.length === 0) return [];

    // Conta lemmi per regione per popup e styling
    const regionCounts = countLemmasByRegion(filteredLemmi);

    // Filtra solo le regioni presenti nei risultati
    return regions.features
      .filter(feature => regionCodes.includes(feature.properties.reg_istat_code))
      .map(feature => ({
        feature,
        count: regionCounts.get(feature.properties.reg_istat_code) || 0,
        lemmi: filteredLemmi.filter(l => l.RegionIstatCode === feature.properties.reg_istat_code)
      }));
  }, [filteredLemmi, regions]);

  // Loading effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [filteredLemmi]);

  return (
    <div className="relative h-[380px] sm:h-[580px] w-full">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="map-loading-overlay">
          <div className="map-loading-spinner"></div>
        </div>
      )}

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

        {/* Marker puntuali con clustering e highlighting */}
        {markers.length > 0 && (
          <MarkerClusterGroup 
            markers={markers}
            highlightedLemmi={highlightState.highlightedLemmaIds}
            highlightedAreas={highlightState.highlightedGeoAreas}
            onMobileClick={setMobileModalData}
          />
        )}

        {/* Poligoni aree geografiche con highlighting */}
        {polygons.map((poly) => {
          // Check se polygon è evidenziato
          const isHighlighted = poly.lemmi.some((l: any) => {
            const uniqueId = `${l.IdLemma}-${l.Forma}-${l.CollGeografica}-${l.Anno}`;
            return highlightState.highlightedLemmaIds.has(uniqueId) ||
              highlightState.highlightedGeoAreas.has(l.CollGeografica);
          });

          // Raggruppa per Lemma per visualizzazione organizzata
          const lemmaGroups = new Map<string, any[]>();
          poly.lemmi.forEach((lemma: any) => {
            const lemmaKey = lemma.Lemma;
            if (!lemmaGroups.has(lemmaKey)) {
              lemmaGroups.set(lemmaKey, []);
            }
            lemmaGroups.get(lemmaKey)!.push(lemma);
          });

          const locationName = poly.geoArea.properties.dialetto || 'Area Geografica';

          return (
            <GeoJSON
              key={`polygon-${poly.geoArea.properties.id}`}
              data={poly.geoArea as any}
              style={{
                fillColor: isHighlighted ? '#2563eb' : '#3b82f6',
                fillOpacity: isHighlighted ? 0.5 : 0.3,
                color: isHighlighted ? '#1e40af' : '#2563eb',
                weight: isHighlighted ? 3 : 2,
                className: isHighlighted ? 'highlighted' : ''
              }}
              onEachFeature={(_, layer) => {
                const popupContainer = document.createElement('div');
                popupContainer.className = 'map-popup-container';

                const popup = L.popup({
                  maxWidth: 900,
                  className: 'map-bounded-popup',
                  closeButton: false,
                });

                layer.bindPopup(popup);

                layer.on('popupopen', () => {
                  if (isMobile()) {
                    layer.closePopup();
                    setMobileModalData({ lemmaGroups, locationName });
                    return;
                  }

                  const root = createRoot(popupContainer);
                  root.render(
                    <MapBoundedPopup
                      lemmaGroups={lemmaGroups}
                      locationName={locationName}
                      onClose={() => layer.closePopup()}
                    />
                  );
                  popup.setContent(popupContainer);

                  // Centra la mappa sul centroide del poligono con offset verso l'alto
                  setTimeout(() => {
                    const leafletLayer = layer as any;
                    if (leafletLayer._map && typeof leafletLayer.getBounds === 'function') {
                      const bounds = leafletLayer.getBounds();
                      const center = bounds.getCenter();
                      const mapInstance = leafletLayer._map;
                      const px = mapInstance.project(center);
                      px.y -= 180;
                      mapInstance.panTo(mapInstance.unproject(px), { animate: true, duration: 0.5 });
                    }
                  }, 100);
                });

                layer.on('popupclose', () => {
                  popupContainer.innerHTML = '';
                });
              }}
            />
          );
        })}

        {/* Confini regionali (NUOVO) */}
        {regionBoundaries.map((region) => {
          // Check se regione è evidenziata
          const isHighlighted = region.lemmi.some((l: any) => {
            const uniqueId = `${l.IdLemma}-${l.Forma}-${l.CollGeografica}-${l.Anno}`;
            return highlightState.highlightedLemmaIds.has(uniqueId) ||
              highlightState.highlightedGeoAreas.has(l.CollGeografica);
          });

          // Raggruppa per Lemma
          const lemmaGroups = new Map<string, any[]>();
          region.lemmi.forEach((lemma: any) => {
            const lemmaKey = lemma.Lemma;
            if (!lemmaGroups.has(lemmaKey)) {
              lemmaGroups.set(lemmaKey, []);
            }
            lemmaGroups.get(lemmaKey)!.push(lemma);
          });

          const regionName = region.feature.properties.reg_name;

          return (
            <GeoJSON
              key={`region-${region.feature.properties.reg_istat_code}`}
              data={region.feature as any}
              style={{
                fillColor: isHighlighted ? '#f59e0b' : '#fbbf24',
                fillOpacity: isHighlighted ? 0.4 : 0.25,
                color: isHighlighted ? '#d97706' : '#f59e0b',
                weight: isHighlighted ? 3 : 2,
                className: isHighlighted ? 'highlighted' : ''
              }}
              onEachFeature={(_, layer) => {
                const popupContainer = document.createElement('div');
                popupContainer.className = 'map-popup-container';

                const popup = L.popup({
                  maxWidth: 900,
                  className: 'map-bounded-popup',
                  closeButton: false,
                });

                layer.bindPopup(popup);

                layer.on('popupopen', () => {
                  if (isMobile()) {
                    layer.closePopup();
                    setMobileModalData({ lemmaGroups, locationName: `${regionName} (Regione)` });
                    return;
                  }

                  const root = createRoot(popupContainer);
                  root.render(
                    <MapBoundedPopup
                      lemmaGroups={lemmaGroups}
                      locationName={`${regionName} (Regione)`}
                      onClose={() => layer.closePopup()}
                    />
                  );
                  popup.setContent(popupContainer);

                  // Centra la mappa sul centroide della regione con offset verso l'alto
                  setTimeout(() => {
                    const leafletLayer = layer as any;
                    if (leafletLayer._map && typeof leafletLayer.getBounds === 'function') {
                      const bounds = leafletLayer.getBounds();
                      const center = bounds.getCenter();
                      const mapInstance = leafletLayer._map;
                      const px = mapInstance.project(center);
                      px.y -= 180;
                      mapInstance.panTo(mapInstance.unproject(px), { animate: true, duration: 0.5 });
                    }
                  }, 100);
                });

                layer.on('popupclose', () => {
                  popupContainer.innerHTML = '';
                });
              }}
            />
          );
        })}

        {markers.length > 0 && (
          <MapUpdater
            markers={markers}
            highlightedAreas={highlightState.highlightedGeoAreas}
          />
        )}
      </MapContainer>

      {/* Mobile full-screen popup modal — rendered via portal */}
      {mobileModalData && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[20000] flex flex-col bg-white"
          role="dialog"
          aria-modal="true"
          aria-label={`Dettagli: ${mobileModalData.locationName}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-white flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base truncate" title={mobileModalData.locationName}>
                {mobileModalData.locationName}
              </h2>
              <p className="text-xs text-white/80">
                {mobileModalData.lemmaGroups.size}{' '}
                {mobileModalData.lemmaGroups.size === 1 ? 'lemma' : 'lemmi'}
              </p>
            </div>
            <button
              onClick={() => setMobileModalData(null)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors flex-shrink-0 ml-3"
              aria-label="Chiudi"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
          </div>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <MapBoundedPopup
              lemmaGroups={mobileModalData.lemmaGroups}
              locationName={mobileModalData.locationName}
              onClose={() => setMobileModalData(null)}
              hideHeader
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
