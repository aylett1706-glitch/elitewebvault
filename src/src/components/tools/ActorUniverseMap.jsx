import { useEffect, useMemo, useState } from 'react';
import { Network, UserRound } from 'lucide-react';
import { supabaseApi, base44 } from '@/api/supabaseApi';

export default function ActorUniverseMap() {
  const [media, setMedia] = useState([]);
  useEffect(() => { base44.entities.Media.filter({ status: 'approved' }, '-views', 120).then(setMedia); }, []);
  const actors = useMemo(() => Object.entries(media.reduce((acc, item) => { (item.cast || []).forEach(actor => { acc[actor] = acc[actor] || []; acc[actor].push(item.title); }); return acc; }, {})).sort((a,b) => b[1].length - a[1].length).slice(0, 12), [media]);
  return <section className="rounded-3xl border border-border bg-card p-5 elite-panel"><div className="mb-4 flex items-center gap-3"><Network className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-black">Actor Universe Maps</h2><p className="text-sm text-muted-foreground">See your most connected performers across the library.</p></div></div><div className="grid gap-3 md:grid-cols-4">{actors.map(([actor, titles]) => <div key={actor} className="rounded-2xl border border-border bg-secondary/40 p-4"><UserRound className="mb-2 h-5 w-5 text-primary" /><p className="font-black">{actor}</p><p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{titles.join(' • ')}</p></div>)}</div></section>;
}