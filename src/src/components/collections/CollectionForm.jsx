import { useState } from 'react';
import { FolderPlus, Loader2 } from 'lucide-react';

const splitKeywords = (value) => value.split(',').map(item => item.trim()).filter(Boolean);

export default function CollectionForm({ onCreate, saving }) {
  const [form, setForm] = useState({ name: '', description: '', collection_type: 'mixed', media_keywords: '', game_keywords: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    onCreate({
      name: form.name.trim(),
      description: form.description.trim(),
      collection_type: form.collection_type,
      media_keywords: splitKeywords(form.media_keywords),
      game_keywords: splitKeywords(form.game_keywords),
      selected_media_ids: [],
      selected_game_ids: []
    });
    setForm({ name: '', description: '', collection_type: 'mixed', media_keywords: '', game_keywords: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-primary/20 bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <FolderPlus className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-black text-foreground">Create custom folder</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Marvel, Action Games, Must-Watch…" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60" />
        <select value={form.collection_type} onChange={e => setForm(prev => ({ ...prev, collection_type: e.target.value }))} className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-foreground focus:border-primary/60">
          <option value="mixed">Manual + automatic</option>
          <option value="auto">Automatic only</option>
          <option value="manual">Manual only</option>
        </select>
        <input value={form.media_keywords} onChange={e => setForm(prev => ({ ...prev, media_keywords: e.target.value }))} placeholder="Media keywords: Marvel, Avengers, MCU" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60" />
        <input value={form.game_keywords} onChange={e => setForm(prev => ({ ...prev, game_keywords: e.target.value }))} placeholder="Game keywords: action, racing, arcade" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60" />
      </div>
      <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Optional folder description" className="mt-3 min-h-20 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60" />
      <button type="submit" disabled={saving || !form.name.trim()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
        Create Folder
      </button>
    </form>
  );
}
