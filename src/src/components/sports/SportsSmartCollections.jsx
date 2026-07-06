import { AI_CONTENT_TYPES, SPORTS_COLLECTIONS } from '@/lib/sports-hub-data';

export default function SportsSmartCollections({ onSearch }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card/70 p-5">
        <h2 className="text-2xl font-black text-foreground">Auto-collections</h2>
        <p className="mt-1 text-sm text-muted-foreground">Smart folders for live, upcoming, combat, extreme, Australian and historical coverage.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SPORTS_COLLECTIONS.map(collection => <button key={collection} type="button" onClick={() => onSearch(collection)} className="rounded-full bg-secondary px-3 py-2 text-xs font-black text-muted-foreground hover:bg-primary/15 hover:text-primary">{collection}</button>)}
        </div>
      </div>
      <div className="rounded-3xl border border-primary/20 bg-card/70 p-5">
        <h2 className="text-2xl font-black text-foreground">AI content hub</h2>
        <p className="mt-1 text-sm text-muted-foreground">Use these as content lanes for previews, recaps, analysis, rules and stats.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {AI_CONTENT_TYPES.map(type => <div key={type} className="rounded-2xl bg-secondary/60 p-3 text-xs font-black text-muted-foreground">{type}</div>)}
        </div>
      </div>
    </section>
  );
}