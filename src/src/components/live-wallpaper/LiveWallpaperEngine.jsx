import { useEffect, useMemo, useState } from 'react';
import { readEliteSettings } from '@/lib/elite-settings';
import { WALLPAPER_PRESETS } from '@/components/live-wallpaper/wallpaper-presets';

function ParticleLayer({ type, intensity }) {
  const count = intensity === 'extreme' ? 42 : intensity === 'medium' ? 28 : intensity === 'low' ? 16 : 0;
  if (!count) return null;

  return (
    <div className="absolute inset-0 overflow-hidden opacity-70">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className={`absolute rounded-full ${type === 'rain' ? 'h-12 w-px bg-sky-200/25' : type === 'neon' ? 'h-1.5 w-1.5 bg-primary shadow-[0_0_14px_hsl(var(--primary))]' : type === 'mist' ? 'h-16 w-16 bg-white/5 blur-xl' : 'h-1 w-1 bg-white/70'}`}
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 19) % 100}%`,
            animation: `wallpaper-drift ${7 + (index % 9)}s linear infinite`,
            animationDelay: `${index * -0.3}s`
          }}
        />
      ))}
    </div>
  );
}

export default function LiveWallpaperEngine({ heroItem }) {
  const [settings, setSettings] = useState(readEliteSettings);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const onSettings = (event) => setSettings(event.detail || readEliteSettings());
    const onMouseMove = (event) => setMouse({ x: (event.clientX / window.innerWidth - 0.5) * 2, y: (event.clientY / window.innerHeight - 0.5) * 2 });
    const onPreview = (event) => setPreview(event.detail ? { ...event.detail, startedAt: Date.now() } : null);
    const onPreviewClear = () => setPreview(null);
    window.addEventListener('elite-settings-updated', onSettings);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('elite-wallpaper-preview', onPreview);
    window.addEventListener('elite-wallpaper-preview-clear', onPreviewClear);
    return () => {
      window.removeEventListener('elite-settings-updated', onSettings);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('elite-wallpaper-preview', onPreview);
      window.removeEventListener('elite-wallpaper-preview-clear', onPreviewClear);
    };
  }, []);

  useEffect(() => {
    if (!preview) return;
    const timer = setTimeout(() => setPreview(null), 5000);
    return () => clearTimeout(timer);
  }, [preview?.startedAt]);

  const wallpaper = WALLPAPER_PRESETS[settings.wallpaperPreset || 'rain_city'] || WALLPAPER_PRESETS.rain_city;
  const usePreviewVideo = Boolean(preview?.videoUrl);
  const useHeroBackdrop = settings.smartWallpaperMode && heroItem?.backdrop_url && !usePreviewVideo;
  const enabled = settings.liveWallpaper !== false;
  const intensity = settings.wallpaperMotion || 'medium';
  const transform = enabled ? `translate3d(${mouse.x * 10}px, ${mouse.y * 10}px, 0) scale(1.04)` : 'none';

  const qualityClass = useMemo(() => {
    if (settings.wallpaperQuality === 'low' || settings.wallpaperPerformance === 'battery') return 'opacity-25 blur-sm';
    if (settings.wallpaperQuality === 'ultra') return 'opacity-55';
    return 'opacity-40';
  }, [settings.wallpaperQuality, settings.wallpaperPerformance]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {enabled && usePreviewVideo ? (
        <video key={preview.videoUrl} className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${qualityClass}`} src={preview.videoUrl} autoPlay muted loop playsInline style={{ transform }} />
      ) : enabled && useHeroBackdrop ? (
        <img src={heroItem.backdrop_url} alt="" className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${qualityClass}`} style={{ transform }} />
      ) : enabled ? (
        <video className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${qualityClass}`} src={wallpaper.video} autoPlay muted loop playsInline style={{ transform }} />
      ) : null}
      <div className={`absolute inset-0 bg-gradient-to-br ${wallpaper.gradient}`} />
      {settings.wallpaperEffects?.particles !== false && <ParticleLayer type={wallpaper.particles} intensity={intensity} />}
      {settings.wallpaperEffects?.depth !== false && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(120deg,transparent,rgba(255,255,255,0.045),transparent)]" />}
      {settings.wallpaperEffects?.glow !== false && <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-primary/15 blur-3xl motion-safe:animate-elite-float" />}
      {settings.wallpaperEffects?.blur !== false && <div className="absolute inset-0 backdrop-blur-[1px]" />}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-background/45 to-background/85" />
    </div>
  );
}
