import { Activity, Radio, Sparkles, Trophy } from 'lucide-react';

export default function SportsHero({ events }) {
  const liveCount = events.filter(event => event.status === 'live').length;
  const upcomingCount = events.filter(event => event.status === 'upcoming').length;

  return (
    <section className="overflow-hidden rounded-3xl border border-primary/25 bg-card/80 p-5 elite-panel md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr] lg:items-end">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-primary"><Trophy className="h-4 w-4" /> Ultimate Elite Sports Hub</p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">All sports, combat and extreme events in one hub</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">Organise every sport, add official/free watch links, track live and upcoming events, and build auto-collections for teams, fighters, athletes, leagues and competitions.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-secondary/70 p-4"><Radio className="mx-auto mb-2 h-5 w-5 text-red-300" /><p className="text-2xl font-black text-red-300">{liveCount}</p><p className="text-[11px] uppercase tracking-widest text-muted-foreground">Live</p></div>
          <div className="rounded-2xl bg-secondary/70 p-4"><Activity className="mx-auto mb-2 h-5 w-5 text-primary" /><p className="text-2xl font-black text-primary">{upcomingCount}</p><p className="text-[11px] uppercase tracking-widest text-muted-foreground">Upcoming</p></div>
          <div className="rounded-2xl bg-secondary/70 p-4"><Sparkles className="mx-auto mb-2 h-5 w-5 text-accent" /><p className="text-2xl font-black text-accent">100%</p><p className="text-[11px] uppercase tracking-widest text-muted-foreground">Organised</p></div>
        </div>
      </div>
    </section>
  );
}