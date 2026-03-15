import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <nav className="sidebar">
      <h1>🔬 CIVWATCH</h1>
      <NavLink to="/"         className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Dashboard</NavLink>
      <NavLink to="/sources"  className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Sources</NavLink>
      <NavLink to="/alerts"   className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Alerts</NavLink>
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <span style={{ fontSize: '.75rem', color: 'var(--muted)', display: 'block', marginBottom: '.5rem' }}>
          {user?.email} ({user?.role})
        </span>
        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
