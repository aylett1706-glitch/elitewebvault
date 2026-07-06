import { useMemo } from 'react';
import { Bookmark, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';

const getArchiveId = (book) => {
  const source = `${book?.preview_url || ''} ${book?.info_url || ''}`;
  const match = source.match(/archive\.org\/(?:embed|details)\/([^\s/?#]+)/);
  return match?.[1] || '';
};

export default function BookImageReader({ book, zoom, onZoomIn, onZoomOut, onBookmark, isBookmarked }) {
  const archiveId = useMemo(() => getArchiveId(book), [book]);
  const embedUrl = archiveId ? `https://archive.org/embed/${archiveId}?ui=embed&view=theater&wrapper=false` : '';
  const detailsUrl = archiveId ? `https://archive.org/details/${archiveId}` : '';

  if (!archiveId) return null;

  return (
    <div className="bg-black">
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/90 p-3 backdrop-blur">
        <p className="text-sm font-bold text-white/80">Full scanned book player with page images</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onZoomOut} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/15 px-3 text-xs font-black text-white hover:bg-white/10">
            <ZoomOut className="h-4 w-4" /> Zoom out
          </button>
          <button type="button" onClick={onZoomIn} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/15 px-3 text-xs font-black text-white hover:bg-white/10">
            <ZoomIn className="h-4 w-4" /> Zoom in
          </button>
          <button type="button" onClick={onBookmark} className={`inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-xs font-black ${isBookmarked ? 'bg-primary text-primary-foreground' : 'border border-primary/40 text-primary hover:bg-primary/10'}`}>
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} /> Bookmark
          </button>
          <a href={detailsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/15 px-3 text-xs font-black text-white hover:bg-white/10">
            Source <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="h-[82vh] overflow-auto bg-black p-2">
        <iframe
          title={`${book.title} full scanned reader`}
          src={embedUrl}
          className="h-full min-h-[760px] w-full origin-top rounded-2xl border-0 bg-black transition-transform"
          style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%` }}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}