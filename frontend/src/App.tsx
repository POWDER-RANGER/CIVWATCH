import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { LoginPage }     from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SourcesPage }   from './pages/SourcesPage';
import { AlertsPage }    from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

function PrivateLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: '20vh' }} />;
  if (!user)   return <Navigate to="/login" replace />;
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <ErrorBoundary>
          <Routes>
            <Route path="/"          element={<DashboardPage />} />
            <Route path="/sources"   element={<SourcesPage />}   />
            <Route path="/alerts"    element={<AlertsPage />}    />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*"     element={<PrivateLayout />} />
      </Routes>
    </AuthProvider>
  );
}
