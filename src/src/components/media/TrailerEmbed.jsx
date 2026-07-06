import { useMemo, useState } from 'react';
import { ExternalLink, PlayCircle, Youtube } from 'lucide-react';

const getYouTubeId = (url = '') => {
  if (typeof url !== 'string' || !url.trim()) return '';
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  return match?.[1] || '';
};

export default function TrailerEmbed({ trailerUrl, title }) {
  const videoId = getYouTubeId(trailerUrl);
  const [useAltPlayer, setUseAltPlayer] = useState(false);
  const origin = useMemo(() => window.location.origin, []);
  if (!videoId) return null;

  const embedUrl = useAltPlayer
    ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&origin=${encodeURIComponent(origin)}`
    : `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&origin=${encodeURIComponent(origin)}`;

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center gap-2">
        <PlayCircle className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Official Trailer</h2>
      </div>
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/30">
        <iframe
          key={embedUrl}
          title={`${title} trailer`}
          src={embedUrl}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setUseAltPlayer(value => !value)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground hover:border-primary/40"
        >
          <Youtube className="h-4 w-4 text-red-500" />
          Try alternate trailer player
        </button>
        <a
          href={trailerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
        >
          <ExternalLink className="h-4 w-4" />
          Open on YouTube
        </a>
      </div>
    </section>
  );
}