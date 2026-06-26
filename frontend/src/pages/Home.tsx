import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import AlertSidebar from '@/components/AlertSidebar';
import SurveillanceMap from '@/components/SurveillanceMap';
import CameraFeedPanel from '@/components/CameraFeedPanel';
import FooterStatus from '@/components/FooterStatus';
import type { MapCoords } from '@/types';

export default function Home() {
  const [coords, setCoords] = useState<MapCoords>({ lat: 32.7767, lng: -96.7970 });
  const [zoom, setZoom] = useState(12);

  const handleCoordsChange = useCallback((newCoords: MapCoords) => {
    setCoords(newCoords);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#0D0F14',
      }}
    >
      <Header />
      <AlertSidebar />
      <SurveillanceMap onCoordsChange={handleCoordsChange} onZoomChange={handleZoomChange} />
      <CameraFeedPanel />
      <FooterStatus coords={coords} zoom={zoom} />
    </div>
  );
}
