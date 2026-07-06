import { Link } from 'react-router-dom';
import { Film, Star } from 'lucide-react';

const scoreMatch = (current, item) => {
  const currentTags = new Set([...(current.genres || []), ...(current.cast || [])].map(v => String(v).toLowerCase()));
  const itemTags = [...(item.genres || []), ...(item.cast || [])].map(v => String(v).toLowerCase());
  return itemTags.reduce((score, tag) => score + (currentTags.has(tag) ? 1 : 0), 0);
};

export default function MoreLikeThis({ current, items }) {
  const suggestions = (items || [])
    .filter(item => item.id !== current?.id)
    .map(item => ({ ...item, matchScore: scoreMatch(current, item) }))
    .filter(item => item.matchScore > 0 || item.is_adult === current?.is_adult)
    .sort((a, b) => b.matchScore - a.matchScore || (b.views || 0) - (a.views || 0))
    .slice(0, 12);

  if (!suggestions.length) return null;

  return (
    <section className="bg-background px-4 md:px-8 py-8 border-t border-white/10">
      <div className="max-w-screen-2xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-5">More Like This</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {suggestions.map(item => (
            <Link key={item.id} to={`/watch/${item.id}`} className="group block">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary border border-white/10 mb-2">
                {item.poster_url ? (
                  <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Film className="w-8 h-8 text-muted-foreground" /></div>
                )}
                {item.rating ? (
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-yellow-400">
                    <Star className="w-3 h-3 fill-yellow-400" /> {item.rating.toFixed(1)}
                  </div>
                ) : null}
              </div>
              <p className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{item.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{(item.genres || []).slice(0, 2).join(' · ')}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}