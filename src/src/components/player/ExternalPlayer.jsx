import { useState, useEffect, useRef, useCallback } from 'react';
import { Link2, X, Check, ChevronLeft, ChevronRight, RefreshCw, ArrowLeft, Home, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { supabaseApi, base44 } from '@/api/supabaseApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Reliable English embed providers only — lower-risk sources first
const getEmbedSources = (media, season = 1, episode = 1) => {
  const tmdb = media.tmdb_id;
  const imdb = media.imdb_id;
  const isTV = media.type === 'tv_show';
  const s = season;
  const e = episode;
  const sources = [];

  const addSource = (name, url, tier = 1) => {
    if (!url) return;
    sources.push({ name, url, tier, language: 'en', watermarkRisk: 'lower' });
  };

  if (tmdb) {
    if (isTV) {
      addSource('V2', `https://vidsrc.vip/embed/tv/${tmdb}/${s}/${e}`, 1);
      addSource('Premium', `https://vidsrc.vip/embed/tv?tmdb=${tmdb}&season=${s}&episode=${e}`, 1);
      addSource('4K', `https://vidsrc.net/embed/tv/${tmdb}/${s}/${e}`, 1);
      addSource('Max', `https://vidsrc.dev/embed/tv/${tmdb}/${s}/${e}`, 1);
      addSource('Vidfast', `https://vidfast.pro/tv/${tmdb}/${s}/${e}`, 1);
      addSource('Vidpro', `https://vidsrc.pro/embed/tv/${tmdb}/${s}/${e}`, 1);
      addSource('Atlas', `https://vidsrc.to/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('Vidsrc', `https://vidsrc.me/embed/tv?tmdb=${tmdb}&season=${s}&episode=${e}`, 2);
      addSource('Bravo', `https://embed.su/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('VidLink', `https://vidlink.pro/tv/${tmdb}/${s}/${e}`, 2);
      addSource('Vidsrc CC', `https://vidsrc.cc/v2/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('Vidsrc IN', `https://vidsrc.in/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('Vidsrc PM', `https://vidsrc.pm/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('Vidsrc ICU', `https://vidsrc.icu/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('Vidsrc XYZ', `https://vidsrc.xyz/embed/tv?tmdb=${tmdb}&season=${s}&episode=${e}`, 2);
      addSource('Vidsrc RIP', `https://vidsrc.rip/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('MoviesAPI', `https://moviesapi.club/tv/${tmdb}-${s}-${e}`, 2);
      addSource('AutoEmbed', `https://player.autoembed.cc/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('Wyzie', `https://embed.wyzie.ru/tv/${tmdb}/${s}/${e}`, 2);
      addSource('2Embed', `https://www.2embed.cc/embedtv/${tmdb}&s=${s}&e=${e}`, 2);
      addSource('MultiEmbed', `https://multiembed.mov/directstream.php?video_id=${tmdb}&tmdb=1&s=${s}&e=${e}`, 2);
      addSource('111Movies', `https://111movies.com/tv/${tmdb}/${s}/${e}`, 2);
      addSource('Smashy', `https://embed.smashystream.com/playere.php?tmdb=${tmdb}&season=${s}&episode=${e}`, 2);
      addSource('VidSrc One', `https://vidsrc.one/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('VidSrc Stream', `https://vidsrc.stream/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('VidSrc Online', `https://vidsrc.online/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('VidSrc Cloud', `https://vidsrc.cloud/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('VidSrc Site', `https://vidsrc.site/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('VidSrc Watch', `https://vidsrc.watch/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('VidSrc Fun', `https://vidsrc.fun/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('VidSrc Info', `https://vidsrc.info/embed/tv/${tmdb}/${s}/${e}`, 2);
      addSource('VidSrc Link', `https://vidsrc.link/embed/tv/${tmdb}/${s}/${e}`, 2);
    } else {
      addSource('V2', `https://vidsrc.vip/embed/movie/${tmdb}`, 1);
      addSource('Premium', `https://vidsrc.vip/embed/movie?tmdb=${tmdb}`, 1);
      addSource('4K', `https://vidsrc.net/embed/movie/${tmdb}`, 1);
      addSource('Max', `https://vidsrc.dev/embed/movie/${tmdb}`, 1);
      addSource('Vidfast', `https://vidfast.pro/movie/${tmdb}`, 1);
      addSource('Vidpro', `https://vidsrc.pro/embed/movie/${tmdb}`, 1);
      addSource('Atlas', `https://vidsrc.to/embed/movie/${tmdb}`, 2);
      addSource('Vidsrc', `https://vidsrc.me/embed/movie?tmdb=${tmdb}`, 2);
      addSource('Bravo', `https://embed.su/embed/movie/${tmdb}`, 2);
      addSource('VidLink', `https://vidlink.pro/movie/${tmdb}`, 2);
      addSource('Vidsrc CC', `https://vidsrc.cc/v2/embed/movie/${tmdb}`, 2);
      addSource('Vidsrc IN', `https://vidsrc.in/embed/movie/${tmdb}`, 2);
      addSource('Vidsrc PM', `https://vidsrc.pm/embed/movie/${tmdb}`, 2);
      addSource('Vidsrc ICU', `https://vidsrc.icu/embed/movie/${tmdb}`, 2);
      addSource('Vidsrc XYZ', `https://vidsrc.xyz/embed/movie?tmdb=${tmdb}`, 2);
      addSource('Vidsrc RIP', `https://vidsrc.rip/embed/movie/${tmdb}`, 2);
      addSource('MoviesAPI', `https://moviesapi.club/movie/${tmdb}`, 2);
      addSource('AutoEmbed', `https://player.autoembed.cc/embed/movie/${tmdb}`, 2);
      addSource('Wyzie', `https://embed.wyzie.ru/movie/${tmdb}`, 2);
      addSource('2Embed', `https://www.2embed.cc/embed/${tmdb}`, 2);
      addSource('MultiEmbed', `https://multiembed.mov/directstream.php?video_id=${tmdb}&tmdb=1`, 2);
      addSource('111Movies', `https://111movies.com/movie/${tmdb}`, 2);
      addSource('Smashy', `https://embed.smashystream.com/playere.php?tmdb=${tmdb}`, 2);
      addSource('VidSrc One', `https://vidsrc.one/embed/movie/${tmdb}`, 2);
      addSource('VidSrc Stream', `https://vidsrc.stream/embed/movie/${tmdb}`, 2);
      addSource('VidSrc Online', `https://vidsrc.online/embed/movie/${tmdb}`, 2);
      addSource('VidSrc Cloud', `https://vidsrc.cloud/embed/movie/${tmdb}`, 2);
      addSource('VidSrc Site', `https://vidsrc.site/embed/movie/${tmdb}`, 2);
      addSource('VidSrc Watch', `https://vidsrc.watch/embed/movie/${tmdb}`, 2);
      addSource('VidSrc Fun', `https://vidsrc.fun/embed/movie/${tmdb}`, 2);
      addSource('VidSrc Info', `https://vidsrc.info/embed/movie/${tmdb}`, 2);
      addSource('VidSrc Link', `https://vidsrc.link/embed/movie/${tmdb}`, 2);
    }
  }

  if (imdb) {
    if (isTV) {
      addSource('Vidsrc IMDb', `https://vidsrc.to/embed/tv/${imdb}/${s}/${e}`, 2);
      addSource('Vidsrc.me IMDb', `https://vidsrc.me/embed/tv?imdb=${imdb}&season=${s}&episode=${e}`, 2);
      addSource('Vidsrc IN IMDb', `https://vidsrc.in/embed/tv/${imdb}/${s}/${e}`, 2);
      addSource('Vidsrc PM IMDb', `https://vidsrc.pm/embed/tv/${imdb}/${s}/${e}`, 2);
      addSource('AutoEmbed IMDb', `https://player.autoembed.cc/embed/tv/${imdb}/${s}/${e}`, 2);
      addSource('Smashy IMDb', `https://embed.smashystream.com/playere.php?imdb=${imdb}&season=${s}&episode=${e}`, 2);
    } else {
      addSource('Vidsrc IMDb', `https://vidsrc.to/embed/movie/${imdb}`, 2);
      addSource('Vidsrc.me IMDb', `https://vidsrc.me/embed/movie?imdb=${imdb}`, 2);
    }
  }

  const reliabilityRank = {
    V2: 1,
    Premium: 2,
    '4K': 3,
    Max: 4,
    Vidfast: 5,
    Vidpro: 6,
    Atlas: 7,
    Vidsrc: 8,
    Bravo: 9,
    VidLink: 10,
    'Vidsrc CC': 11,
    'Vidsrc IN': 12,
    'Vidsrc PM': 13,
    'Vidsrc ICU': 14,
    'Vidsrc XYZ': 15,
    'Vidsrc RIP': 16,
    MoviesAPI: 17,
    AutoEmbed: 18,
    Wyzie: 19,
    '2Embed': 20,
    MultiEmbed: 21,
    '111Movies': 22,
    Smashy: 23,
    'VidSrc One': 24,
    'VidSrc Stream': 25,
    'VidSrc Online': 26,
    'VidSrc Cloud': 27,
    'VidSrc Site': 28,
    'VidSrc Watch': 29,
    'VidSrc Fun': 30,
    'VidSrc Info': 31,
    'VidSrc Link': 32,
    'Vidsrc IMDb': 33,
    'Vidsrc.me IMDb': 34,
  };

  const seen = new Set();
  return sources
    .filter(source => {
      if (!source.url || seen.has(source.url)) return false;
      seen.add(source.url);
      return true;
    })
    .sort((a, b) => (reliabilityRank[a.name] || 50) - (reliabilityRank[b.name] || 50));
};

const TIER_LABEL = {
  1: { text: 'Clean HD', color: 'text-green-400' },
  2: { text: 'Backup', color: 'text-yellow-400' },
  3: { text: 'ALT', color: 'text-orange-400' },
};

const getSeasonOptions = (media, currentSeason) => {
  if (media.type !== 'tv_show') return [];
  const seasons = new Set((media.episodes || []).map(ep => ep.season).filter(Boolean));
  for (let i = 1; i <= (media.seasons || currentSeason || 1); i++) seasons.add(i);
  seasons.add(currentSeason || 1);
  return [...seasons].sort((a, b) => a - b);
};

const getEpisodeOptions = (media, currentSeason, currentEpisode) => {
  if (media.type !== 'tv_show') return [];
  const episodes = new Set((media.episodes || [])
    .filter(ep => ep.season === currentSeason)
    .map(ep => ep.episode)
    .filter(Boolean));
  if (episodes.size === 0) {
    for (let i = 1; i <= Math.max(currentEpisode || 1, 30); i++) episodes.add(i);
  }
  episodes.add(currentEpisode || 1);
  return [...episodes].sort((a, b) => a - b);
};

// Timeout before we show that the current source may be unavailable
const LOAD_TIMEOUT_MS = 4500;

const withSoundParams = (url) => url || '';

export default function ExternalPlayer({ media, season = 1, episode = 1, savedUrl, onSourceSaved, fullScreen = true }) {
  const navigate = useNavigate();

  const rawSources = getEmbedSources(media, season, episode);
  const savedSource = savedUrl ? { name: 'Saved Source', url: savedUrl, tier: 1, watermarkRisk: 'lower' } : null;
  const embedSources = savedSource
    ? [savedSource, ...rawSources.filter(source => source.url !== savedUrl)]
    : rawSources;

  const [sourceIndex, setSourceIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'loaded' | 'timeout'
  const [showManual, setShowManual] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [deadSources, setDeadSources] = useState(new Set());
  const timeoutRef = useRef(null);
  const playerShellRef = useRef(null);
  const iframeRef = useRef(null);
  const [isPlayerFullscreen, setIsPlayerFullscreen] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);

  const sourceMemoryKey = `ev_preferred_source_${media.type}_${media.tmdb_id || media.imdb_id || media.id}`;
  const currentSource = embedSources[sourceIndex];
  const isTV = media.type === 'tv_show';
  const seasonOptions = getSeasonOptions(media, season);
  const episodeOptions = getEpisodeOptions(media, season, episode);

  const goToEpisode = (nextSeason, nextEpisode) => {
    navigate(`/watch/${media.id}?season=${nextSeason}&episode=${nextEpisode}`);
  };

  useEffect(() => {
    embedSources.slice(sourceIndex, sourceIndex + 4).forEach((source) => {
      if (!source?.url) return;
      const origin = new URL(source.url).origin;
      if (document.querySelector(`link[data-player-preconnect="${origin}"]`)) return;

      const dns = document.createElement('link');
      dns.rel = 'dns-prefetch';
      dns.href = origin;
      dns.dataset.playerPreconnect = origin;
      document.head.appendChild(dns);

      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = origin;
      preconnect.crossOrigin = 'anonymous';
      preconnect.dataset.playerPreconnect = origin;
      document.head.appendChild(preconnect);
    });
  }, [embedSources, sourceIndex]);

  const startLoadTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setLoadState('loading');
    timeoutRef.current = setTimeout(() => {
      setLoadState('timeout');
      setDeadSources(prev => new Set([...prev, sourceIndex]));
    }, LOAD_TIMEOUT_MS);
  }, [sourceIndex]);

  useEffect(() => {
    const preferredUrl = localStorage.getItem(sourceMemoryKey);
    const preferredIndex = embedSources.findIndex(source => source.url === preferredUrl);
    if (preferredIndex > 0) switchSource(preferredIndex);
  }, []);

  // Start timer on mount and whenever source changes
  useEffect(() => {
    startLoadTimer();
    return () => clearTimeout(timeoutRef.current);
  }, [sourceIndex, iframeKey, startLoadTimer]);

  useEffect(() => {
    const syncFullscreen = () => {
      setIsPlayerFullscreen(
        document.fullscreenElement === iframeRef.current ||
        document.fullscreenElement === playerShellRef.current
      );
    };
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isCssFullscreen ? 'hidden' : '';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsCssFullscreen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isCssFullscreen]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    setIsCssFullscreen(value => !value);
  };

  const switchSource = useCallback((idx) => {
    setSourceIndex(idx);
    setIframeKey(k => k + 1);
    setDeadSources(prev => prev); // keep dead set
  }, []);

  const nextSource = () => switchSource((sourceIndex + 1) % embedSources.length);
  const prevSource = () => switchSource((sourceIndex - 1 + embedSources.length) % embedSources.length);
  const reload = () => { setIframeKey(k => k + 1); startLoadTimer(); };

  const markDeadAndSkip = () => {
    setDeadSources(prev => new Set([...prev, sourceIndex]));
    // Find next non-dead source
    let next = (sourceIndex + 1) % embedSources.length;
    let tries = 0;
    while (deadSources.has(next) && tries < embedSources.length) {
      next = (next + 1) % embedSources.length;
      tries++;
    }
    switchSource(next);
  };

  const handleIframeLoad = () => {
    setLoadState('loaded');
    if (currentSource?.url) localStorage.setItem(sourceMemoryKey, currentSource.url);
  };

  const handleIframeError = () => {
    setLoadState('timeout');
    setDeadSources(prev => new Set([...prev, sourceIndex]));
  };

  const handleSaveManual = async () => {
    if (!manualUrl.trim()) return;
    setSaving(true);
    await base44.entities.Media.update(media.id, { video_url: manualUrl.trim() });
    toast.success('Source saved!');
    setSaving(false);
    setShowManual(false);
    if (onSourceSaved) onSourceSaved(manualUrl.trim());
  };

  if (embedSources.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative bg-black">
        {media.backdrop_url && (
          <img src={media.backdrop_url} alt={media.title} className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-20 w-10 h-10 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-black/90 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative z-10 text-center flex flex-col items-center gap-6 px-6 max-w-md w-full">
          <h2 className="text-white text-2xl font-bold">{media.title}</h2>
          <p className="text-white/50 text-sm">No TMDB/IMDB ID found. Add one via Admin to enable streaming, or paste a custom URL below.</p>
          <button onClick={() => setShowManual(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-all">
            <Link2 className="w-4 h-4" /> Add Video Source
          </button>
        </div>
        {showManual && <ManualUrlModal onClose={() => setShowManual(false)} value={manualUrl} onChange={setManualUrl} onSave={handleSaveManual} saving={saving} />}
      </div>
    );
  }

  const tier = currentSource?.tier ? TIER_LABEL[currentSource.tier] : TIER_LABEL[2];

  return (
    <div
      ref={playerShellRef}
      className={`${isCssFullscreen ? 'fixed inset-0 z-[9999] h-[100dvh] w-screen' : 'relative h-full w-full'} bg-black`}
      style={{ minHeight: fullScreen || isCssFullscreen ? '100dvh' : '70vh' }}
    >
      {/* Top control bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-1.5 px-3 py-2 bg-gradient-to-b from-black/95 via-black/60 to-transparent">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg bg-black/80 flex items-center justify-center text-white hover:bg-black transition-colors" title="Back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button onClick={() => navigate('/')} className="w-8 h-8 rounded-lg bg-black/80 flex items-center justify-center text-white hover:bg-black transition-colors" title="Home">
          <Home className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-white/20 mx-1" />

        {isTV && (
          <div className="hidden sm:flex items-center gap-1.5">
            <select
              value={season}
              onChange={e => goToEpisode(Number(e.target.value), 1)}
              className="h-8 rounded-lg bg-black/80 border border-white/10 px-2 text-white text-xs font-semibold focus:outline-none cursor-pointer"
              title="Season"
            >
              {seasonOptions.map(s => <option key={s} value={s} className="bg-black">S{s}</option>)}
            </select>
            <select
              value={episode}
              onChange={e => goToEpisode(season, Number(e.target.value))}
              className="h-8 rounded-lg bg-black/80 border border-white/10 px-2 text-white text-xs font-semibold focus:outline-none cursor-pointer"
              title="Episode"
            >
              {episodeOptions.map(e => <option key={e} value={e} className="bg-black">E{e}</option>)}
            </select>
          </div>
        )}

        <button onClick={prevSource} className="w-8 h-8 rounded-lg bg-black/80 flex items-center justify-center text-white hover:bg-black transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Source dropdown */}
        <div className="relative flex items-center gap-1.5 bg-black/80 border border-white/10 rounded-lg px-2 py-1">
          {loadState === 'loading' && <Loader2 className="w-3 h-3 text-white/50 animate-spin shrink-0" />}
          {loadState === 'loaded' && <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />}
          {loadState === 'timeout' && <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />}
          <select
            value={sourceIndex}
            onChange={e => switchSource(Number(e.target.value))}
            className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer max-w-[140px]"
          >
            {embedSources.map((s, i) => (
              <option key={i} value={i} className="bg-black">
                {deadSources.has(i) ? '✗ ' : ''}{s.name}{s.watermarkRisk === 'higher' ? ' · backup' : ''}
              </option>
            ))}
          </select>
          <span className={`text-xs font-bold ${tier.color}`}>{tier.text}</span>
        </div>

        <button onClick={nextSource} className="w-8 h-8 rounded-lg bg-black/80 flex items-center justify-center text-white hover:bg-black transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={markDeadAndSkip} className="hidden sm:flex items-center gap-1.5 bg-black/80 hover:bg-black text-white/70 hover:text-white px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-white/10">
          Skip
        </button>
        <button onClick={reload} className="w-8 h-8 rounded-lg bg-black/80 flex items-center justify-center text-white hover:bg-black transition-colors" title="Reload">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1" />

        <span className="text-white/40 text-xs hidden sm:block truncate max-w-[200px]">{media.title}</span>

        <div className="flex-1" />

        <button onClick={toggleFullscreen} className="flex items-center gap-1.5 bg-black/80 hover:bg-black text-white/70 hover:text-white px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-white/10">
          {isPlayerFullscreen || isCssFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />} Fullscreen
        </button>
        <button onClick={() => setShowManual(true)} className="flex items-center gap-1.5 bg-black/80 hover:bg-black text-white/70 hover:text-white px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-white/10">
          <Link2 className="w-3 h-3" /> Custom URL
        </button>
      </div>

      {loadState === 'loading' && (
        <div className="absolute left-3 bottom-3 z-10 flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs font-bold text-white/70 pointer-events-none">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          Preparing source
        </div>
      )}

      {/* The iframe */}
      <iframe
        ref={iframeRef}
        key={iframeKey}
        src={withSoundParams(currentSource?.url)}
        referrerPolicy="no-referrer"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
        title={media.title}
        loading="eager"
        fetchpriority="high"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />

      {showManual && (
        <ManualUrlModal
          onClose={() => setShowManual(false)}
          value={manualUrl}
          onChange={setManualUrl}
          onSave={handleSaveManual}
          saving={saving}
        />
      )}
    </div>
  );
}

function ManualUrlModal({ onClose, value, onChange, onSave, saving }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-foreground font-bold text-lg">Add Custom Source</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
          Paste a direct video URL (.mp4, .m3u8, .webm) or an embed URL to save it permanently.
        </p>
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSave()}
          placeholder="https://example.com/video.mp4"
          className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 mb-4"
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors text-sm">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!value.trim() || saving}
            className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
            Save & Play
          </button>
        </div>
      </div>
    </div>
  );
}
