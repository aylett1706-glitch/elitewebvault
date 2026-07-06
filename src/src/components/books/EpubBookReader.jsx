import { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EpubBookReader({ url, zoom, onBookmark, isBookmarked }) {
  const containerRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef = useRef(null);
  const [location, setLocation] = useState('Opening EPUB…');

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const book = ePub(url);
    const rendition = book.renderTo(containerRef.current, {
      width: '100%',
      height: '78vh',
      spread: 'auto'
    });
    bookRef.current = book;
    renditionRef.current = rendition;
    rendition.themes.default({ body: { background: '#0b0b0f', color: '#f8f1df' } });
    rendition.themes.fontSize(`${Math.round(100 * zoom)}%`);
    rendition.display();
    rendition.on('relocated', (loc) => setLocation(`EPUB location ${loc?.start?.percentage ? Math.round(loc.start.percentage * 100) : 0}%`));

    return () => {
      rendition.destroy();
      book.destroy();
    };
  }, [url]);

  useEffect(() => {
    renditionRef.current?.themes?.fontSize(`${Math.round(100 * zoom)}%`);
  }, [zoom]);

  return (
    <div className="bg-black">
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/90 p-3 backdrop-blur">
        <p className="text-sm font-bold text-white/80">{location}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => renditionRef.current?.prev()} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/15 px-3 text-xs font-black text-white hover:bg-white/10"><ChevronLeft className="h-4 w-4" /> Prev</button>
          <button type="button" onClick={() => renditionRef.current?.next()} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/15 px-3 text-xs font-black text-white hover:bg-white/10">Next <ChevronRight className="h-4 w-4" /></button>
          <button type="button" onClick={onBookmark} className={`inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-xs font-black ${isBookmarked ? 'bg-primary text-primary-foreground' : 'border border-primary/40 text-primary hover:bg-primary/10'}`}><Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} /> Bookmark</button>
        </div>
      </div>
      <div ref={containerRef} className="min-h-[78vh] bg-black" />
    </div>
  );
}