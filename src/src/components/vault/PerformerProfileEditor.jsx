import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Image, Link2, Loader2, Plus, Save, Trash2, Upload, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageSourceField from '@/components/media/ImageSourceField';

const emptyForm = {
  name: '',
  stage_name: '',
  bio: '',
  photo_url: '',
  cover_url: '',
  nationality: '',
  country_code: '',
  gender: 'Female',
  tags: '',
  content_categories: '',
  character_traits: '',
  character_style: '',
  bundle_name: '',
  bundle_description: '',
  notes: '',
  profile_url: ''
};

export default function PerformerProfileEditor({ performerRecord, performerName, currentPerformer, currentVideos = [], onSaved, onClose }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [galleryUrlDraft, setGalleryUrlDraft] = useState('');
  const [videos, setVideos] = useState([]);
  const [videoDraft, setVideoDraft] = useState({ title: '', video_url: '', source_url: '', poster_url: '' });

  useEffect(() => {
    const source = performerRecord || currentPerformer || {};
    setForm({
      name: source.name || performerName || '',
      stage_name: source.stage_name || source.name || performerName || '',
      bio: source.bio || '',
      photo_url: source.photo_url || source.portrait_url || '',
      cover_url: source.cover_url || '',
      nationality: source.nationality || '',
      country_code: source.country_code || '',
      gender: source.gender || 'Female',
      tags: (source.tags || source.categories || []).join(', '),
      content_categories: (source.content_categories || []).join(', '),
      character_traits: (source.character_traits || []).join(', '),
      character_style: source.character_style || '',
      bundle_name: source.bundle_name || '',
      bundle_description: source.bundle_description || '',
      notes: source.notes || '',
      profile_url: source.profile_url || ''
    });
    setGalleryUrls(source.gallery_urls || []);
    setVideos(source.video_examples?.length ? source.video_examples : currentVideos);
  }, [performerRecord, currentPerformer, performerName, currentVideos]);

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const uploadFile = async (file, onDone, label) => {
    if (!file) return;
    setUploading(label);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onDone(file_url);
    setUploading('');
    toast.success('File uploaded');
  };

  const addGalleryUrl = () => {
    const url = galleryUrlDraft.trim();
    if (!url) return;
    setGalleryUrls(prev => [...prev, url]);
    setGalleryUrlDraft('');
    toast.success('Image URL added');
  };

  const addVideo = () => {
    if (!videoDraft.video_url && !videoDraft.source_url) {
      toast.error('Add a video URL or upload a video first');
      return;
    }
    setVideos(prev => [...prev, { ...videoDraft, title: videoDraft.title || `Video ${prev.length + 1}` }]);
    setVideoDraft({ title: '', video_url: '', source_url: '', poster_url: '' });
  };

  const saveProfile = async () => {
    if (!form.name.trim() && !form.stage_name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      name: form.name || form.stage_name,
      tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      content_categories: form.content_categories ? form.content_categories.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      character_traits: form.character_traits ? form.character_traits.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      gallery_urls: galleryUrls,
      video_examples: videos,
      total_scenes: videos.length
    };

    const saved = performerRecord?.id
      ? await base44.entities.Performer.update(performerRecord.id, payload)
      : await base44.entities.Performer.create(payload);

    toast.success('Performer profile saved');
    onSaved?.(saved);
    setSaving(false);
  };

  return (
    <section className="mb-8 rounded-3xl border border-red-900/30 bg-card p-5 shadow-2xl shadow-black/30">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Edit Performer Profile</h2>
          <p className="text-sm text-muted-foreground">Update info, pictures, gallery images, and videos.</p>
        </div>
        <button onClick={onClose} className="rounded-xl bg-secondary p-2 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['Stage Name', 'stage_name'], ['Name', 'name'], ['Nationality', 'nationality'],
          ['Country Code', 'country_code'], ['Official/Profile URL', 'profile_url'], ['Tags', 'tags'],
          ['Content Categories', 'content_categories'], ['Character Traits', 'character_traits'],
          ['Character Style', 'character_style'], ['Bundle Name', 'bundle_name'],
          ['Bundle Description', 'bundle_description'], ['Notes', 'notes']
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
        <ImageSourceField label="Cover Picture" value={form.cover_url} onChange={(url) => setField('cover_url', url)} aspect="aspect-[16/7]" />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Image className="h-4 w-4 text-red-400" /><h3 className="font-bold text-foreground">Pictures</h3></div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500">
            {uploading === 'gallery' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload
            <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              for (const file of files) await uploadFile(file, url => setGalleryUrls(prev => [...prev, url]), 'gallery');
              e.target.value = '';
            }} />
          </label>
        </div>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={galleryUrlDraft} onChange={(e) => setGalleryUrlDraft(e.target.value)} placeholder="Paste image URL..." className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground" />
          </div>
          <button type="button" onClick={addGalleryUrl} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 hover:bg-red-500/20">
            <Plus className="h-4 w-4" /> Add URL
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {galleryUrls.map((url, index) => (
            <div key={index} className="group relative">
              <img src={url} alt="Performer gallery" className="aspect-square rounded-xl object-cover" />
              <button onClick={() => setGalleryUrls(prev => prev.filter((_, i) => i !== index))} className="absolute right-1 top-1 rounded-lg bg-black/70 p-1 text-white opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
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
            {uploading === 'video' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload Video
            <input type="file" accept="video/*" className="hidden" onChange={(e) => uploadFile(e.target.files?.[0], url => setVideoDraft(v => ({ ...v, video_url: url })), 'video')} />
          </label>
          <button onClick={addVideo} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500"><Plus className="h-4 w-4" /> Add Video</button>
        </div>
        {videos.length > 0 && (
          <div className="mt-3 space-y-2">
            {videos.map((video, index) => (
              <div key={index} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground">
                <span className="truncate">{video.title || `Video ${index + 1}`}</span>
                <button onClick={() => setVideos(prev => prev.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <button onClick={onClose} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-muted-foreground hover:text-foreground">Cancel</button>
        <button onClick={saveProfile} disabled={saving} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50">
          <Save className="mr-2 inline h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </section>
  );
}