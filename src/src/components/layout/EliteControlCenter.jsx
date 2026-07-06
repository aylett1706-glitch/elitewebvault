import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, Settings2, ShieldAlert, Upload, User, X, Zap } from 'lucide-react';
import EliteSettingsPanel from '@/components/settings/EliteSettingsPanel';
import { loadGlobalEliteSettings, readEliteSettings } from '@/lib/elite-settings';

export default function EliteControlCenter() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(readEliteSettings);
  const [command, setCommand] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadGlobalEliteSettings().then(({ settings: loaded }) => setSettings(loaded));
    const onEliteSettings = (event) => setSettings(event.detail || readEliteSettings());
    window.addEventListener('elite-settings-updated', onEliteSettings);
    return () => window.removeEventListener('elite-settings-updated', onEliteSettings);
  }, []);

  const quickLinks = useMemo(() => [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Vault', path: '/vault', icon: ShieldAlert },
    { label: 'Upload', path: '/upload', icon: Upload },
    { label: 'Profile', path: '/profile', icon: User }
  ], []);

  const filteredLinks = quickLinks.filter(link => link.label.toLowerCase().includes(command.toLowerCase()));

  return (
    <>
      {settings.quickDock && (
        <div className="fixed bottom-5 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-1 rounded-3xl border border-primary/30 bg-background/70 p-2 shadow-2xl shadow-primary/20 backdrop-blur-2xl md:flex elite-ring">
          {quickLinks.map(link => (
            <Link key={link.path} to={link.path} className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary" aria-label={link.label}>
              <link.icon className="h-4 w-4" />
              <span className="hidden lg:inline">{link.label}</span>
            </Link>
          ))}
        </div>
      )}

      <button type="button" onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-3xl border border-primary/40 bg-primary text-primary-foreground shadow-2xl shadow-primary/40 hover:bg-primary/90 hover:scale-105 elite-ring" aria-label="Open Elite Control Center">
        <Settings2 className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/50 p-3 backdrop-blur-sm md:p-6" role="dialog" aria-modal="true">
          <div className="max-h-[92vh] w-full max-w-md overflow-auto rounded-3xl border border-primary/30 bg-card/90 p-5 shadow-2xl shadow-primary/20 backdrop-blur-2xl elite-panel">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-foreground">Elite Control Center</h2>
                <p className="text-sm text-muted-foreground">Instant navigation and app customization.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl bg-secondary p-2 text-muted-foreground hover:text-foreground" aria-label="Close settings"><X className="h-5 w-5" /></button>
            </div>

            <div className="mb-4 rounded-2xl border border-border bg-secondary/40 p-3">
              <label htmlFor="elite-command" className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground"><Zap className="h-3.5 w-3.5" /> Quick Jump</label>
              <input id="elite-command" value={command} onChange={(e) => setCommand(e.target.value)} placeholder="Type Home, Search, Vault…" className="mb-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
              <div className="grid grid-cols-2 gap-2">
                {filteredLinks.map(link => (
                  <button key={link.path} type="button" onClick={() => { navigate(link.path); setOpen(false); }} className="flex items-center gap-2 rounded-xl bg-background px-3 py-2 text-sm font-bold text-foreground hover:bg-primary/10 hover:text-primary">
                    <link.icon className="h-4 w-4" /> {link.label}
                  </button>
                ))}
              </div>
            </div>

            <EliteSettingsPanel compact />
          </div>
        </div>
      )}
    </>
  );
}