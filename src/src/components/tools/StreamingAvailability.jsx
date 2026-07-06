import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search, Tv } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function StreamingAvailability() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  useEffect(() => { base44.entities.Media.filter({ status: 'approved' }, '-views', 120).then(setItems); }, []);
  const filtered = useMemo(() => items.filter(item => `${item.title} ${(item.streaming_platforms || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())).slice(0, 18), [items, query]);
  return <section className="rounded-3xl border border-border bg-card p-5 elite-panel"><div className="mb-4 flex items-center gap-3"><Tv className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-black">Where to Stream Legally</h2><p className="text-sm text-muted-foreground">AU provider availability from saved metadata.</p></div></div><div className="relative mb-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title or provider…" className="w-full rounded-2xl border border-border bg-secondary py-3 pl-10 pr-3 text-sm text-foreground" /></div><div className="grid gap-3 md:grid-cols-3">{filtered.map(item => <div key={item.id} className="rounded-2xl border border-border bg-secondary/40 p-4"><p className="font-black">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.streaming_platforms?.length ? item.streaming_platforms.join(' • ') : 'No provider saved yet'}</p>{item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary"><ExternalLink className="h-3 w-3" /> Details</a>}</div>)}</div></section>;
}