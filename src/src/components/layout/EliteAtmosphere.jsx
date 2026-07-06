import LiveWallpaperEngine from '@/components/live-wallpaper/LiveWallpaperEngine';

export default function EliteAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <LiveWallpaperEngine />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(245,184,61,0.20),transparent_28%),radial-gradient(circle_at_78%_16%,rgba(178,54,255,0.17),transparent_30%),radial-gradient(circle_at_50%_92%,rgba(220,38,38,0.12),transparent_34%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.07)_0%,transparent_16%,transparent_72%,rgba(245,184,61,0.12)_100%)]" />
      <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/70 to-transparent shadow-[0_0_60px_rgba(245,184,61,.45)]" />
      <div className="absolute -left-28 top-24 h-96 w-96 rounded-full bg-primary/14 blur-3xl animate-elite-float" />
      <div className="absolute -right-24 bottom-20 h-[28rem] w-[28rem] rounded-full bg-accent/14 blur-3xl animate-elite-float-delayed" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.9)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,.72)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
    </div>
  );
}
