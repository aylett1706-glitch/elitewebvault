import { Link } from 'react-router-dom';
import { Film, Link2 } from 'lucide-react';

export default function LinkedMediaSection({ title = 'Linked Titles', items = [] }) {
  if (!items.length) return null;

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center gap-2">
        <Link2 className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {items.map(item => (
          <Link key={item.id} to={`/media/${item.id}`} className="group">
            <div className="mb-2 aspect-[2/3] overflow-hidden rounded-xl bg-secondary transition-transform group-hover:scale-105">
              {item.poster_url ? (
                <img src={item.poster_url} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center"><Film className="h-8 w-8 text-muted-foreground" /></div>
              )}
            </div>
            <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.year}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}