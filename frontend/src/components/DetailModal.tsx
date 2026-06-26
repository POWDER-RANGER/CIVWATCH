import { X, Video, Flag } from 'lucide-react';
import type { SurveillancePoint } from '@/types';
import { TYPE_LABELS, MARKER_COLORS } from '@/data/surveillanceData';

interface DetailModalProps {
  point: SurveillancePoint | null;
  onClose: () => void;
}

export default function DetailModal({ point, onClose }: DetailModalProps) {
  if (!point) return null;

  const accentColor = MARKER_COLORS[point.type] || '#00E5C7';
  const typeLabel = TYPE_LABELS[point.type] || 'SURVEILLANCE POINT';

  const details: { key: string; value: string }[] = [
    ...(point.installDate ? [{ key: 'INSTALL DATE', value: point.installDate }] : []),
    ...(point.operator ? [{ key: 'OPERATOR', value: point.operator }] : []),
    { key: 'STATUS', value: point.status },
    { key: 'LAST VERIFIED', value: point.lastVerified },
    { key: 'REPORTED', value: new Date(point.timestamp).toLocaleString() },
  ];

  return (
    <div
      className="cw-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="cw-modal-enter"
        style={{
          background: '#161920',
          border: `1px solid ${accentColor}26`,
          borderRadius: 4,
          boxShadow: `0 0 40px ${accentColor}10`,
          width: 400,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vh - 32px)',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="cw-focus"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            color: '#5A6570',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#E8ECEF';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#5A6570';
          }}
          aria-label="Close detail modal"
        >
          <X size={16} />
        </button>

        <div style={{ padding: '20px 20px 0' }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
              fontSize: 9,
              color: accentColor,
              letterSpacing: 1.5,
              marginBottom: 8,
            }}
          >
            {typeLabel}
          </div>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 16,
              color: '#E8ECEF',
              lineHeight: 1.3,
              marginBottom: 6,
              paddingRight: 24,
            }}
          >
            {point.title}
          </h2>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: '#5A6570',
              marginBottom: 4,
            }}
          >
            {point.location}
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: '#5A6570',
              marginBottom: 16,
            }}
          >
            {point.lat.toFixed(4)}° N, {Math.abs(point.lng).toFixed(4)}° W
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: '#E8ECEF',
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            {point.description}
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: 'rgba(0,229,199,0.08)',
            margin: '0 20px',
          }}
        />

        <div style={{ padding: '16px 20px' }}>
          <div className="flex flex-col gap-2">
            {details.map((detail) => (
              <div key={detail.key} className="flex justify-between items-start gap-4">
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    color: '#5A6570',
                    letterSpacing: 1,
                    whiteSpace: 'nowrap',
                    paddingTop: 2,
                  }}
                >
                  {detail.key}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: '#E8ECEF',
                    textAlign: 'right',
                    wordBreak: 'break-word',
                  }}
                >
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: 'rgba(0,229,199,0.08)',
            margin: '0 20px',
          }}
        />

        <div
          className="flex gap-2"
          style={{ padding: '16px 20px 20px' }}
        >
          {point.feedUrl && (
            <button
              className="cw-btn-primary cw-focus flex items-center gap-2"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 2,
                border: 'none',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: 0.5,
                cursor: 'pointer',
              }}
            >
              <Video size={12} />
              VIEW FEED
            </button>
          )}
          <button
            className="cw-btn-ghost cw-focus flex items-center gap-2"
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 2,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: 0.5,
              cursor: 'pointer',
            }}
          >
            <Flag size={12} />
            REPORT CHANGE
          </button>
        </div>
      </div>
    </div>
  );
}
