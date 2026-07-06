import { Link } from 'react-router-dom';
import { Brain, Film, Gamepad2, Sparkles, Star } from 'lucide-react';

const scoreBySignals = (item, signals) => {
  const text = [item.title, item.description, item.synopsis, ...(item.genres || []), ...(item.tags || [])].filter(Boolean).join(' ').toLowerCase();
  return signals.reduce((score, signal) => score + (text.includes(signal.toLowerCase()) ? 1 : 0), 0) + (item.rating || 0) / 10 + (item.views || 0) / 1000;
};

export default function AiRecommendations({ media = [], games = [], watchHistory = [], gameProgress = [] }) {
  const watchedTitles = new Set(watchHistory.map(item => item.media_title?.toLowerCase()).filter(Boolean));
  const playedGames = new Set(gameProgress.map(item => item.game_title?.toLowerCase()).filter(Boolean));
  const watchedMedia = media.filter(item => watchedTitles.has(item.title?.toLowerCase()));
  const playedGameItems = games.filter(item => playedGames.has(item.title?.toLowerCase()));
  const signals = [...new Set([
    ...watchedMedia.flatMap(item => item.genres || []),
    ...playedGameItems.flatMap(item => [...(item.genres || []), ...(item.tags || [])])
  ])].slice(0, 10);

  const recommendedMedia = media
    .filter(item => !item.is_adult && !watchedTitles.has(item.title?.toLowerCase()))
    .map(item => ({ ...item, recommendationScore: scoreBySignals(item, signals), kind: 'movie' }))
    .filter(item => item.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 8);

  const recommendedGames = games
    .filter(item => !playedGames.has(item.title?.toLowerCase()))
    .map(item => ({ ...item, recommendationScore: scoreBySignals(item, signals), kind: 'game' }))
    .filter(item => item.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 6);

  const recommendations = [...recommendedMedia, ...recommendedGames].slice(0, 12);
  if (!recommendations.length) return null;

  return (
    <section className="mb-12 px-6 md:px-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary"><Brain className="h-4 w-4" /> AI Recommendations</p>
          <h2 className="mt-1 text-2xl font-black text-foreground">Because of What You Watch & Play</h2>
          <p className="mt-1 text-sm text-muted-foreground">Smart picks based on your watched genres, ratings, and game activity.</p>
        </div>
        <Sparkles className="hidden h-8 w-8 text-primary md:block" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {recommendations.map(item => {
          const isGame = item.kind === 'game';
          const path = isGame ? `/games/${item.id}` : `/media/${item.id}`;
          const image = item.poster_url || item.cover_url || item.banner_url;
          return (
            <Link key={`${item.kind}-${item.id}`} to={path} className="ai-recommendation-card group w-44 shrink-0 rounded-3xl border border-border bg-card p-3 hover:border-primary/40">
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-secondary">
                {image ? <img src={image} alt={item.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center">{isGame ? <Gamepad2 className="h-8 w-8 text-primary" /> : <Film className="h-8 w-8 text-primary" />}</div>}
                <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-black text-white">{isGame ? 'Game' : item.type === 'tv_show' ? 'TV' : 'Movie'}</div>
              </div>
              <h3 className="mt-3 truncate text-sm font-black text-foreground group-hover:text-primary">{item.title}</h3>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{(item.genres || item.tags || []).slice(0, 2).join(' • ') || 'Recommended for you'}</p>
              {(item.rating || item.recommendationScore) && <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-yellow-400"><Star className="h-3 w-3 fill-yellow-400" /> AI match</p>}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
