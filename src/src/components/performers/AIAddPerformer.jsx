import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AIAddPerformer({ onImported }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const importPerformer = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await base44.functions.invoke('importAdultPerformer', { query });
    const performer = res.data.performer;
    const cached = JSON.parse(sessionStorage.getItem('ev_saved_performers_cache_v1') || '[]');
    sessionStorage.setItem('ev_saved_performers_cache_v1', JSON.stringify([performer, ...cached].filter((item, index, arr) => arr.findIndex(other => other.id === item.id) === index)));
    toast.success(`${performer.stage_name || performer.name} imported`);
    setQuery('');
    onImported?.(performer);
    setLoading(false);
  };

  return (
    <div className="rounded-3xl border border-red-900/30 bg-card p-5 shadow-2xl">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-red-400" />
        <h2 className="text-xl font-bold text-foreground">AI Performer Importer</h2>
      </div>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && importPerformer()}
          placeholder="Enter performer name or official profile URL..."
          className="flex-1 rounded-2xl border border-border bg-secondary px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-red-500/60 focus:outline-none"
        />
        <button
          onClick={importPerformer}
          disabled={loading || !query.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-red-500 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'AI Researching...' : 'Import with AI'}
        </button>
      </div>
    </div>
  );
}
