import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const { user, logout } = useAuth();
  const link = (to: string, label: string) => (
    <NavLink to={to} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>{label}</NavLink>
  );
  return (
    <nav className="sidebar">
      <h1>🔬 CIVWATCH</h1>
      {link('/', 'Dashboard')}
      {link('/sources', 'Sources')}
      {link('/alerts', 'Alerts')}
      {link('/analytics', 'Analytics')}
      {link('/anomalies', 'Anomalies')}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <span style={{ fontSize: '.75rem', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>
          {user?.email} ({user?.role})
        </span>
        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
