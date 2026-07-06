import { ExternalLink } from 'lucide-react';
import { OFFICIAL_SPORT_SOURCES } from '@/lib/sports-hub-data';

export default function SportsSourceDirectory() {
  return (
    <section className="rounded-3xl border border-border bg-card/70 p-5">
      <div className="mb-4">
        <h2 className="text-2xl font-black text-foreground">Official free/open sports sources</h2>
        <p className="text-sm text-muted-foreground">Links go to official broadcasters or rights holders. Availability can vary by region and event.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {OFFICIAL_SPORT_SOURCES.map(source => (
          <a key={source.name} href={source.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-border bg-secondary/45 p-4 hover:border-primary/35">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-foreground">{source.name}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{source.region}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {source.tags.map(tag => <span key={tag} className="rounded-full bg-background px-2 py-1 text-[11px] font-bold text-muted-foreground">{tag}</span>)}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}