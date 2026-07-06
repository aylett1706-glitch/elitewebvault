import { useEffect, useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SeoShareCardGenerator() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  useEffect(() => { base44.entities.Media.filter({ status: 'approved' }, '-views', 80).then(data => { setItems(data); setSelectedId(data[0]?.id || ''); }); }, []);
  const item = items.find(x => x.id === selectedId);
  const copy = () => { if (!item) return; navigator.clipboard.writeText(`${item.title} (${item.year || ''}) — ${item.synopsis || 'Watch now on EliteVault'} ${window.location.origin}/media/${item.id}`); toast.success('Share copy generated'); };
  return <section className="rounded-3xl border border-border bg-card p-5 elite-panel"><div className="mb-4 flex items-center gap-3"><Share2 className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-black">SEO / Share Card Generator</h2><p className="text-sm text-muted-foreground">Create ready-to-share text for any title.</p></div></div><select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full rounded-2xl border border-border bg-secondary px-3 py-3 text-sm text-foreground">{items.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}</select>{item && <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4"><p className="font-black">{item.title}</p><p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{item.synopsis}</p><button onClick={copy} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-black text-primary-foreground"><Copy className="h-3.5 w-3.5" /> Copy Share Text</button></div>}</section>;
}