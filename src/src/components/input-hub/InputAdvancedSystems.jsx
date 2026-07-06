import { Accessibility, BarChart3, Eye, Gamepad2, Keyboard, MousePointer2, Radio, Smartphone, Vibrate } from 'lucide-react';

const systems = [
  { title: 'Keyboard & Mouse Hub', icon: Keyboard, text: 'Custom binds, layers, media controls, DPI profiles, sensitivity curves, acceleration presets and recoil-control notes.' },
  { title: 'Touch Control System', icon: Smartphone, text: 'Virtual sticks, swipe gestures, trigger zones, opacity controls, mobile layouts and gyro aiming toggles.' },
  { title: 'Motion & Gyro', icon: Gamepad2, text: 'Gyro aiming, motion steering, flick stick settings and gyro macro slots stored per profile.' },
  { title: 'Haptics System', icon: Vibrate, text: 'Vibration strength, trigger resistance intent, heartbeat effects and environment feedback presets.' },
  { title: 'RGB & Hardware Sync', icon: Radio, text: 'RGB intent profiles for health, music, kills and alerts. Vendor apps are required for real device lighting control.' },
  { title: 'Accessibility Controls', icon: Accessibility, text: 'One-handed mode, adaptive controller notes, switch controls, voice/text-to-input intents and large button mode.' },
  { title: 'Streamer Controls', icon: MousePointer2, text: 'Hotkeys, clip markers, scene-switch commands and soundboard button mappings.' },
  { title: 'Input Analytics', icon: BarChart3, text: 'APM, click tracking, last key, live controller axes and profile performance summaries.' },
  { title: 'Eye / Switch Support', icon: Eye, text: 'Profile slots for eye tracking and switch controls; actual device integration depends on browser and hardware software.' }
];

export default function InputAdvancedSystems({ profile, setProfile, liveInput }) {
  const updateNested = (field, key, value) => setProfile(prev => ({ ...prev, [field]: { ...(prev[field] || {}), [key]: value } }));

  return (
    <section className="rounded-3xl border border-border bg-card p-5" aria-labelledby="advanced-title">
      <h2 id="advanced-title" className="text-xl font-black text-foreground">Advanced Input Ecosystem</h2>
      <p className="mt-1 text-sm text-muted-foreground">Everything is saved into the active profile, with browser-safe controls and hardware intent settings.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {systems.map(system => {
          const Icon = system.icon;
          return (
            <article key={system.title} className="rounded-2xl border border-border bg-secondary/50 p-4">
              <Icon className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="font-black text-foreground">{system.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{system.text}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <label className="text-sm font-bold text-foreground">Mouse DPI
          <input type="number" value={profile.sensitivity?.dpi || 1600} onChange={(e) => updateNested('sensitivity', 'dpi', Number(e.target.value))} className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground" />
        </label>
        <label className="text-sm font-bold text-foreground">Stick deadzone
          <input type="number" step="0.01" value={profile.sensitivity?.deadzone || 0.12} onChange={(e) => updateNested('sensitivity', 'deadzone', Number(e.target.value))} className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground" />
        </label>
        <label className="text-sm font-bold text-foreground">Vibration %
          <input type="number" min="0" max="100" value={profile.haptics?.vibration || 65} onChange={(e) => updateNested('haptics', 'vibration', Number(e.target.value))} className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground" />
        </label>
        <label className="text-sm font-bold text-foreground">Touch opacity %
          <input type="number" min="10" max="100" value={profile.touch_layout?.opacity || 70} onChange={(e) => updateNested('touch_layout', 'opacity', Number(e.target.value))} className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground" />
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Live overlay preview</p>
        <p className="mt-1 text-sm text-muted-foreground">Key: {liveInput.key || 'none'} · Clicks: {liveInput.clicks} · APM sample: {liveInput.apm} · Controller: {liveInput.gamepad?.id || 'not connected'}</p>
      </div>
    </section>
  );
}