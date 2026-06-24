import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        gap: '32px',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        background: scrolled ? 'rgba(12,11,9,0.95)' : 'rgba(12,11,9,0.6)',
        borderBottom: scrolled ? '1px solid #2A2620' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}
    >
      <Link
        to="/"
        className="font-display"
        style={{
          fontSize: '22px',
          fontWeight: 900,
          letterSpacing: '4px',
          color: 'var(--text)',
          textDecoration: 'none',
        }}
      >
        CIV<span style={{ color: 'var(--amber)' }}>WATCH</span>
      </Link>

      <div className="nav-desktop" style={{ gap: '24px', marginLeft: 'auto', alignItems: 'center' }}>
        {isDashboard ? (
          <>
            <Link to="/" className="font-mono nav-link">Home</Link>
            <Link to="/dashboard" className="font-mono nav-link active">Dashboard</Link>
          </>
        ) : (
          <>
            <button onClick={() => scrollTo('mission')} className="font-mono nav-link">Mission</button>
            <button onClick={() => scrollTo('charter')} className="font-mono nav-link">Charter</button>
            <button onClick={() => scrollTo('scope')} className="font-mono nav-link">Scope</button>
            <button onClick={() => scrollTo('data')} className="font-mono nav-link">Data</button>
            <Link to="/dashboard" className="font-mono nav-cta"><span>Dashboard</span></Link>
          </>
        )}
      </div>

      <button className="nav-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        <span style={{ color: 'var(--text)' }}>{menuOpen ? '✕' : '☰'}</span>
      </button>

      {menuOpen && (
        <div className="nav-mobile-menu" style={{ position: 'fixed', top: '52px', left: 0, right: 0, background: 'rgba(12,11,9,0.98)', borderBottom: '1px solid var(--border)', padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isDashboard ? (
            <>
              <Link to="/" className="font-mono nav-link">Home</Link>
              <Link to="/dashboard" className="font-mono nav-link active">Dashboard</Link>
            </>
          ) : (
            <>
              <button onClick={() => scrollTo('mission')} className="font-mono nav-link">Mission</button>
              <button onClick={() => scrollTo('charter')} className="font-mono nav-link">Charter</button>
              <button onClick={() => scrollTo('scope')} className="font-mono nav-link">Scope</button>
              <button onClick={() => scrollTo('data')} className="font-mono nav-link">Data</button>
              <Link to="/dashboard" className="font-mono nav-cta"><span>Dashboard</span></Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
