/**
 * CIVWATCH FeedMap Component
 * Renders all geolocated public feed events on a Leaflet map.
 * Click any marker to open the embed or snapshot inline.
 *
 * Dependencies: react-leaflet, leaflet
 * Install: npm install react-leaflet leaflet
 */

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon path issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function FeedMap() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feeds/geo')
      .then(r => r.json())
      .then(data => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 16px', background: '#0d1117', color: '#58a6ff', fontFamily: 'monospace', fontSize: 13 }}>
        CIVWATCH · Public Feed Map · {events.length} sources live
      </div>

      <MapContainer
        center={[39.5, -98.35]}
        zoom={4}
        style={{ flex: 1 }}
        preferCanvas
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {events.map((event, i) => (
          <Marker
            key={`${event.source_id}-${event.raw_id || i}`}
            position={[event.geo.lat, event.geo.lng]}
            eventHandlers={{ click: () => setSelected(event) }}
          >
            <Popup>
              <div style={{ minWidth: 220 }}>
                <strong>{event.label}</strong>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>
                  {event.tags.join(' · ')}
                </div>

                {event.embed_url && event.source_type === 'yt_live' && (
                  <iframe
                    width="220"
                    height="130"
                    src={event.embed_url}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={event.label}
                  />
                )}

                {event.snapshot_url && !event.embed_url && (
                  <img
                    src={event.snapshot_url}
                    alt={event.label}
                    style={{ width: '100%', borderRadius: 4 }}
                  />
                )}

                {!event.embed_url && !event.snapshot_url && (
                  <div style={{ fontSize: 11, color: '#999' }}>No embed available</div>
                )}

                <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>
                  {event.source_type} · {new Date(event.timestamp_utc).toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {loading && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          background: '#0d1117', color: '#58a6ff', padding: 16, borderRadius: 8, fontFamily: 'monospace'
        }}>
          Loading feeds...
        </div>
      )}
    </div>
  );
}
