import { Bookmark, ExternalLink } from 'lucide-react';

export default function WebBookReader({ url, title, zoom = 1, onBookmark, isBookmarked }) {
  return (
    <div className="bg-black">
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/90 p-3 backdrop-blur">
        <p className="text-sm font-bold text-white/80">Full web book reader</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onBookmark} className={`inline-flex min-h-10 items-center gap-1 rounded-xl px-3 text-xs font-black ${isBookmarked ? 'bg-primary text-primary-foreground' : 'border border-primary/40 text-primary hover:bg-primary/10'}`}>
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} /> Bookmark
          </button>
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/15 px-3 text-xs font-black text-white hover:bg-white/10">
            Open source <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="h-[82vh] overflow-auto bg-black p-2">
        <iframe
          title={`${title || 'Book'} full reader`}
          src={url}
          className="h-full min-h-[760px] w-full origin-top rounded-2xl border-0 bg-white transition-transform"
          style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%` }}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}