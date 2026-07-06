import { ExternalLink } from 'lucide-react';

export default function MangaExternalReader({ manga }) {
  if (!manga.read_url) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-primary/20 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <h2 className="text-lg font-black text-foreground">Official Reader</h2>
          <p className="text-xs text-muted-foreground">{manga.read_source_label || 'Official manga reading source'}</p>
        </div>
        <a href={manga.read_url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground">
          Open full page <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <iframe title={`${manga.title} official reader`} src={manga.read_url} className="h-[78vh] w-full border-0 bg-black" allow="fullscreen" />
    </section>
  );
}