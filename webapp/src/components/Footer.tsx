import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      style={{
        padding: '40px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div
        className="font-display"
        style={{
          fontSize: '20px',
          fontWeight: 900,
          letterSpacing: '3px',
          color: 'var(--text-dim)',
        }}
      >
        CIV<span style={{ color: 'var(--amber)' }}>WATCH</span>
      </div>
      <div
        className="font-mono"
        style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text-dim)' }}
      >
        Open Source · Ethics-First · Non-Partisan
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link
          to="/"
          className="font-mono"
          style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'var(--text-dim)',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--amber)')}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--text-dim)')}
        >
          Home
        </Link>
        <Link
          to="/dashboard"
          className="font-mono"
          style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'var(--text-dim)',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--amber)')}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--text-dim)')}
        >
          Dashboard
        </Link>
      </div>
      <div
        className="font-mono"
        style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text-dim)', marginLeft: 'auto' }}
      >
        Because the truth doesn't have a party.
      </div>
    </footer>
  );
}
