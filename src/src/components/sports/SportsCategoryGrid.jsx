import { SPORT_CATEGORIES } from '@/lib/sports-hub-data';

export default function SportsCategoryGrid({ selectedCategory, onSelectCategory }) {
  return (
    <section className="rounded-3xl border border-border bg-card/70 p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">Full sports coverage</h2>
          <p className="text-sm text-muted-foreground">Tap a category to filter events and collections.</p>
        </div>
        <button type="button" onClick={() => onSelectCategory('')} className="text-sm font-bold text-primary hover:text-primary/80">Show all</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {SPORT_CATEGORIES.map(category => (
          <button key={category.id} type="button" onClick={() => onSelectCategory(category.id)} className={`rounded-3xl border p-4 text-left transition-colors ${selectedCategory === category.id ? 'border-primary bg-primary/15' : 'border-border bg-secondary/40 hover:border-primary/35'}`}>
            <h3 className="text-lg font-black text-foreground">{category.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{category.tagline}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {category.sports.slice(0, 9).map(sport => <span key={sport} className="rounded-full bg-background px-2 py-1 text-[11px] font-bold text-muted-foreground">{sport}</span>)}
              {category.sports.length > 9 && <span className="rounded-full bg-primary/15 px-2 py-1 text-[11px] font-bold text-primary">+{category.sports.length - 9} more</span>}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}