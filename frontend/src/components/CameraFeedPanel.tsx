import { useState } from 'react';
import { ChevronLeft, ChevronRight, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { cameraFeeds } from '@/data/surveillanceData';
import type { CameraFeed } from '@/types';

function FeedCard({ feed }: { feed: CameraFeed }) {
  const getStatusIcon = () => {
    switch (feed.status) {
      case 'ACTIVE':
        return <Wifi size={10} color="#00E5C7" />;
      case 'OFFLINE':
        return <WifiOff size={10} color="#5A6570" />;
      case 'INTERMITTENT':
        return <AlertTriangle size={10} color="#FFB800" />;
    }
  };

  const getStatusColor = () => {
    switch (feed.status) {
      case 'ACTIVE':
        return '#00E5C7';
      case 'OFFLINE':
        return '#5A6570';
      case 'INTERMITTENT':
        return '#FFB800';
    }
  };

  return (
    <div
      style={{
        background: '#161920',
        borderRadius: 2,
        border: '1px solid rgba(0,229,199,0.06)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 100,
          background: '#1A1F2E',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {feed.status !== 'OFFLINE' && (
          <>
            <div className="cw-feed-noise" />
            <div className="cw-feed-scanline" />
          </>
        )}
        {feed.status === 'OFFLINE' && (
          <div
            className="flex items-center justify-center"
            style={{ width: '100%', height: '100%' }}
          >
            <WifiOff size={24} color="#5A6570" />
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            right: 6,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            color: '#5A6570',
            background: 'rgba(13,15,20,0.7)',
            padding: '1px 4px',
            borderRadius: 1,
          }}
        >
          {new Date().toISOString().slice(11, 19)}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(13,15,20,0.7)',
            padding: '2px 6px',
            borderRadius: 1,
          }}
        >
          {getStatusIcon()}
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8,
              color: getStatusColor(),
              letterSpacing: 0.5,
            }}
          >
            {feed.status}
          </span>
        </div>
      </div>
      <div
        style={{
          padding: '6px 8px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: '#5A6570',
          letterSpacing: 0.5,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {feed.label}
      </div>
    </div>
  );
}

export default function CameraFeedPanel() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="cw-focus"
        style={{
          position: 'fixed',
          top: 60,
          right: collapsed ? 0 : 320,
          zIndex: 950,
          width: 28,
          height: 28,
          background: '#161920',
          border: '1px solid rgba(0,229,199,0.08)',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'right 0.3s ease',
          color: '#5A6570',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = '#00E5C7';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = '#5A6570';
        }}
        aria-label={collapsed ? 'Expand camera panel' : 'Collapse camera panel'}
      >
        {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <aside
        className={`cw-scroll overflow-y-auto ${collapsed ? '' : 'cw-panel-slide-in'}`}
        style={{
          position: 'fixed',
          top: 48,
          right: 0,
          width: collapsed ? 0 : 320,
          bottom: 24,
          background: 'rgba(13,15,20,0.92)',
          backdropFilter: 'blur(12px)',
          borderLeft: collapsed ? 'none' : '1px solid rgba(0,229,199,0.08)',
          zIndex: 900,
          padding: collapsed ? 0 : '16px 12px',
          transition: 'width 0.3s ease, padding 0.3s ease',
          overflowX: 'hidden',
        }}
      >
        <div className="flex items-center justify-between mb-4">
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
            LIVE FEEDS
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: '#5A6570',
            }}
          >
            {cameraFeeds.length} SOURCES
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {cameraFeeds.map((feed: CameraFeed) => (
            <FeedCard key={feed.id} feed={feed} />
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 10,
            background: 'rgba(0,229,199,0.03)',
            border: '1px solid rgba(0,229,199,0.06)',
            borderRadius: 2,
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 10,
              color: '#5A6570',
              lineHeight: 1.5,
            }}
          >
            Feeds aggregated from public sources and civic monitoring groups. 
            Some streams may be intermittent or offline.
          </p>
        </div>
      </aside>
    </>
  );
}
