import { useState } from 'react';
import { Plus } from 'lucide-react';

const emptyForm = {
  title: '', sport: '', category: 'team', discipline: '', competition: '', event_type: '', country: 'Australia', venue: '', start_time: '', status: 'upcoming', stream_url: '', official_source_url: '', source_name: '', notes: ''
};

export default function SportsEventForm({ onCreate }) {
  const [form, setForm] = useState(emptyForm);
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.sport.trim()) return;
    await onCreate({ ...form, tags: [form.sport, form.competition, form.discipline].filter(Boolean) });
    setForm(emptyForm);
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-primary/20 bg-card/80 p-5 card-glow">
      <div className="mb-4">
        <h2 className="text-2xl font-black text-foreground">Add a sports event</h2>
        <p className="text-sm text-muted-foreground">Add official/free stream links, score pages, replays or archive links.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Event title" className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        <input value={form.sport} onChange={e => update('sport', e.target.value)} placeholder="Sport" className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        <select value={form.category} onChange={e => update('category', e.target.value)} className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground">
          <option value="team">Team</option><option value="racket_ball">Racket & Ball</option><option value="motorsport">Motorsport</option><option value="combat">Combat</option><option value="extreme">Extreme</option><option value="endurance">Endurance</option><option value="other">Other</option>
        </select>
        <input value={form.competition} onChange={e => update('competition', e.target.value)} placeholder="Competition / league" className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        <input value={form.discipline} onChange={e => update('discipline', e.target.value)} placeholder="Discipline / weight class" className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        <select value={form.status} onChange={e => update('status', e.target.value)} className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground">
          <option value="upcoming">Upcoming</option><option value="live">Live</option><option value="result">Result</option><option value="archived">Archived</option>
        </select>
        <input type="datetime-local" value={form.start_time} onChange={e => update('start_time', e.target.value)} className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground" />
        <input value={form.source_name} onChange={e => update('source_name', e.target.value)} placeholder="Source name" className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        <input value={form.official_source_url} onChange={e => update('official_source_url', e.target.value)} placeholder="Official page URL" className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        <input value={form.stream_url} onChange={e => update('stream_url', e.target.value)} placeholder="Official stream/replay URL" className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground md:col-span-2" />
        <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" /> Add Event</button>
      </div>
    </form>
  );
}