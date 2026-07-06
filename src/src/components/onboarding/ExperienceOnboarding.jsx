import { useEffect, useState } from 'react';
import { Film, Gamepad2, Heart, Sparkles, X } from 'lucide-react';
import { readEliteSettings, saveEliteSettingsLocal } from '@/lib/elite-settings';

const STORAGE_KEY = 'ev_onboarding_complete_v1';
const GENRES = ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Sci-Fi', 'Family', 'Anime'];
const HUBS = ['Movies', 'TV Shows', 'Games', 'Anime', 'Manga', 'Books', 'Live TV', 'Actors'];

export default function ExperienceOnboarding() {
  const [open, setOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [hubs, setHubs] = useState(['Movies', 'TV Shows', 'Games']);
  const [mode, setMode] = useState('all_in');

  useEffect(() => {
    setOpen(localStorage.getItem(STORAGE_KEY) !== 'true');
  }, []);

  const toggle = (value, list, setter) => setter(list.includes(value) ? list.filter(item => item !== value) : [...list, value]);

  const finish = () => {
    const settings = readEliteSettings();
    saveEliteSettingsLocal({
      ...settings,
      preferredHubs: hubs,
      preferredMood: genres[0]?.toLowerCase().replaceAll(' ', '_') || settings.preferredMood,
      marketMode: mode,
      personalizationMode: 'deep',
      aiDiscovery: true
    });
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-3 backdrop-blur-xl md:items-center" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="w-full max-w-3xl rounded-3xl border border-primary/30 bg-card p-5 shadow-2xl shadow-primary/20 elite-panel">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary"><Sparkles className="h-4 w-4" /> Personalize EliteVault</p>
            <h2 id="onboarding-title" className="mt-2 text-3xl font-black text-foreground">Build your perfect entertainment hub</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose what you love and the app will tune recommendations, hubs, and the creator studio around you.</p>
          </div>
          <button type="button" onClick={finish} className="rounded-2xl bg-secondary p-2 text-muted-foreground hover:text-foreground" aria-label="Skip onboarding"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-3xl border border-border bg-secondary/40 p-4">
            <Film className="mb-3 h-5 w-5 text-primary" />
            <h3 className="mb-3 text-sm font-black text-foreground">Favourite genres</h3>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(genre => <button key={genre} type="button" onClick={() => toggle(genre, genres, setGenres)} className={`rounded-full border px-3 py-2 text-xs font-black ${genres.includes(genre) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'}`}>{genre}</button>)}
            </div>
          </section>
          <section className="rounded-3xl border border-border bg-secondary/40 p-4">
            <Gamepad2 className="mb-3 h-5 w-5 text-primary" />
            <h3 className="mb-3 text-sm font-black text-foreground">Preferred hubs</h3>
            <div className="flex flex-wrap gap-2">
              {HUBS.map(hub => <button key={hub} type="button" onClick={() => toggle(hub, hubs, setHubs)} className={`rounded-full border px-3 py-2 text-xs font-black ${hubs.includes(hub) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'}`}>{hub}</button>)}
            </div>
          </section>
          <section className="rounded-3xl border border-border bg-secondary/40 p-4">
            <Heart className="mb-3 h-5 w-5 text-primary" />
            <h3 className="mb-3 text-sm font-black text-foreground">Experience mode</h3>
            <div className="space-y-2">
              {['streaming', 'gaming', 'all_in'].map(item => <button key={item} type="button" onClick={() => setMode(item)} className={`w-full rounded-2xl border px-3 py-2 text-left text-xs font-black capitalize ${mode === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'}`}>{item.replace('_', ' ')}</button>)}
            </div>
          </section>
        </div>

        <button type="button" onClick={finish} className="mt-5 w-full rounded-2xl bg-primary py-3 text-sm font-black text-primary-foreground hover:bg-primary/90">Launch My Experience</button>
      </div>
    </div>
  );
}
