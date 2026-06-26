interface FooterStatusProps {
  coords: { lat: number; lng: number };
  zoom: number;
}

export default function FooterStatus({ coords, zoom }: FooterStatusProps) {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-[1000] flex items-center justify-between px-3"
      style={{
        height: 24,
        background: '#0D0F14',
        borderTop: '1px solid rgba(0,229,199,0.06)',
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 400,
          fontSize: 9,
          color: '#5A6570',
        }}
      >
        {coords.lat.toFixed(4)}° N, {Math.abs(coords.lng).toFixed(4)}° W
      </span>

      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 400,
          fontSize: 9,
          color: '#5A6570',
        }}
      >
        ZOOM: {zoom}
      </span>

      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 400,
          fontSize: 8,
          color: '#5A6570',
          letterSpacing: 0.5,
        }}
      >
        DATA: OPENSTREETMAP + CIVIC SOURCES
      </span>
    </footer>
  );
}
