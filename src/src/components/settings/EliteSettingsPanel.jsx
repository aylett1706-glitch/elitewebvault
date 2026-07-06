import { useEffect, useState } from 'react';
import { Check, Crown, Palette, RotateCcw, Save, Shield, Sparkles } from 'lucide-react';
import LiveWallpaperSettings from '@/components/live-wallpaper/LiveWallpaperSettings';
import AdvancedCustomizationSettings from '@/components/settings/AdvancedCustomizationSettings';
import CreatorStudioSettings from '@/components/settings/CreatorStudioSettings';
import WallpaperMarketplacePreview from '@/components/live-wallpaper/WallpaperMarketplacePreview';
import { toast } from 'sonner';
import { DEFAULT_ELITE_SETTINGS, ELITE_PRESETS, loadGlobalEliteSettings, readEliteSettings, saveEliteSettingsLocal, saveGlobalEliteSettings } from '@/lib/elite-settings';

function ToggleRow({ label, description, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/60 p-3 text-left hover:border-primary/40">
      <span>
        <span className="block text-sm font-bold text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <span className={`relative h-6 w-11 rounded-full border transition-colors ${active ? 'border-primary bg-primary' : 'border-border bg-background'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${active ? 'translate-x-5' : 'translate-x-1'}`} />
      </span>
    </button>
  );
}

export default function EliteSettingsPanel({ allowGlobalSave = false, compact = false }) {
  const [settings, setSettings] = useState(readEliteSettings);
  const [record, setRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGlobalEliteSettings().then(({ settings: loaded, record: loadedRecord }) => {
      setSettings(loaded);
      setRecord(loadedRecord);
    });
  }, []);

  const updateSetting = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveEliteSettingsLocal(next);
  };

  const saveGlobal = async () => {
    setSaving(true);
    const saved = await saveGlobalEliteSettings(settings, record);
    setRecord(saved);
    setSaving(false);
    toast.success('Elite settings saved globally');
  };

  const reset = () => {
    setSettings(DEFAULT_ELITE_SETTINGS);
    saveEliteSettingsLocal(DEFAULT_ELITE_SETTINGS);
  };

  return (
    <section className={`rounded-3xl border border-primary/20 bg-card ${compact ? 'p-4' : 'p-5'} shadow-2xl shadow-black/20`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Crown className="h-3.5 w-3.5" /> Elite Customization
          </div>
          <h2 className="text-2xl font-black text-foreground">Global Experience Settings</h2>
          <p className="text-sm text-muted-foreground">Control branding, AI personalization, content discovery, layout, mobile polish, player feel, and vault defaults.</p>
        </div>
        <Sparkles className="h-6 w-6 text-primary" />
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="elite-global-app-name" className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">App Name</label>
          <input id="elite-global-app-name" value={settings.appName} onChange={(e) => updateSetting('appName', e.target.value)} className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-foreground focus:border-primary/60" />
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground"><Palette className="h-3.5 w-3.5" /> Theme Preset</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(ELITE_PRESETS).map(([key, preset]) => (
              <button key={key} type="button" onClick={() => updateSetting('preset', key)} className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3 text-left ${settings.preset === key ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/50 text-foreground hover:border-primary/40'}`}>
                <span className="text-sm font-bold">{preset.label}</span>
                {settings.preset === key && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="elite-home-layout" className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Home Layout</label>
            <select id="elite-home-layout" value={settings.homeLayout} onChange={(e) => updateSetting('homeLayout', e.target.value)} className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-foreground">
              <option value="cinematic">Cinematic</option>
              <option value="compact">Compact</option>
              <option value="library">Library First</option>
            </select>
          </div>
          <div>
            <label htmlFor="elite-vault-mode" className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground"><Shield className="h-3.5 w-3.5" /> Vault Mode</label>
            <select id="elite-vault-mode" value={settings.vaultMode} onChange={(e) => updateSetting('vaultMode', e.target.value)} className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-foreground">
              <option value="private">Private</option>
              <option value="performance">Performance</option>
              <option value="showcase">Showcase</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <ToggleRow label="Compact Mode" description="Tighter spacing for power browsing." active={settings.compact} onClick={() => updateSetting('compact', !settings.compact)} />
          <ToggleRow label="Cinematic Glow" description="Premium shadows and atmosphere." active={settings.cinematicGlow} onClick={() => updateSetting('cinematicGlow', !settings.cinematicGlow)} />
          <ToggleRow label="Reduced Motion" description="Calmer transitions across the app." active={settings.reducedMotion} onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)} />
          <ToggleRow label="Quick Dock" description="Instant navigation dock on desktop." active={settings.quickDock} onClick={() => updateSetting('quickDock', !settings.quickDock)} />
        </div>

        <CreatorStudioSettings settings={settings} onChange={updateSetting} />
        <AdvancedCustomizationSettings settings={settings} onChange={updateSetting} />
        <LiveWallpaperSettings settings={settings} onChange={updateSetting} />
        {!compact && <WallpaperMarketplacePreview />}

        <div className="flex flex-col gap-2 sm:flex-row">
          {allowGlobalSave && (
            <button type="button" onClick={saveGlobal} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Globally'}
            </button>
          )}
          <button type="button" onClick={reset} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-bold text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>
    </section>
  );
}
