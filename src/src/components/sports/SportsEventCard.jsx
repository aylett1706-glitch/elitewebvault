import { CalendarDays, ExternalLink, Radio, Trophy } from 'lucide-react';

export default function SportsEventCard({ event }) {
  const watchUrl = event.stream_url || event.official_source_url;
  const statusClass = event.status === 'live' ? 'bg-red-500/20 text-red-300' : event.status === 'result' ? 'bg-green-500/15 text-green-300' : 'bg-primary/15 text-primary';

  return (
    <article className="rounded-3xl border border-border bg-card/80 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-black uppercase ${statusClass}`}>{event.status === 'live' ? <Radio className="h-3 w-3" /> : <Trophy className="h-3 w-3" />}{event.status}</span>
          <h3 className="mt-2 line-clamp-2 text-lg font-black text-foreground">{event.title}</h3>
        </div>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground">
        <p><span className="font-bold text-foreground">{event.sport}</span>{event.competition ? ` · ${event.competition}` : ''}</p>
        {event.discipline && <p>{event.discipline}</p>}
        {event.score_summary && <p className="font-bold text-primary">{event.score_summary}</p>}
        {event.start_time && <p className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{new Date(event.start_time).toLocaleString()}</p>}
        {event.source_name && <p>Source: {event.source_name}</p>}
      </div>
      {watchUrl && (
        <a href={watchUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/15 px-4 text-sm font-black text-primary hover:bg-primary/25">
          Watch / View Official Source <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </article>
  );
}