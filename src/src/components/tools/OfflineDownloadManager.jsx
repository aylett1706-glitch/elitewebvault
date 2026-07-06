import { useEffect, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { supabaseApi, base44 } from '@/api/supabaseApi';
import { toast } from 'sonner';

export default function OfflineDownloadManager() {
  const [items, setItems] = useState([]);
  const [saved, setSaved] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  useEffect(() => { Promise.all([base44.entities.Media.filter({ status: 'approved' }, '-views', 80), base44.entities.OfflineDownload.list('-created_date', 30)]).then(([m,d]) => { setItems(m); setSaved(d); setSelectedId(m[0]?.id || ''); }); }, []);
  const save = async () => { const user = await base44.auth.me().catch(() => null); const item = items.find(x => x.id === selectedId); if (!user?.email || !item) return; const created = await base44.entities.OfflineDownload.create({ user_email: user.email, item_id: item.id, item_title: item.title, item_type: item.type, poster_url: item.poster_url, source_url: item.video_url, status: 'saved', saved_at: new Date().toISOString() }); setSaved(prev => [created, ...prev]); toast.success('Saved for offline list'); };
  return <section className="rounded-3xl border border-border bg-card p-5 elite-panel"><div className="mb-4 flex items-center gap-3"><Download className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-black">Offline Mobile Downloads</h2><p className="text-sm text-muted-foreground">Save items into an offline-ready queue.</p></div></div><div className="flex gap-3"><select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="flex-1 rounded-2xl border border-border bg-secondary px-3 py-3 text-sm text-foreground">{items.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select><button onClick={save} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground"><Plus className="h-4 w-4" /> Save</button></div><div className="mt-4 grid gap-3 md:grid-cols-3">{saved.map(item => <div key={item.id} className="rounded-2xl border border-border bg-secondary/40 p-4"><p className="font-black">{item.item_title}</p><p className="text-xs text-muted-foreground capitalize">{item.status}</p></div>)}</div></section>;
}