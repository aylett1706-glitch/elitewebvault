import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Copy, Loader2, Play, Plus, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function WatchPartyManager() {
  const [media, setMedia] = useState([]);
  const [parties, setParties] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Media.filter({ status: 'approved' }, '-views', 80),
      base44.entities.WatchParty.list('-created_date', 20)
    ]).then(([items, rooms]) => { setMedia(items); setParties(rooms); setSelectedId(items[0]?.id || ''); setLoading(false); });
  }, []);

  const selected = useMemo(() => media.find(item => item.id === selectedId), [media, selectedId]);

  const createParty = async () => {
    if (!selected) return;
    const user = await base44.auth.me().catch(() => null);
    const party = await base44.entities.WatchParty.create({
      title: `${selected.title} Watch Party`,
      media_id: selected.id,
      media_title: selected.title,
      host_email: user?.email || '',
      scheduled_at: time ? new Date(time).toISOString() : new Date().toISOString(),
      invite_code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      participants: user?.email ? [user.email] : [],
      chat_messages: []
    });
    setParties(prev => [party, ...prev]);
    toast.success('Watch party created');
  };

  if (loading) return <ToolLoader label="Loading watch parties" />;

  return (
    <section className="rounded-3xl border border-border bg-card p-5 elite-panel">
      <div className="mb-4 flex items-center gap-3"><Users className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-black">AI Watch Parties</h2><p className="text-sm text-muted-foreground">Create synchronized rooms with invite codes.</p></div></div>
      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="rounded-2xl border border-border bg-secondary px-3 py-3 text-sm text-foreground">{media.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
        <input type="datetime-local" value={time} onChange={e => setTime(e.target.value)} className="rounded-2xl border border-border bg-secondary px-3 py-3 text-sm text-foreground" />
        <button onClick={createParty} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground"><Plus className="h-4 w-4" /> Create</button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {parties.map(party => <div key={party.id} className="rounded-2xl border border-border bg-secondary/40 p-4"><p className="font-black text-foreground">{party.title}</p><p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> {new Date(party.scheduled_at || party.created_date).toLocaleString()}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => { navigator.clipboard.writeText(party.invite_code); toast.success('Invite code copied'); }} className="inline-flex items-center gap-2 rounded-xl bg-background px-3 py-2 text-xs font-bold"><Copy className="h-3.5 w-3.5" /> {party.invite_code}</button><Link to={`/watch/${party.media_id}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"><Play className="h-3.5 w-3.5" /> Watch</Link></div></div>)}
      </div>
    </section>
  );
}

function ToolLoader({ label }) { return <div className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin text-primary" />{label}...</div>; }