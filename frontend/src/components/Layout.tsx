import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isAdmin, isAnalyst } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/anomalies', label: 'Anomalies', icon: '⚠️' },
    { path: '/sources', label: 'Sources', icon: '📡' },
    { path: '/alerts', label: 'Alerts', icon: '🔔' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    ...(isAnalyst ? [
      { path: '/contracts', label: 'Contracts', icon: '📋' },
      { path: '/campaign-finance', label: 'Campaign Finance', icon: '💰' },
      { path: '/legislation', label: 'Legislation', icon: '⚖️' },
    ] : []),
    ...(isAdmin ? [
      { path: '/admin', label: 'Admin', icon: '🔧' },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-xl font-bold tracking-tight">
                CIVWATCH
              </Link>
              <span className="text-xs bg-blue-600 px-2 py-0.5 rounded text-white/90">
                BETA
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    location.pathname === item.path
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <span className="text-sm text-slate-400 hidden md:inline">
                  {user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition-colors"
              >
                Logout
              </button>
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm ${
                  location.pathname === item.path
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-500 text-center">
          CIVWATCH — Civic Data Monitoring Platform —{' '}
          <a
            href="https://github.com/POWDER-RANGER/CIVWATCH"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Open Source
          </a>
        </div>
      </footer>
    </div>
  );
};
