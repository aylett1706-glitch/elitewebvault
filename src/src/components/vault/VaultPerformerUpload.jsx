import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Image, Loader2, Plus, Save, Upload, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageSourceField from '@/components/media/ImageSourceField';

const emptyForm = {
  stage_name: '',
  name: '',
  bio: '',
  photo_url: '',
  cover_url: '',
  nationality: '',
  gender: 'Female',
  tags: '',
  notes: '',
  profile_url: ''
};

export default function VaultPerformerUpload({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoDraft, setVideoDraft] = useState({ title: '', video_url: '', source_url: '', poster_url: '' });

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const uploadFile = async (file, onDone, label) => {
    if (!file) return;
    setUploading(label);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onDone(file_url);
    setUploading('');
    toast.success('File uploaded');
  };

  const addVideo = () => {
    if (!videoDraft.video_url && !videoDraft.source_url) {
      toast.error('Add or upload a video first');
      return;
    }
    setVideos(prev => [...prev, { ...videoDraft, title: videoDraft.title || `Video ${prev.length + 1}` }]);
    setVideoDraft({ title: '', video_url: '', source_url: '', poster_url: '' });
  };

  const savePerformer = async () => {
    if (!form.stage_name.trim() && !form.name.trim()) {
      toast.error('Stage name or name is required');
      return;
    }

    setSaving(true);
    const performer = await base44.entities.Performer.create({
      ...form,
      name: form.name || form.stage_name,
      gallery_urls: galleryUrls,
      video_examples: videos,
      tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      total_scenes: videos.length
    });
    toast.success('Performer profile saved');
    setForm(emptyForm);
    setGalleryUrls([]);
    setVideos([]);
    setOpen(false);
    onCreated?.(performer);
    setSaving(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20">
        <Plus className="h-4 w-4" /> Upload Performer Profile
      </button>
    );
  }

  return (
    <section className="mb-10 rounded-3xl border border-red-900/30 bg-card p-5 shadow-2xl shadow-black/30">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Upload Performer Profile</h2>
          <p className="text-sm text-muted-foreground">Add pictures, videos, and profile information to the private vault.</p>
        </div>
        <button onClick={() => setOpen(false)} className="rounded-xl bg-secondary p-2 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['Stage Name', 'stage_name'], ['Name', 'name'], ['Nationality', 'nationality'],
          ['Official/Profile URL', 'profile_url'], ['Tags', 'tags'], ['Notes', 'notes']
        ].map(([label, field]) => (
          <div key={field}>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
            <input value={form[field] || ''} onChange={(e) => setField(field, e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-red-500/60 focus:outline-none" />
          </div>
        ))}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Gender</label>
          <select value={form.gender} onChange={(e) => setField('gender', e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-red-500/60 focus:outline-none">
            {['Female', 'Male', 'Trans', 'Non-binary', 'Other'].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
      </div>

      <textarea value={form.bio} onChange={(e) => setField('bio', e.target.value)} rows={4} placeholder="Bio and relevant information..." className="mt-4 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-red-500/60 focus:outline-none" />

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ImageSourceField label="Profile Picture" value={form.photo_url} onChange={(url) => setField('photo_url', url)} aspect="aspect-[3/4]" />
        <ImageSourceField label="Cover Picture" value={form.cover_url} onChange={(url) => setField('cover_url', url)} />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Image className="h-4 w-4 text-red-400" /><h3 className="font-bold text-foreground">Gallery Pictures</h3></div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500">
            {uploading === 'gallery' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload Pictures
            <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              for (const file of files) await uploadFile(file, url => setGalleryUrls(prev => [...prev, url]), 'gallery');
              e.target.value = '';
            }} />
          </label>
        </div>
        {galleryUrls.length > 0 && <div className="grid grid-cols-3 gap-2 md:grid-cols-6">{galleryUrls.map((url, index) => <img key={index} src={url} alt="Gallery upload" className="aspect-square rounded-xl object-cover" />)}</div>}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4">
        <div className="mb-3 flex items-center gap-2"><Video className="h-4 w-4 text-red-400" /><h3 className="font-bold text-foreground">Videos</h3></div>
        <div className="grid gap-3 md:grid-cols-2">
          <input value={videoDraft.title} onChange={(e) => setVideoDraft(v => ({ ...v, title: e.target.value }))} placeholder="Video title" className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground" />
          <input value={videoDraft.source_url} onChange={(e) => setVideoDraft(v => ({ ...v, source_url: e.target.value }))} placeholder="Source page URL" className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground" />
          <input value={videoDraft.video_url} onChange={(e) => setVideoDraft(v => ({ ...v, video_url: e.target.value }))} placeholder="Video URL or upload below" className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground" />
          <input value={videoDraft.poster_url} onChange={(e) => setVideoDraft(v => ({ ...v, poster_url: e.target.value }))} placeholder="Video poster URL" className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground" />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/20">
            {uploading === 'video' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload Video File
            <input type="file" accept="video/*" className="hidden" onChange={(e) => uploadFile(e.target.files?.[0], url => setVideoDraft(v => ({ ...v, video_url: url })), 'video')} />
          </label>
          <button onClick={addVideo} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500"><Plus className="h-4 w-4" /> Add Video</button>
        </div>
        {videos.length > 0 && <div className="mt-3 space-y-2">{videos.map((video, index) => <div key={index} className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground">{video.title}</div>)}</div>}
      </div>

      <div className="mt-5 flex gap-3">
        <button onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-muted-foreground hover:text-foreground">Cancel</button>
        <button onClick={savePerformer} disabled={saving} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50">
          <Save className="mr-2 inline h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </section>
  );
}