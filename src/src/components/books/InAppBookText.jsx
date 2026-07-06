import { BookOpen } from 'lucide-react';

export default function InAppBookText({ book, zoom = 1, currentPage = 0, setCurrentPage = () => {}, onBookmark, isBookmarked }) {
  const sections = [
    book.description,
    book.categories?.length ? `Topics: ${book.categories.join(', ')}` : '',
    book.genres?.length ? `Genres: ${book.genres.join(', ')}` : '',
    book.character_tags?.length ? `Character tags: ${book.character_tags.join(', ')}` : ''
  ].filter(Boolean);

  const pages = sections.length ? sections : ['This book has been saved, but no readable text has been attached yet.'];
  const safePage = Math.min(currentPage, pages.length - 1);

  return (
    <div className="min-h-[55vh] bg-[hsl(38_35%_92%)] p-5 text-[hsl(224_35%_8%)] md:p-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-[hsl(42_55%_97%)] p-6 shadow-2xl md:p-10">
        <div className="mb-6 flex items-center gap-3 border-b border-[hsl(38_24%_78%)] pb-5">
          <BookOpen className="h-8 w-8 text-[hsl(42_85%_38%)]" />
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[hsl(42_85%_38%)]">In-app reading copy</p>
            <h2 className="text-3xl font-black leading-tight">{book.title}</h2>
          </div>
        </div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[hsl(38_35%_92%)] p-3 text-sm font-black">
          <button type="button" onClick={() => setCurrentPage(Math.max(0, safePage - 1))} className="rounded-xl bg-white px-3 py-2">Prev page</button>
          <span>Page {safePage + 1} of {pages.length}</span>
          <div className="flex gap-2">
            <button type="button" onClick={onBookmark} className={`rounded-xl px-3 py-2 ${isBookmarked ? 'bg-[hsl(42_85%_48%)] text-white' : 'bg-white'}`}>Bookmark</button>
            <button type="button" onClick={() => setCurrentPage(Math.min(pages.length - 1, safePage + 1))} className="rounded-xl bg-white px-3 py-2">Next page</button>
          </div>
        </div>
        <article className="prose prose-stone max-w-none text-lg leading-9 transition-transform" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
          <p>{pages[safePage]}</p>
        </article>
      </div>
    </div>
  );
}