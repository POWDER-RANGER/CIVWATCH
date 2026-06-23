import type { AlertItem, MarkerType } from '@/types';
import { alerts, MARKER_COLORS } from '@/data/surveillanceData';

const typeLabels: Record<MarkerType, string> = {
  alpr: 'ALPR',
  facial_recognition: 'FACE REC',
  microphone: 'MIC ARRAY',
  ice_raid: 'ICE',
  protest: 'PROTEST',
};

export default function AlertSidebar() {
  const getBorderColor = (type: MarkerType): string => {
    return MARKER_COLORS[type] || '#5A6570';
  };

  return (
    <aside
      className="cw-scroll overflow-y-auto"
      style={{
        position: 'fixed',
        top: 48,
        left: 0,
        width: 280,
        bottom: 24,
        background: 'rgba(13,15,20,0.95)',
        backdropFilter: 'blur(8px)',
        borderRight: '1px solid rgba(0,229,199,0.08)',
        zIndex: 900,
        padding: '16px 12px',
      }}
    >
      <div
        className="flex items-center gap-2 mb-4"
        style={{
          borderLeft: '2px solid #00E5C7',
          paddingLeft: 10,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 500,
            fontSize: 10,
            letterSpacing: 2,
            color: '#5A6570',
            textTransform: 'uppercase',
          }}
        >
          FIELD REPORTS
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {alerts.map((alert: AlertItem) => (
          <div
            key={alert.id}
            className="cw-alert-card cw-focus"
            style={{
              background: '#161920',
              borderRadius: 2,
              padding: 12,
              borderLeft: `2px solid ${getBorderColor(alert.type)}`,
              cursor: 'pointer',
            }}
            tabIndex={0}
            role="button"
            aria-label={`${alert.label}: ${alert.description} at ${alert.location}, ${alert.city}`}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
                fontSize: 9,
                color: getBorderColor(alert.type),
                letterSpacing: 1.5,
                marginBottom: 4,
              }}
            >
              {typeLabels[alert.type]}
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: 13,
                color: '#E8ECEF',
                lineHeight: 1.4,
                marginBottom: 6,
              }}
            >
              {alert.description}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: '#5A6570',
                marginBottom: 4,
              }}
            >
              {alert.location}
            </div>
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  color: '#5A6570',
                }}
              >
                {alert.city}, {alert.state}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  color: '#5A6570',
                }}
              >
                {alert.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 16 }} />
    </aside>
  );
}
