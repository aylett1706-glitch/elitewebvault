import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';

export default function MangaReaderControls({ chapters, currentChapter, previousChapter, nextChapter, onChapterChange, zoom, onZoomChange, bookmarked, onToggleBookmark }) {
  return (
    <div className="sticky top-20 z-30 mb-6 rounded-2xl border border-border bg-background/95 p-3 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button disabled={!previousChapter} onClick={() => onChapterChange(previousChapter)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-secondary px-3 text-sm font-bold text-foreground disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <select value={currentChapter?.chapter || ''} onChange={event => onChapterChange(chapters.find(chapter => String(chapter.chapter) === event.target.value))} className="min-h-10 rounded-xl border border-border bg-secondary px-3 text-sm font-bold text-foreground">
          {chapters.map(chapter => <option key={chapter.chapter} value={chapter.chapter}>Chapter {chapter.chapter}{chapter.title ? ` · ${chapter.title}` : ''}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <button onClick={() => onZoomChange(Math.max(70, zoom - 10))} className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground"><Minus className="h-4 w-4" /></button>
          <span className="w-12 text-center text-xs font-black text-primary">{zoom}%</span>
          <button onClick={() => onZoomChange(Math.min(140, zoom + 10))} className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground"><Plus className="h-4 w-4" /></button>
          <button onClick={onToggleBookmark} className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground" title="Bookmark chapter">
            {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>
        <button disabled={!nextChapter} onClick={() => onChapterChange(nextChapter)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground disabled:opacity-40">
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}