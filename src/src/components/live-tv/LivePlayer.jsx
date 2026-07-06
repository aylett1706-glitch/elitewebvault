import { useEffect, useMemo, useState } from 'react';
import { Info, Radio, RefreshCw, Maximize2, Minimize2, Globe, X, ExternalLink } from 'lucide-react';
import VideoJSPlayer from '@/components/player/VideoJSPlayer';

const isDirectVideoUrl = (url = '') => /\.(m3u8|mp4|webm|ogg|ogv|mpd)(\?|$)/i.test(url);
const isYouTubeUrl = (url = '') => /youtube\.com\/watch\?v=|youtu\.be\//i.test(url);
const isKnownEmbeddableUrl = (url = '') => /\/embed\/|player\.|youtube\.com\/embed|twitch\.tv\/embed|vimeo\.com\/video/i.test(url);

const toYouTubeEmbed = (url = '') => {
  if (!isYouTubeUrl(url)) return url;
  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/i);
  const watchMatch = url.match(/[?&]v=([^?&]+)/i);
  const id = shortMatch?.[1] || watchMatch?.[1];
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1` : url;
};

const getHost = (url = '') => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export default function LivePlayer({ channel }) {
  const [frameKey, setFrameKey] = useState(0);
  const [playerRef, setPlayerRef] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWebBrowser, setShowWebBrowser] = useState(false);

  const handleFullscreen = () => {
    if (playerRef?.requestFullscreen) {
      playerRef.requestFullscreen();
    }
  };

  const handleExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const source = useMemo(() => {
    if (!channel) return null;
    const rawUrl = channel.embed_url || channel.stream_url || '';
    const url = toYouTubeEmbed(rawUrl);
    const direct = isDirectVideoUrl(channel.stream_url || rawUrl);
    const embeddable = !!channel.embed_url || channel.source_type === 'embed' || isYouTubeUrl(rawUrl) || isKnownEmbeddableUrl(rawUrl);
    return { rawUrl, url, direct, embeddable, host: getHost(rawUrl) };
  }, [channel]);

  useEffect(() => {
    setShowWebBrowser(false);
  }, [channel?.id]);

  if (!channel) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-3xl border border-border bg-card text-center">
        <div>
          <Radio className="mx-auto mb-3 h-10 w-10 text-primary" />
          <p className="text-lg font-bold text-foreground">Choose a channel</p>
          <p className="text-sm text-muted-foreground">Select any live channel to start watching.</p>
        </div>
      </div>
    );
  }

  return (
    <section ref={setPlayerRef} className="overflow-hidden rounded-3xl border border-primary/20 bg-black card-glow">
      <div className="relative aspect-video w-full bg-black">
        {source?.direct ? (
          <VideoJSPlayer key={source.url} url={source.url} />
        ) : source?.embeddable ? (
          <iframe
            key={frameKey}
            title={channel.name}
            src={source.url}
            className="h-full w-full"
            referrerPolicy="no-referrer-when-downgrade"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : showWebBrowser && source?.rawUrl ? (
          <div className="relative h-full w-full bg-black">
            <iframe
              title={`${channel.name} in-app browser`}
              src={source.rawUrl}
              className="h-full w-full"
              referrerPolicy="no-referrer-when-downgrade"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share"
              allowFullScreen
            />
            <button onClick={() => setShowWebBrowser(false)} className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/75 px-3 py-2 text-xs font-bold text-white backdrop-blur hover:bg-black">
              <X className="h-4 w-4" /> Close browser
            </button>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div className="max-w-md">
              <Info className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Open in-app browser</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {channel.name} blocks embedded playback, so it needs to open as the official player in this same tab.
              </p>
              {source?.rawUrl && (
                <button onClick={() => { window.location.href = source.rawUrl; }} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                  <ExternalLink className="h-4 w-4" /> Open official player
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Now Playing</p>
          <h2 className="text-2xl font-bold text-foreground">{channel.name}</h2>
          <p className="text-sm text-muted-foreground">{channel.category || 'General'} {channel.country ? `• ${channel.country}` : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2">
           {isFullscreen ? (
             <button onClick={handleExitFullscreen} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground">
               <Minimize2 className="h-4 w-4" /> Exit fullscreen
             </button>
           ) : (
             <button onClick={handleFullscreen} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground">
               <Maximize2 className="h-4 w-4" /> Fullscreen
             </button>
           )}
           {source?.embeddable && !source.direct && (
             <button onClick={() => setFrameKey(key => key + 1)} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground">
               <RefreshCw className="h-4 w-4" /> Reload player
             </button>
           )}
           {source?.host && (
             <span className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-muted-foreground">
               Playing in app from {source.host}
             </span>
           )}
         </div>
      </div>
    </section>
  );
}