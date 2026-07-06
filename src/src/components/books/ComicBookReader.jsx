import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ComicBookReader({ pages = [], zoom, currentPage, setCurrentPage, onBookmark, isBookmarked, rtl = false }) {
  const total = pages.length;
  const page = pages[currentPage];

  if (!total) return null;

  const prevPage = () => setCurrentPage(Math.max(0, currentPage - 1));
  const nextPage = () => setCurrentPage(Math.min(total - 1, currentPage + 1));

  return (
    <div className="bg-black">
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/90 p-3 backdrop-blur">
        <p className="text-sm font-bold text-white/80">Comic / Manga mode · Page {currentPage + 1} of {total}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={rtl ? nextPage : prevPage} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/15 px-3 text-xs font-black text-white hover:bg-white/10"><ChevronLeft className="h-4 w-4" /> Prev</button>
          <button type="button" onClick={rtl ? prevPage : nextPage} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/15 px-3 text-xs font-black text-white hover:bg-white/10">Next <ChevronRight className="h-4 w-4" /></button>
          <button type="button" onClick={onBookmark} className={`inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-xs font-black ${isBookmarked ? 'bg-primary text-primary-foreground' : 'border border-primary/40 text-primary hover:bg-primary/10'}`}><Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} /> Bookmark</button>
        </div>
      </div>
      <div className="min-h-[78vh] overflow-auto bg-black p-4 text-center">
        <img src={page} alt={`Comic page ${currentPage + 1}`} className="mx-auto rounded-xl shadow-2xl transition-transform" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', maxWidth: '100%' }} />
      </div>
    </div>
  );
}