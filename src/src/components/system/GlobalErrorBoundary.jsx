import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Global app error:', error);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="fixed inset-0 z-[99999] flex items-center justify-center bg-background p-6 text-foreground">
        <section className="elite-panel max-w-md rounded-3xl p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="mb-2 text-2xl font-black">EliteVault needs a quick refresh</h1>
          <p className="mb-6 text-sm text-muted-foreground">Something unexpected happened, but your library is safe.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button type="button" onClick={() => { window.location.href = '/'; }} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-bold text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4" /> Home
            </button>
          </div>
        </section>
      </main>
    );
  }
}