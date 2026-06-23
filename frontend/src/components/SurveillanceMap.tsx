import { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import type { SurveillancePoint, LayerVisibility, MapCoords } from '@/types';
import { surveillancePoints, MARKER_COLORS, MARKER_SYMBOLS } from '@/data/surveillanceData';
import DetailModal from './DetailModal';
import { Layers } from 'lucide-react';

interface SurveillanceMapProps {
  onCoordsChange: (coords: MapCoords) => void;
  onZoomChange: (zoom: number) => void;
}

const layerConfig = [
  { key: 'alpr' as const, label: 'ALPR', color: '#00E5C7' },
  { key: 'facial_recognition' as const, label: 'FACE REC', color: '#FFB800' },
  { key: 'microphone' as const, label: 'MICS', color: '#5A6570' },
  { key: 'ice_raid' as const, label: 'ICE', color: '#FF453A' },
  { key: 'protest' as const, label: 'PROTEST', color: '#8B5CF6' },
];

function createMarkerElement(type: string, color: string, symbol: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'cw-marker';
  el.style.setProperty('--marker-color', color);
  el.style.color = color;
  el.style.width = '16px';
  el.style.height = '16px';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.position = 'relative';

  const symbolSpan = document.createElement('span');
  symbolSpan.className = 'cw-marker-symbol';
  symbolSpan.style.fontSize = '14px';
  symbolSpan.style.lineHeight = '1';
  symbolSpan.style.fontFamily = "'JetBrains Mono', monospace";
  symbolSpan.style.zIndex = '2';
  symbolSpan.style.position = 'relative';
  symbolSpan.style.textShadow = `0 0 6px ${color}`;
  symbolSpan.textContent = symbol;
  el.appendChild(symbolSpan);

  if (type === 'alpr') {
    const pulse = document.createElement('div');
    pulse.className = 'cw-marker-pulse';
    pulse.style.position = 'absolute';
    pulse.style.width = '20px';
    pulse.style.height = '20px';
    pulse.style.borderRadius = '50%';
    pulse.style.border = `2px solid ${color}`;
    pulse.style.top = '50%';
    pulse.style.left = '50%';
    pulse.style.marginTop = '-10px';
    pulse.style.marginLeft = '-10px';
    pulse.style.pointerEvents = 'none';
    pulse.style.animation = 'marker-pulse 2s ease-out infinite';
    el.appendChild(pulse);
  }

  if (type === 'ice_raid') {
    const warning = document.createElement('div');
    warning.className = 'cw-marker-warning';
    warning.style.position = 'absolute';
    warning.style.width = '24px';
    warning.style.height = '24px';
    warning.style.borderRadius = '4px';
    warning.style.border = '2px solid #FF453A';
    warning.style.top = '50%';
    warning.style.left = '50%';
    warning.style.marginTop = '-12px';
    warning.style.marginLeft = '-12px';
    warning.style.pointerEvents = 'none';
    warning.style.animation = 'warning-pulse 1.5s ease-out infinite';
    el.appendChild(warning);
  }

  return el;
}

export default function SurveillanceMap({ onCoordsChange, onZoomChange }: SurveillanceMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<SurveillancePoint | null>(null);
  const [layers, setLayers] = useState<LayerVisibility>({
    alpr: true,
    facial_recognition: true,
    microphone: true,
    ice_raid: true,
    protest: true,
  });
  const [showLayerControl, setShowLayerControl] = useState(false);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map('cw-map-container', {
      zoomControl: false,
      attributionControl: false,
      minZoom: 3,
      maxZoom: 18,
    }).setView([32.7767, -96.7970], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      opacity: 0.7,
    }).addTo(map);

    mapRef.current = map;

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      if (e.latlng) {
        onCoordsChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    map.on('zoomend', () => {
      onZoomChange(map.getZoom());
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onCoordsChange, onZoomChange]);

  const renderMarkers = useCallback(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (heatLayerRef.current) {
      heatLayerRef.current.remove();
      heatLayerRef.current = null;
    }

    const visiblePoints = surveillancePoints.filter((p) => layers[p.type]);

    visiblePoints.forEach((point) => {
      const color = MARKER_COLORS[point.type] || '#00E5C7';
      const symbol = MARKER_SYMBOLS[point.type] || '●';

      const el = createMarkerElement(point.type, color, symbol);
      el.setAttribute('aria-label', `${point.title} at ${point.location}`);

      const icon = L.divIcon({
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        html: el.outerHTML,
      });

      const marker = L.marker([point.lat, point.lng], { icon });
      marker.on('click', () => {
        setSelectedPoint(point);
      });
      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    const alprPoints = surveillancePoints
      .filter((p) => p.type === 'alpr' && layers.alpr)
      .map((p) => [p.lat, p.lng, p.intensity || 0.5] as [number, number, number]);

    if (alprPoints.length > 0) {
      // @ts-expect-error leaflet.heat types
      const heat = L.heatLayer(alprPoints, {
        radius: 25,
        blur: 20,
        maxZoom: 15,
        max: 1.0,
        gradient: {
          0.0: '#1A1F2E',
          0.3: '#00E5C744',
          0.6: '#00E5C7AA',
          1.0: '#00E5C7',
        },
      });
      heat.addTo(mapRef.current);
      heatLayerRef.current = heat;
    }
  }, [layers]);

  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  const toggleLayer = (key: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div
        id="cw-map-container"
        style={{
          position: 'fixed',
          top: 48,
          left: 280,
          right: 0,
          bottom: 24,
          zIndex: 100,
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: 60,
          left: 292,
          zIndex: 950,
        }}
      >
        <button
          onClick={() => setShowLayerControl(!showLayerControl)}
          className="cw-focus"
          style={{
            width: 32,
            height: 32,
            background: '#161920',
            border: '1px solid rgba(0,229,199,0.12)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: showLayerControl ? '#00E5C7' : '#5A6570',
            transition: 'color 0.15s ease',
          }}
          aria-label="Toggle layer controls"
        >
          <Layers size={14} />
        </button>

        {showLayerControl && (
          <div
            style={{
              marginTop: 4,
              background: '#161920',
              border: '1px solid rgba(0,229,199,0.12)',
              borderRadius: 2,
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minWidth: 120,
            }}
          >
            {layerConfig.map((layer) => (
              <div
                key={layer.key}
                onClick={() => toggleLayer(layer.key)}
                className={`cw-layer-toggle ${layers[layer.key] ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 8px',
                  borderRadius: 2,
                  border: '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: layers[layer.key] ? layer.color : '#5A6570',
                    opacity: layers[layer.key] ? 1 : 0.3,
                    transition: 'all 0.15s ease',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    color: layers[layer.key] ? '#E8ECEF' : '#5A6570',
                    letterSpacing: 0.5,
                    transition: 'color 0.15s ease',
                  }}
                >
                  {layer.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPoint && (
        <DetailModal
          point={selectedPoint}
          onClose={() => setSelectedPoint(null)}
        />
      )}
    </>
  );
}
