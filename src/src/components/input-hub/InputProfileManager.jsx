import { Save, Share2, SlidersHorizontal } from 'lucide-react';

const modes = ['fps', 'driving', 'rpg', 'accessibility', 'streaming', 'training', 'custom'];
const deviceTypes = ['controller', 'keyboard_mouse', 'touch', 'wheel', 'hotas', 'fight_stick', 'adaptive', 'motion'];

export default function InputProfileManager({ profile, setProfile, games, profiles, saveProfile, loadProfile }) {
  const update = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));

  return (
    <section className="rounded-3xl border border-border bg-card p-5" aria-labelledby="profile-title">
      <div className="mb-4 flex items-center gap-3">
        <SlidersHorizontal className="h-6 w-6 text-primary" aria-hidden="true" />
        <div>
          <h2 id="profile-title" className="text-xl font-black text-foreground">Game-Specific Profiles & Cloud Sync</h2>
          <p className="text-sm text-muted-foreground">Saved profiles sync through your account and can auto-match selected games.</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <label className="text-sm font-bold text-foreground">Profile name
          <input value={profile.name} onChange={(e) => update('name', e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground" />
        </label>
        <label className="text-sm font-bold text-foreground">Device
          <select value={profile.device_type} onChange={(e) => update('device_type', e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground">
            {deviceTypes.map(type => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold text-foreground">Mode
          <select value={profile.mode} onChange={(e) => update('mode', e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground">
            {modes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold text-foreground">Game
          <select value={profile.game_id} onChange={(e) => {
            const game = games.find(item => item.id === e.target.value);
            setProfile(prev => ({ ...prev, game_id: game?.id || '', game_title: game?.title || '' }));
          }} className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground">
            <option value="">Universal</option>
            {games.map(game => <option key={game.id} value={game.id}>{game.title}</option>)}
          </select>
        </label>
        <button onClick={saveProfile} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground"><Save className="h-4 w-4" /> Save profile</button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {profiles.map(item => (
          <button key={item.id} onClick={() => loadProfile(item)} className="rounded-2xl border border-border bg-secondary/50 p-4 text-left hover:border-primary/40">
            <p className="font-black text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.game_title || 'Universal'} · {item.device_type?.replace('_', ' ')} · {item.mode}</p>
            {item.is_shared && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary"><Share2 className="h-3 w-3" /> Marketplace shared</span>}
          </button>
        ))}
      </div>
    </section>
  );
}