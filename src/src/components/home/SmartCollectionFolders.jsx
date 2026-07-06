import { Link } from 'react-router-dom';
import { BookOpen, Clapperboard, Film, Folder, Sparkles, Tv } from 'lucide-react';
import { deriveMediaTopics } from '@/lib/media-classification';

const includesAny = (values = [], terms = []) => {
  const text = values.filter(Boolean).flat().join(' ').toLowerCase();
  return terms.some(term => text.includes(term));
};

function buildFolders(media = [], books = []) {
  const safeMedia = media.filter(item => !item.is_adult);
  const movies = safeMedia.filter(item => item.type === 'movie');
  const tvShows = safeMedia.filter(item => item.type === 'tv_show');
  const byCollection = Object.values(safeMedia.reduce((acc, item) => {
    const key = item.collection_key || item.collection_name;
    if (!key) return acc;
    acc[key] = [...(acc[key] || []), item];
    return acc;
  }, {})).sort((a, b) => b.length - a.length)[0] || [];

  return [
    {
      title: 'All Movies',
      description: 'Every approved movie is automatically placed here as soon as it is added.',
      icon: Film,
      path: '/movies',
      items: movies
    },
    {
      title: 'All TV Shows',
      description: 'Every approved series is automatically grouped into the TV collection.',
      icon: Tv,
      path: '/tv-shows',
      items: tvShows
    },
    {
      title: 'Franchise Folder',
      description: 'Sequels, spin-offs, collections, and related titles grouped by collection metadata.',
      icon: Clapperboard,
      path: '/collections',
      items: byCollection
    },
    {
      title: 'Australian Picks',
      description: 'Aussie films, local shows, NITV, ABC, SBS, Indigenous, and regional content.',
      icon: Folder,
      path: '/search?q=Australian',
      items: safeMedia.filter(item => includesAny([item.country, item.genres, item.related_keywords, item.synopsis, item.streaming_platforms], ['australia', 'australian', 'abc', 'sbs', 'nitv', 'indigenous']))
    },
    {
      title: 'Kids & Family',
      description: 'Family-safe movies and shows automatically grouped by rating, tags, and kids flags.',
      icon: Sparkles,
      path: '/kids',
      items: safeMedia.filter(item => item.is_kids || includesAny([item.genres, item.related_keywords, item.content_rating], ['kids', 'family', 'animation', 'children', 'g', 'pg']))
    },
    {
      title: 'Learning & Docs',
      description: 'Educational, documentary, science, history, course, TED-style, and open learning content.',
      icon: BookOpen,
      path: '/search?q=Education',
      items: safeMedia.filter(item => includesAny([item.genres, item.related_keywords, item.synopsis], ['documentary', 'education', 'learning', 'course', 'science', 'history', 'ted', 'khan', 'open course']))
    },
    {
      title: 'Marvel Movies',
      description: 'Auto-grouped by Marvel, MCU, character tags, and collection keywords.',
      icon: Clapperboard,
      path: '/search?q=Marvel',
      items: movies.filter(item => deriveMediaTopics(item).includes('Marvel'))
    },
    {
      title: 'Anime Series',
      description: 'TV anime grouped from genre, synopsis, and tag matches.',
      icon: Tv,
      path: '/search?q=Anime',
      items: tvShows.filter(item => includesAny([item.genres, item.related_keywords, item.synopsis], ['anime', 'animation', 'manga']))
    },
    {
      title: 'Reading Folder',
      description: 'Books grouped by reading progress, categories, genres, and tags.',
      icon: BookOpen,
      path: '/books',
      items: books.filter(book => Number(book.progress_percent || 0) > 0 || includesAny([book.genres, book.categories, book.character_tags], ['marvel', 'anime', 'manga', 'comic', 'fantasy']))
    }
  ].filter(folder => folder.items.length > 0);
}

export default function SmartCollectionFolders({ media = [], books = [] }) {
  const folders = buildFolders(media, books);
  if (!folders.length) return null;

  return (
    <section className="mx-auto mb-12 max-w-screen-2xl px-4 md:px-8">
      <div className="rounded-3xl border border-primary/20 bg-card/70 p-5 md:p-6 card-glow elite-sheen">
        <div className="mb-5 flex items-start gap-3 sm:items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground elite-ring">
            <Folder className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Smart Collections</p>
            <h2 className="text-xl font-black text-foreground sm:text-2xl">Auto-organised folders</h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {folders.map(folder => {
            const Icon = folder.icon;
            return (
              <Link key={folder.title} to={folder.path} className="group rounded-3xl border border-border bg-secondary/50 p-4 hover:border-primary/50 hover:bg-primary/10">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground">{folder.items.length}</span>
                </div>
                <h3 className="text-lg font-black text-foreground group-hover:text-primary">{folder.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{folder.description}</p>
                <div className="mt-4 flex -space-x-2">
                  {folder.items.slice(0, 5).map(item => (
                    <div key={item.id} className="h-12 w-9 overflow-hidden rounded-lg border border-background bg-card">
                      {(item.poster_url || item.cover_url) ? <img src={item.poster_url || item.cover_url} alt="" className="h-full w-full object-cover" /> : <Sparkles className="m-2 h-5 w-5 text-primary" />}
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}