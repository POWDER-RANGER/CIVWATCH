import { useState, useEffect } from 'react';
import { Eye, Radio } from 'lucide-react';
import { tickerText } from '@/data/surveillanceData';

export default function Header() {
  const [activeFeeds, setActiveFeeds] = useState(1247);
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toISOString().slice(11, 19) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeeds(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4"
      style={{
        height: 48,
        background: '#0D0F14',
        borderBottom: '1px solid rgba(0,229,199,0.12)',
      }}
    >
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Eye size={16} color="#00E5C7" />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: 16,
              color: '#00E5C7',
              letterSpacing: 3,
            }}
          >
            CIVWATCH
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <div
            className="cw-live-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#FF453A',
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: '#FF453A',
              letterSpacing: 1,
            }}
          >
            LIVE
          </span>
        </div>
      </div>

      <div
        className="flex-1 mx-6 overflow-hidden"
        style={{ maxWidth: 600 }}
        aria-live="polite"
      >
        <div className="cw-ticker-content">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: '#5A6570',
              paddingRight: 80,
            }}
          >
            {tickerText}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: '#5A6570',
              paddingRight: 80,
            }}
          >
            {tickerText}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Radio size={10} color="#5A6570" />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
              fontSize: 10,
              color: '#5A6570',
              letterSpacing: 0.5,
            }}
          >
            FEEDS: {activeFeeds.toLocaleString()} ACTIVE
          </span>
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: '#5A6570',
          }}
        >
          {utcTime}
        </span>
      </div>
    </header>
  );
}
