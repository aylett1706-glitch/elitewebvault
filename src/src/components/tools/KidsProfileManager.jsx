import { useEffect, useState } from 'react';
import { Baby, Plus, ShieldCheck } from 'lucide-react';
import { supabaseApi, base44 } from '@/api/supabaseApi';
import { toast } from 'sonner';

export default function KidsProfileManager() {
  const [profiles, setProfiles] = useState([]);
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState('All Ages');

  useEffect(() => { base44.entities.KidsProfile.list('-created_date', 20).then(setProfiles); }, []);

  const createProfile = async () => {
    if (!name.trim()) return;
    const user = await base44.auth.me().catch(() => null);
    const created = await base44.entities.KidsProfile.create({ name, age_group: ageGroup, guardian_email: user?.email || '', allowed_genres: ['Family', 'Animation'], blocked_keywords: ['adult', 'horror'], is_active: true });
    setProfiles(prev => [created, ...prev]);
    setName('');
    toast.success('Kids profile created');
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5 elite-panel">
      <div className="mb-4 flex items-center gap-3"><Baby className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-black">Smart Kids Profiles</h2><p className="text-sm text-muted-foreground">Age-aware safe profiles with daily limits.</p></div></div>
      <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]"><input value={name} onChange={e => setName(e.target.value)} placeholder="Child profile name" className="rounded-2xl border border-border bg-secondary px-3 py-3 text-sm text-foreground" /><select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} className="rounded-2xl border border-border bg-secondary px-3 py-3 text-sm text-foreground">{['All Ages','3+','7+','10+','13+'].map(v => <option key={v}>{v}</option>)}</select><button onClick={createProfile} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground"><Plus className="h-4 w-4" /> Add</button></div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">{profiles.map(profile => <div key={profile.id} className="rounded-2xl border border-border bg-secondary/40 p-4"><ShieldCheck className="mb-2 h-5 w-5 text-emerald-400" /><p className="font-black">{profile.name}</p><p className="text-xs text-muted-foreground">{profile.age_group} · {profile.daily_limit_minutes || 60} min/day</p></div>)}</div>
    </section>
  );
}