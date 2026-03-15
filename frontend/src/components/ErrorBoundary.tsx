import React, { Component, ReactNode } from 'react';

interface P { children: ReactNode; }
interface S { hasError: boolean; }

export class ErrorBoundary extends Component<P, S> {
  state: S = { hasError: false };

  static getDerivedStateFromError(): S { return { hasError: true }; }

  componentDidCatch(error: Error) { console.error('[ErrorBoundary]', error); }

  render() {
    if (this.state.hasError) {
      return (
        <div className="empty-state" style={{ marginTop: '6rem' }}>
          <h2>Something went wrong</h2>
          <p>An unexpected error occurred. Please reload the page.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }}
            onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
