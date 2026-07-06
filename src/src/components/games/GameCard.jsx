import { Link } from 'react-router-dom';
import { Cloud, ExternalLink, Gamepad2, MonitorPlay, ShieldCheck, Smartphone, Star } from 'lucide-react';
import { hideWallpaperPreview, showWallpaperPreview } from '@/lib/wallpaper-preview';

const sourceLabels = {
  web_game: 'Playable Web Game',
  cloud_link: 'Cloud Play Link',
  steam: 'Steam Launcher',
  xbox_cloud: 'Xbox Cloud Gaming',
  playstation_cloud: 'PlayStation Cloud',
  app_store: 'App Store Link',
  emulator: 'Legal Emulator Source'
};

const sourceIcons = {
  web_game: MonitorPlay,
  cloud_link: Cloud,
  steam: MonitorPlay,
  xbox_cloud: Cloud,
  playstation_cloud: Cloud,
  app_store: Smartphone,
  emulator: ShieldCheck
};

export default function GameCard({ game, isFavorite = false, onToggleFavorite }) {
  const Icon = sourceIcons[game.source_type] || Gamepad2;
  const playable = Boolean(game.play_url || game.rom_url);

  return (
    <article onMouseEnter={() => showWallpaperPreview(game, 'game')} onMouseLeave={hideWallpaperPreview} className="group overflow-hidden rounded-3xl border border-border bg-card transition-colors duration-200 hover:border-primary/40">
      <div className="relative aspect-[16/10] bg-secondary">
        {game.cover_url || game.banner_url ? (
          <img src={game.cover_url || game.banner_url} alt={game.title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-accent/15">
            <Gamepad2 className="h-12 w-12 text-primary" />
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
          {game.age_rating || 'All Ages'}
        </div>
        {onToggleFavorite && (
          <button onClick={() => onToggleFavorite(game)} aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'} className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 backdrop-blur ${isFavorite ? 'bg-yellow-400 text-black' : 'bg-black/55 text-white hover:bg-black/75'}`}>
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-black' : ''}`} />
          </button>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <Link to={`/games/${game.id}`} className="block truncate text-base font-bold text-foreground hover:text-primary">{game.title}</Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{game.description || 'No description added yet.'}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(game.genres || []).slice(0, 3).map(genre => (
            <span key={genre} className="rounded-full bg-secondary px-2 py-1 text-[11px] font-semibold text-muted-foreground">{genre}</span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-bold text-primary">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{sourceLabels[game.source_type] || 'Game Source'}</span>
          </span>
          {playable ? (
            <Link to={`/games/${game.id}/play`} className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90">
              Play
            </Link>
          ) : game.store_url ? (
            <a href={game.store_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border px-3 text-sm font-bold text-foreground hover:border-primary/50">
              Open <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}