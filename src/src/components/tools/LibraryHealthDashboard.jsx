import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, HeartPulse, Wrench } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LibraryHealthDashboard() {
  const [items, setItems] = useState([]);
  useEffect(() => { base44.entities.Media.list('-updated_date', 500).then(setItems); }, []);
  const data = useMemo(() => {
    const missingPoster = items.filter(i => !i.poster_url);
    const missingVideo = items.filter(i => !i.video_url && !i.trailer_url);
    const duplicates = items.filter((item, index, arr) => arr.findIndex(other => other.title?.toLowerCase() === item.title?.toLowerCase() && other.type === item.type) !== index);
    return [{ label: 'Missing Posters', items: missingPoster }, { label: 'Missing Video/Trailer', items: missingVideo }, { label: 'Possible Duplicates', items: duplicates }];
  }, [items]);
  return <section className="rounded-3xl border border-border bg-card p-5 elite-panel"><div className="mb-4 flex items-center gap-3"><HeartPulse className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-black">Library Health Dashboard</h2><p className="text-sm text-muted-foreground">Duplicate checker, quality scanner, and metadata repair queue.</p></div></div><div className="grid gap-3 md:grid-cols-3">{data.map(group => <div key={group.label} className="rounded-2xl border border-border bg-secondary/40 p-4"><div className="mb-2 flex items-center gap-2">{group.items.length ? <Wrench className="h-4 w-4 text-yellow-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}<p className="font-black">{group.label}</p></div><p className="text-2xl font-black">{group.items.length}</p><p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{group.items.slice(0, 5).map(i => i.title).join(' • ') || 'Looks good'}</p></div>)}</div></section>;
}