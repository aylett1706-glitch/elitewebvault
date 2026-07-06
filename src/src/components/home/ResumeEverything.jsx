import { Gamepad2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResumeEverything({ watchHistory, gameSaves, gameProgress }) {
  const items = [
    ...(watchHistory || []).map(item => ({
      id: `media-${item.id}`,
      title: item.media_title,
      subtitle: item.completed ? 'Finished' : `${Math.round(((item.progress_seconds || 0) / Math.max(item.duration_seconds || 1, 1)) * 100)}% watched`,
      image: item.poster_url,
      path: `/watch/${item.media_id}?${item.media_type === 'tv_show' ? `season=${item.season || 1}&episode=${item.episode || 1}&` : ''}t=${item.progress_seconds || 0}`,
      type: 'media'
    })),
    ...(gameSaves || []).map(item => ({
      id: `game-${item.id}`,
      title: item.game_title,
      subtitle: 'Saved game checkpoint',
      image: '',
      path: `/games/${item.game_id}/play`,
      type: 'game'
    })),
    ...(gameProgress || []).map(item => ({
      id: `game-progress-${item.id}`,
      title: item.game_title,
      subtitle: item.progress_label || 'Game in progress',
      image: '',
      path: `/games/${item.game_id}/play`,
      type: 'game'
    }))
  ].slice(0, 12);

  if (!items.length) return null;

  return (
    <section className="mb-10 px-6 md:px-12">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Pick up where you left off</p>
        <h2 className="text-2xl font-black text-foreground">Resume Everything</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(item => (
          <Link key={item.id} to={item.path} className="group flex gap-3 rounded-2xl border border-border bg-card p-3 hover:border-primary/40">
            <div className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary">
              {item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : <Gamepad2 className="h-7 w-7 text-primary" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-black text-foreground group-hover:text-primary">{item.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-black text-primary"><Play className="h-3 w-3 fill-primary" /> Resume</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}