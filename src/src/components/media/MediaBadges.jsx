import { Eye, Flame, ShieldCheck, Sparkles, Star, Tv } from 'lucide-react';

export default function MediaBadges({ item, compact = false }) {
  const badges = [];

  if (item?.is_trending || (item?.views || 0) >= 25) badges.push({ label: 'Trending', icon: Flame, className: 'bg-red-500/15 text-red-300 border-red-500/25' });
  if ((item?.imdb_rating || item?.rating || 0) >= 8) badges.push({ label: 'Top Rated', icon: Star, className: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/25' });
  if (item?.content_rating) badges.push({ label: `${item.age_rating_country ? `${item.age_rating_country} ` : ''}${item.content_rating}`, icon: ShieldCheck, className: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/25' });
  if (item?.type === 'tv_show') badges.push({ label: 'Series', icon: Tv, className: 'bg-blue-400/15 text-blue-300 border-blue-400/25' });
  if (item?.is_featured) badges.push({ label: 'Featured', icon: Sparkles, className: 'bg-primary/15 text-primary border-primary/25' });
  if ((item?.views || 0) > 0) badges.push({ label: `${item.views} views`, icon: Eye, className: 'bg-white/10 text-white/80 border-white/10' });

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.slice(0, compact ? 2 : 5).map(({ label, icon: Icon, className }) => (
        <span key={label} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${className}`}>
          <Icon className="h-3 w-3" /> {label}
        </span>
      ))}
    </div>
  );
}