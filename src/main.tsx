import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', color: '#fff', background: '#090d16', minHeight: '100vh', fontFamily: 'system-ui', direction: 'rtl' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f87171' }}>خطایی در بارگذاری برنامه رخ داد</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>
            {this.state.error?.message || 'خطای نامشخص'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '16px', padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            بارگذاری مجدد صفحه
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

// Register Service Worker for Android PWA installation
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Service Worker registered successfully:', reg.scope);
      })
      .catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });
  });
}
