import { Check, Play } from 'lucide-react';
import { WALLPAPER_PRESETS } from '@/components/live-wallpaper/wallpaper-presets';

const OPTIONS = {
  wallpaperQuality: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['ultra', 'Ultra']],
  wallpaperMotion: [['off', 'Off'], ['low', 'Low'], ['medium', 'Medium'], ['extreme', 'Extreme']],
  wallpaperPerformance: [['battery', 'Battery Saver'], ['balanced', 'Balanced'], ['ultra', 'Ultra']]
};

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-foreground">
        {options.map(([key, labelText]) => <option key={key} value={key}>{labelText}</option>)}
      </select>
    </label>
  );
}

function ToggleButton({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-2xl border px-4 py-3 text-left text-sm font-black ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/50 text-foreground hover:border-primary/40'}`}>
      {label}
    </button>
  );
}

function WallpaperPreviewCard({ id, wallpaper, active, onSelect }) {
  return (
    <button type="button" onClick={() => onSelect(id)} className={`group overflow-hidden rounded-2xl border text-left transition-all hover:scale-[1.02] ${active ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border bg-card hover:border-primary/40'}`}>
      <div className="relative aspect-video overflow-hidden bg-background">
        <video src={wallpaper.video} muted loop playsInline autoPlay className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className={`absolute inset-0 bg-gradient-to-br ${wallpaper.gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-black/50 p-2 text-white backdrop-blur">
          <Play className="h-3.5 w-3.5 fill-white" />
        </div>
        {active && <div className="absolute right-3 top-3 rounded-full bg-primary p-2 text-primary-foreground"><Check className="h-3.5 w-3.5" /></div>}
      </div>
      <div className="p-3">
        <h4 className="text-sm font-black text-foreground">{wallpaper.name}</h4>
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary">{wallpaper.type}</p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{wallpaper.description}</p>
      </div>
    </button>
  );
}

export default function LiveWallpaperSettings({ settings, onChange }) {
  const effects = settings.wallpaperEffects || {};
  const updateEffect = (key) => onChange('wallpaperEffects', { ...effects, [key]: effects[key] === false });

  return (
    <section className="rounded-3xl border border-primary/20 bg-secondary/30 p-4">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Live Wallpaper Engine</p>
        <h3 className="text-lg font-black text-foreground">Dynamic Background Controls</h3>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(WALLPAPER_PRESETS).map(([id, wallpaper]) => (
          <WallpaperPreviewCard key={id} id={id} wallpaper={wallpaper} active={(settings.wallpaperPreset || 'rain_city') === id} onSelect={value => onChange('wallpaperPreset', value)} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField label="Quality" value={settings.wallpaperQuality || 'high'} options={OPTIONS.wallpaperQuality} onChange={value => onChange('wallpaperQuality', value)} />
        <SelectField label="Motion Intensity" value={settings.wallpaperMotion || 'medium'} options={OPTIONS.wallpaperMotion} onChange={value => onChange('wallpaperMotion', value)} />
        <SelectField label="Performance" value={settings.wallpaperPerformance || 'balanced'} options={OPTIONS.wallpaperPerformance} onChange={value => onChange('wallpaperPerformance', value)} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <ToggleButton label="Live Wallpaper" active={settings.liveWallpaper !== false} onClick={() => onChange('liveWallpaper', settings.liveWallpaper === false)} />
        <ToggleButton label="Smart Hero Sync" active={!!settings.smartWallpaperMode} onClick={() => onChange('smartWallpaperMode', !settings.smartWallpaperMode)} />
        <ToggleButton label="Audio Reactive" active={!!settings.audioReactiveWallpaper} onClick={() => onChange('audioReactiveWallpaper', !settings.audioReactiveWallpaper)} />
        <ToggleButton label="Controller Motion" active={!!settings.controllerWallpaperMotion} onClick={() => onChange('controllerWallpaperMotion', !settings.controllerWallpaperMotion)} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {['particles', 'glow', 'blur', 'depth', 'weather'].map(effect => (
          <ToggleButton key={effect} label={effect[0].toUpperCase() + effect.slice(1)} active={effects[effect] !== false} onClick={() => updateEffect(effect)} />
        ))}
      </div>
    </section>
  );
}