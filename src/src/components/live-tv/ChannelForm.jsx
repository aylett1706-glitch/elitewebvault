import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const initialForm = {
  name: '',
  description: '',
  category: 'General',
  country: '',
  logo_url: '',
  stream_url: '',
  embed_url: '',
  source_type: 'stream',
  is_featured: false,
  status: 'approved'
};

export default function ChannelForm({ onAdded }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const saveChannel = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const created = await base44.entities.LiveChannel.create(form);
    setForm(initialForm);
    setSaving(false);
    toast.success('Live channel added');
    onAdded(created);
  };

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={saveChannel} className="rounded-3xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Plus className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-foreground">Add In-App Live Channel</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Channel name" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" />
        <select value={form.source_type} onChange={(e) => setField('source_type', e.target.value)} className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground">
          <option value="stream">Direct stream URL</option>
          <option value="embed">Paid/provider embed URL</option>
          <option value="m3u">M3U channel</option>
        </select>
        <input value={form.stream_url} onChange={(e) => setField('stream_url', e.target.value)} placeholder="Direct stream URL (.m3u8, .mp4, etc.)" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" />
        <input value={form.embed_url} onChange={(e) => setField('embed_url', e.target.value)} placeholder="Official embed/player URL for in-app paid TV" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" />
        <input value={form.logo_url} onChange={(e) => setField('logo_url', e.target.value)} placeholder="Logo URL" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" />
        <input value={form.category} onChange={(e) => setField('category', e.target.value)} placeholder="Category" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" />
        <input value={form.country} onChange={(e) => setField('country', e.target.value)} placeholder="Country / region" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" />
        <label className="flex min-h-12 items-center gap-2 rounded-xl border border-border bg-secondary px-4 text-sm text-muted-foreground">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setField('is_featured', e.target.checked)} /> Featured
        </label>
      </div>
      <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Description — paid TV requires your provider’s legal stream or embeddable player link" className="mt-3 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" rows={2} />
      <button disabled={saving || !form.name.trim()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        <Plus className="h-4 w-4" /> {saving ? 'Adding...' : 'Add Channel'}
      </button>
    </form>
  );
}