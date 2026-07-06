import { Play, Radio, Star } from 'lucide-react';

export default function ChannelCard({ channel, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(channel)}
      className={`group flex w-full gap-3 rounded-2xl border p-3 text-left transition-all ${active ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/40'}`}
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
        {channel.logo_url ? (
          <img src={channel.logo_url} alt={channel.name} className="h-full w-full object-contain p-1" loading="lazy" />
        ) : (
          <Radio className="h-7 w-7 text-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-foreground">{channel.name}</p>
          {channel.is_featured && <Star className="h-3.5 w-3.5 shrink-0 fill-primary text-primary" />}
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">{channel.category || 'General'} {channel.country ? `• ${channel.country}` : ''}</p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs font-bold text-muted-foreground group-hover:text-primary">
          <Play className="h-3 w-3" /> Watch in app
        </span>
      </div>
    </button>
  );
}
