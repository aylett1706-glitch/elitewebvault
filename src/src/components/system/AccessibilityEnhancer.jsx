import { useEffect, useState } from 'react';
import { Eye, Keyboard, MousePointer2 } from 'lucide-react';
import { readEliteSettings, saveEliteSettingsLocal } from '@/lib/elite-settings';

export default function AccessibilityEnhancer() {
  const [settings, setSettings] = useState(readEliteSettings);

  useEffect(() => {
    const handler = (event) => setSettings(event.detail || readEliteSettings());
    window.addEventListener('elite-settings-updated', handler);
    return () => window.removeEventListener('elite-settings-updated', handler);
  }, []);

  const setLevel = (level) => {
    const next = { ...settings, accessibilityLevel: level, reducedMotion: level === 'maximum' ? true : settings.reducedMotion };
    setSettings(next);
    saveEliteSettingsLocal(next);
  };

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-primary-foreground">Skip to main content</a>
      <div className="fixed left-4 top-20 z-50 hidden rounded-2xl border border-border bg-card/90 p-1 shadow-xl backdrop-blur md:flex" aria-label="Accessibility quick controls">
        {[
          ['standard', MousePointer2, 'Standard accessibility'],
          ['enhanced', Keyboard, 'Enhanced accessibility'],
          ['maximum', Eye, 'Maximum accessibility']
        ].map(([level, Icon, label]) => (
          <button key={level} type="button" onClick={() => setLevel(level)} aria-label={label} aria-pressed={settings.accessibilityLevel === level} className={`rounded-xl p-2 ${settings.accessibilityLevel === level ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        ))}
      </div>
    </>
  );
}
