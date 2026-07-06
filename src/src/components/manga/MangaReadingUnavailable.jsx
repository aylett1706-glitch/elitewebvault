import { BookOpen, ExternalLink, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MangaReadingUnavailable({ manga, user }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="grid gap-6 md:grid-cols-[180px_1fr]">
        <div className="mx-auto aspect-[2/3] w-44 overflow-hidden rounded-2xl bg-secondary md:mx-0">
          {manga.cover_url ? <img src={manga.cover_url} alt={manga.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><BookOpen className="h-10 w-10 text-primary" /></div>}
        </div>
        <div>
          <h2 className="text-2xl font-black text-foreground">{manga.title}</h2>
          <p className="mt-1 text-sm font-bold text-primary">{[manga.author, manga.artist].filter(Boolean).join(' • ') || 'Manga'}</p>
          {manga.genres?.length > 0 && <p className="mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">{manga.genres.join(' • ')}</p>}
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{manga.synopsis || 'No synopsis available yet.'}</p>

          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <h3 className="text-sm font-black text-foreground">Full chapters haven’t been added yet</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              This title currently has catalog details only. To read it inside the app, add chapter page image URLs in the Manga chapter manager, or add an official reading link.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {manga.read_url && (
                <a href={manga.read_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground hover:bg-primary/90">
                  <ExternalLink className="h-4 w-4" /> Read official source
                </a>
              )}
              {manga.source_url && (
                <a href={manga.source_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-5 text-sm font-black text-foreground hover:border-primary/50">
                  <ExternalLink className="h-4 w-4" /> View manga info
                </a>
              )}
              {user?.role === 'admin' && (
                <Link to="/manga" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/30 px-5 text-sm font-black text-primary hover:bg-primary/10">
                  <Upload className="h-4 w-4" /> Add chapter pages
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}