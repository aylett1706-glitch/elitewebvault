export default function ActorTimeline({ credits }) {
  const timeline = [...credits]
    .filter(item => item.year)
    .sort((a, b) => a.year - b.year)
    .filter((item, index, arr) => index === 0 || item.year !== arr[index - 1].year)
    .slice(0, 12);

  if (!timeline.length) return null;

  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">AI Career Timeline</p>
      <h2 className="mt-1 text-2xl font-black text-foreground">Career Evolution</h2>
      <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {timeline.map(item => (
          <div key={`${item.year}-${item.title}`} className="w-52 shrink-0 rounded-2xl border border-border bg-secondary/40 p-4">
            <p className="text-2xl font-black text-primary">{item.year}</p>
            <h3 className="mt-2 line-clamp-2 font-bold text-foreground">{item.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.type === 'tv_show' ? 'TV' : 'Movie'}{item.character ? ` • ${item.character}` : ''}</p>
          </div>
        ))}
      </div>
    </section>
  );
}