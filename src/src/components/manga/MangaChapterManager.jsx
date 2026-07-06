import { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BookPlus, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function MangaChapterManager({ manga = [], onUpdated }) {
  const [mangaId, setMangaId] = useState(manga[0]?.id || '');
  const [chapter, setChapter] = useState('1');
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState('');
  const [saving, setSaving] = useState(false);

  const selected = useMemo(() => manga.find(item => item.id === mangaId), [manga, mangaId]);

  const saveChapter = async (event) => {
    event.preventDefault();
    if (!selected || !chapter || !pages.trim()) return;
    setSaving(true);
    const pageList = pages.split('\n').map(url => url.trim()).filter(Boolean);
    const nextChapter = { chapter: Number(chapter), title: title.trim(), pages: pageList };
    const otherChapters = (selected.chapters || []).filter(item => Number(item.chapter) !== Number(chapter));
    const chapters = [...otherChapters, nextChapter].sort((a, b) => Number(a.chapter || 0) - Number(b.chapter || 0));
    const updated = await base44.entities.Manga.update(selected.id, { chapters });
    onUpdated(updated);
    setTitle('');
    setPages('');
    toast.success('Chapter saved for in-app reading');
    setSaving(false);
  };

  if (!manga.length) return null;

  return (
    <section className="mb-8 rounded-3xl border border-primary/20 bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <BookPlus className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-black text-foreground">In-App Chapter Manager</h2>
      </div>
      <form onSubmit={saveChapter} className="grid gap-3 md:grid-cols-2">
        <select value={mangaId} onChange={event => setMangaId(event.target.value)} className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground">
          {manga.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <input value={chapter} onChange={event => setChapter(event.target.value)} type="number" min="1" step="0.1" placeholder="Chapter number" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground" />
        <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Chapter title optional" className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground md:col-span-2" />
        <textarea value={pages} onChange={event => setPages(event.target.value)} placeholder="Paste manga page image URLs, one per line" className="min-h-36 rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground md:col-span-2" />
        <button disabled={saving || !selected || !pages.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground disabled:opacity-50 md:col-span-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Chapter
        </button>
      </form>
      <p className="mt-3 text-xs text-muted-foreground">Use direct image URLs so chapters open fully inside the app reader.</p>
    </section>
  );
}
