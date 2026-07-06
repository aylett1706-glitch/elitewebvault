import { Link } from 'react-router-dom';
import { BookOpen, Gamepad2, Radio, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';

const HUB_CONFIG = {
  games: { title: 'Games', icon: Gamepad2, path: item => `/games/${item.id}`, image: 'cover_url', meta: item => item.source_type || 'Game' },
  manga: { title: 'Manga', icon: BookOpen, path: () => '/manga', image: 'cover_url', meta: item => item.author || item.status || 'Manga' },
  live: { title: 'Live TV', icon: Radio, path: () => '/live-tv', image: 'logo_url', meta: item => [item.category, item.country].filter(Boolean).join(' • ') || 'Live channel' },
  performers: { title: 'Performers', icon: UserRound, path: item => `/performers/${item.id}`, image: 'photo_url', meta: item => item.stage_name || item.nationality || 'Performer' }
};

export default function HubSearchSection({ type, items, platform = '' }) {
  const visibleItems = type === 'games' && platform
    ? items.filter(item => [item.source_type, ...(item.platforms || []), ...(item.tags || [])].join(' ').toLowerCase().includes(platform.toLowerCase()))
    : items;

  if (!visibleItems?.length) return null;

  const config = HUB_CONFIG[type];
  const Icon = config.icon;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{config.title} Found {visibleItems.length} Match{visibleItems.length !== 1 ? 'es' : ''}</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {visibleItems.map((item, index) => {
          const imageUrl = item[config.image] || item.banner_url || item.cover_url;
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.03, 0.25) }}>
              <Link to={config.path(item)} className="group block rounded-2xl border border-border bg-card p-3 hover:border-primary/40">
                <div className="mb-2 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-secondary">
                  {imageUrl ? <img src={imageUrl} alt={item.name || item.title} className="h-full w-full object-cover" loading="lazy" /> : <Icon className="h-8 w-8 text-muted-foreground" />}
                </div>
                <p className="truncate text-sm font-bold text-foreground group-hover:text-primary">{item.title || item.name}</p>
                <p className="truncate text-xs text-muted-foreground">{config.meta(item)}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
