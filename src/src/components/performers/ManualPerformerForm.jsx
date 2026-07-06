import { useState } from 'react';
import { supabaseApi, base44 } from '@/api/supabaseApi';
import { Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import ImageSourceField from '@/components/media/ImageSourceField';

const emptyForm = {
  name: '', stage_name: '', bio: '', photo_url: '', cover_url: '', birth_date: '', height: '',
  measurements: '', nationality: '', hair_color: '', eye_color: '', gender: 'Female', tags: ''
};

export default function ManualPerformerForm({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const savePerformer = async () => {
    if (!form.name.trim() && !form.stage_name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    const performer = await base44.entities.Performer.create({
      ...form,
      name: form.name || form.stage_name,
      tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      total_scenes: 0
    });
    toast.success('Performer added');
    setForm(emptyForm);
    setOpen(false);
    onCreated?.(performer);
    setSaving(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20">
        <Plus className="h-4 w-4" /> Add Performer Manually
      </button>
    );
  }

  return (
    <div className="rounded-3xl border border-red-900/30 bg-card p-5 shadow-2xl space-y-4">
      <h2 className="text-xl font-bold text-foreground">Manual Performer Details</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['Stage Name', 'stage_name'], ['Legal/Public Name', 'name'], ['Birth Date', 'birth_date', 'date'],
          ['Height', 'height'], ['Measurements', 'measurements'], ['Nationality', 'nationality'],
          ['Hair Color', 'hair_color'], ['Eye Color', 'eye_color'], ['Tags (comma separated)', 'tags']
        ].map(([label, field, type = 'text']) => (
          <div key={field}>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
            <input type={type} value={form[field] || ''} onChange={(e) => setField(field, e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-red-500/60 focus:outline-none" />
          </div>
        ))}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Gender</label>
          <select value={form.gender} onChange={(e) => setField('gender', e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-red-500/60 focus:outline-none">
            {['Female', 'Male', 'Trans', 'Non-binary', 'Other'].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
      </div>
      <textarea value={form.bio} onChange={(e) => setField('bio', e.target.value)} rows={4} placeholder="Bio and relevant info..." className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-red-500/60 focus:outline-none" />
      <ImageSourceField label="Profile Picture" value={form.photo_url} onChange={(url) => setField('photo_url', url)} aspect="aspect-[3/4]" />
      <ImageSourceField label="Cover Picture" value={form.cover_url} onChange={(url) => setField('cover_url', url)} />
      <div className="flex gap-3">
        <button onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-muted-foreground hover:text-foreground">Cancel</button>
        <button onClick={savePerformer} disabled={saving} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50">
          <Save className="mr-2 inline h-4 w-4" /> {saving ? 'Saving...' : 'Save Performer'}
        </button>
      </div>
    </div>
  );
}
