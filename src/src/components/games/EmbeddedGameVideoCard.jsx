import { useMemo, useState } from 'react';
import { ExternalLink, Play, RefreshCw, Youtube } from 'lucide-react';

const getYouTubeId = (video) => {
  if (typeof video?.id === 'string' && /^[\w-]{6,}$/.test(video.id)) return video.id;
  const url = video?.video_url || video?.url || '';
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/i);
  return match?.[1] || '';
};

export default function EmbeddedGameVideoCard({ video, compact = false }) {
  const videoId = getYouTubeId(video);
  const [useAltPlayer, setUseAltPlayer] = useState(false);
  const origin = useMemo(() => encodeURIComponent(window.location.origin), []);
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : video?.video_url;
  const embedUrl = videoId
    ? `${useAltPlayer ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com'}/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&origin=${origin}`
    : '';

  return (
    <article className={`${compact ? 'w-80 shrink-0' : ''} overflow-hidden rounded-3xl border border-border bg-card`}>
      <div className="relative aspect-video bg-secondary">
        {videoId ? (
          <iframe
            key={embedUrl}
            title={video.title || 'YouTube video'}
            src={embedUrl}
            className="h-full w-full"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center"><Youtube className="h-10 w-10 text-primary" /></div>
        )}
        {!videoId && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Play className="h-8 w-8 text-primary" /></div>}
      </div>
      <div className="p-4">
        <p className="line-clamp-2 text-sm font-black text-foreground">{video.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{video.channel_title} · {video.views?.toLocaleString?.() || 0} views</p>
        {videoId && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setUseAltPlayer(value => !value)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
              <RefreshCw className="h-3.5 w-3.5" /> Fix player
            </button>
            <a href={watchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold text-primary hover:text-primary/80">
              <ExternalLink className="h-3.5 w-3.5" /> YouTube
            </a>
          </div>
        )}
      </div>
    </article>
  );
}