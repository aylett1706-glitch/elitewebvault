import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Film, Gamepad2, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EliteAIAssistant() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);

  const suggestions = useMemo(() => ['What should I watch tonight?', 'Find me a game like my favourites', 'Show family-safe picks'], []);

  const ask = async (text = query) => {
    if (!text.trim()) return;
    setLoading(true);
    const [media, games] = await Promise.all([
      base44.entities.Media.filter({ status: 'approved' }, '-views', 80),
      base44.entities.Game.filter({ status: 'approved' }, '-views', 40)
    ]);
    const pool = [...media.map(item => ({ ...item, kind: 'media' })), ...games.map(item => ({ ...item, kind: 'game' }))];
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const ranked = pool
      .map(item => ({ item, score: words.reduce((score, word) => score + (`${item.title} ${item.synopsis || item.description || ''} ${(item.genres || item.tags || []).join(' ')}`.toLowerCase().includes(word) ? 1 : 0), 0) + (item.rating || 0) / 10 + (item.views || 0) / 1000 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(result => result.item);
    setAnswer({ text, results: ranked.length ? ranked : pool.slice(0, 5) });
    setQuery('');
    setLoading(false);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-3xl border border-accent/40 bg-accent text-accent-foreground shadow-2xl shadow-accent/30 hover:bg-accent/90 md:bottom-24" aria-label="Open AI assistant">
        <MessageCircle className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-end bg-black/40 p-3 backdrop-blur-sm md:p-6" role="dialog" aria-modal="true" aria-labelledby="assistant-title">
          <div className="w-full max-w-md rounded-3xl border border-primary/25 bg-card p-4 shadow-2xl elite-panel">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary">AI Concierge</p>
                <h2 id="assistant-title" className="text-xl font-black text-foreground">Ask across every hub</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl bg-secondary p-2 text-muted-foreground hover:text-foreground" aria-label="Close AI assistant"><X className="h-5 w-5" /></button>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map(item => <button key={item} type="button" onClick={() => ask(item)} className="rounded-full border border-border bg-secondary/60 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground">{item}</button>)}
            </div>
            <div className="max-h-72 space-y-2 overflow-auto rounded-2xl border border-border bg-background/50 p-3">
              {!answer && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Bot className="h-4 w-4 text-primary" /> Ask for movies, games, family-safe picks, moods, actors, or hidden gems.</p>}
              {answer?.results?.map(item => {
                const isGame = item.kind === 'game';
                return <Link key={`${item.kind}-${item.id}`} to={isGame ? `/games/${item.id}` : `/media/${item.id}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl bg-card p-2 hover:bg-primary/10"><div className="flex h-12 w-10 items-center justify-center overflow-hidden rounded-xl bg-secondary">{item.poster_url || item.cover_url ? <img src={item.poster_url || item.cover_url} alt={item.title} className="h-full w-full object-cover" /> : isGame ? <Gamepad2 className="h-5 w-5 text-primary" /> : <Film className="h-5 w-5 text-primary" />}</div><div className="min-w-0"><p className="truncate text-sm font-black text-foreground">{item.title}</p><p className="truncate text-xs text-muted-foreground">{(item.genres || item.tags || []).slice(0, 2).join(' • ') || 'Recommended pick'}</p></div></Link>;
              })}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); ask(); }} className="mt-3 flex gap-2">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask what to watch, play, or read…" className="min-h-11 flex-1 rounded-2xl border border-border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground" />
              <button type="submit" disabled={loading || !query.trim()} className="flex min-h-11 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-50" aria-label="Send question">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
