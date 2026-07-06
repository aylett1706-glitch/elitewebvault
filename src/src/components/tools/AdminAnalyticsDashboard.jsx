import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, Database, Film } from 'lucide-react';
import { supabaseApi, base44 } from '@/api/supabaseApi';

export default function AdminAnalyticsDashboard() {
  const [media, setMedia] = useState([]);
  const [games, setGames] = useState([]);
  const [history, setHistory] = useState([]);
  useEffect(() => { Promise.all([base44.entities.Media.list('-views', 300), base44.entities.Game.list('-views', 100), base44.entities.WatchHistory.list('-last_watched', 300)]).then(([m,g,h]) => { setMedia(m); setGames(g); setHistory(h); }); }, []);
  const stats = useMemo(() => [{ label: 'Media Titles', value: media.length, icon: Film }, { label: 'Games', value: games.length, icon: Database }, { label: 'Watch Events', value: history.length, icon: Activity }, { label: 'Total Views', value: media.reduce((s,i) => s + Number(i.views || 0), 0), icon: BarChart3 }], [media, games, history]);
  return <section className="rounded-3xl border border-border bg-card p-5 elite-panel"><div className="mb-4 flex items-center gap-3"><BarChart3 className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-black">Admin Analytics</h2><p className="text-sm text-muted-foreground">Fast operational snapshot of library performance.</p></div></div><div className="grid gap-3 md:grid-cols-4">{stats.map(stat => <div key={stat.label} className="rounded-2xl border border-border bg-secondary/40 p-4"><stat.icon className="mb-2 h-5 w-5 text-primary" /><p className="text-2xl font-black">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p></div>)}</div></section>;
}