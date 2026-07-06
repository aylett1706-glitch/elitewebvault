import { Link } from 'react-router-dom';
import { BookOpen, Check, ExternalLink, Headphones, Plus, Star, Tags, Users } from 'lucide-react';

const typeLabels = {
  ebook: 'eBook',
  pdf: 'PDF',
  comic: 'Comic',
  manga: 'Manga',
  magazine: 'Magazine',
  manual: 'Manual',
  educational: 'Learning',
  light_novel: 'Light Novel',
  interactive: 'Interactive',
  audiobook: 'Audiobook'
};

export default function BookCard({ book, onAdd, added = false }) {
  const genreTags = (book.genres?.length ? book.genres : book.categories || []).slice(0, 3);
  const characterTags = (book.character_tags || []).slice(0, 3);
  const canReadSaved = Boolean(book.id);
  const externalReadUrl = book.info_url || book.preview_url;

  return (
    <article className="group overflow-hidden rounded-3xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10">
      <div className="relative aspect-[3/4] bg-secondary">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center"><BookOpen className="h-12 w-12 text-primary" /></div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-black text-primary backdrop-blur">
          {typeLabels[book.content_type] || 'Book'}
        </div>
        {book.has_audiobook && <Headphones className="absolute right-3 top-3 h-5 w-5 text-primary" />}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-sm font-black text-foreground">{book.title}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{book.authors?.join(', ') || book.publisher || 'Unknown author'}</p>
        </div>
        <p className="line-clamp-3 min-h-[3rem] text-xs leading-relaxed text-muted-foreground">{book.description || 'No description available yet.'}</p>
        {genreTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label="Genres">
            <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-2 py-1 text-[10px] font-black text-accent"><Tags className="h-3 w-3" /> Genre</span>
            {genreTags.map(tag => <span key={tag} className="rounded-full border border-accent/20 bg-accent/10 px-2 py-1 text-[10px] font-black text-accent">{tag}</span>)}
          </div>
        )}
        {characterTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label="Character tags">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-1 text-[10px] font-black text-primary"><Users className="h-3 w-3" /> Characters</span>
            {characterTags.map(tag => <span key={tag} className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-black text-primary">{tag}</span>)}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {(book.formats || ['EPUB', 'PDF']).slice(0, 3).map(format => (
            <span key={format} className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-black text-primary">{format}</span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground"><Star className="h-3.5 w-3.5 text-primary" /> {book.page_count || '—'} pages</span>
          {onAdd ? (
            <button type="button" onClick={() => !added && onAdd(book)} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black ${added ? 'bg-green-500/20 text-green-400' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
              {added ? <><Check className="h-3.5 w-3.5" /> Saved</> : <><Plus className="h-3.5 w-3.5" /> Add</>}
            </button>
          ) : canReadSaved ? (
            <Link to={`/books/${book.id}/read`} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-black text-primary-foreground hover:bg-primary/90">
              <BookOpen className="h-3.5 w-3.5" /> Read
            </Link>
          ) : externalReadUrl ? (
            <a href={externalReadUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-black text-primary-foreground hover:bg-primary/90">
              Read <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
