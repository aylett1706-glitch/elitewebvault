import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Bookmark, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function PdfBookReader({ url, zoom, currentPage, setCurrentPage, onBookmark, isBookmarked }) {
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    pdfjsLib.getDocument(url).promise.then((doc) => {
      if (!cancelled) {
        setPdf(doc);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [url]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    let cancelled = false;
    pdf.getPage(currentPage + 1).then((page) => {
      if (cancelled) return;
      const viewport = page.getViewport({ scale: Math.max(0.7, zoom) });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      page.render({ canvasContext: context, viewport });
    });
    return () => { cancelled = true; };
  }, [pdf, currentPage, zoom]);

  const totalPages = pdf?.numPages || 1;

  return (
    <div className="bg-black">
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/90 p-3 backdrop-blur">
        <p className="text-sm font-bold text-white/80">PDF reader · Page {currentPage + 1} of {totalPages}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/15 px-3 text-xs font-black text-white hover:bg-white/10"><ChevronLeft className="h-4 w-4" /> Prev</button>
          <button type="button" onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/15 px-3 text-xs font-black text-white hover:bg-white/10">Next <ChevronRight className="h-4 w-4" /></button>
          <button type="button" onClick={onBookmark} className={`inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-xs font-black ${isBookmarked ? 'bg-primary text-primary-foreground' : 'border border-primary/40 text-primary hover:bg-primary/10'}`}><Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} /> Bookmark</button>
        </div>
      </div>
      <div className="min-h-[78vh] overflow-auto p-4 text-center">
        {loading && <Loader2 className="mx-auto mt-20 h-9 w-9 animate-spin text-primary" />}
        <canvas ref={canvasRef} className="mx-auto rounded-lg bg-white shadow-2xl" />
      </div>
    </div>
  );
}