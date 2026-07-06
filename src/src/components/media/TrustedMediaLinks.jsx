import { ExternalLink } from 'lucide-react';

const encode = (value = '') => encodeURIComponent(String(value).trim());

const buildLinks = (media) => {
  const title = media?.title || '';
  const year = media?.year ? ` ${media.year}` : '';
  const query = encode(`${title}${year}`);
  const tmdbType = media?.type === 'tv_show' ? 'tv' : 'movie';

  return [
    {
      name: 'TMDb',
      description: 'Detailed movie and TV metadata',
      url: media?.tmdb_id ? `https://www.themoviedb.org/${tmdbType}/${media.tmdb_id}` : `https://www.themoviedb.org/search?query=${query}`,
    },
    {
      name: 'Simkl',
      description: 'Tracking for TV, anime, and movies',
      url: `https://simkl.com/search/?q=${query}`,
    },
    {
      name: 'Letterboxd',
      description: 'Film lists, diaries, and community reviews',
      url: `https://letterboxd.com/search/${query}/`,
    },
    {
      name: 'Trakt',
      description: 'Watchlists and viewing history sync',
      url: `https://trakt.tv/search?query=${query}`,
    },
    {
      name: 'Metacritic',
      description: 'Aggregated critic scores',
      url: `https://www.metacritic.com/search/${query}/`,
    },
    {
      name: 'Rotten Tomatoes',
      description: 'Critic and audience score comparison',
      url: `https://www.rottentomatoes.com/search?search=${query}`,
    },
    {
      name: 'AllMovie',
      description: 'Simple classic movie browsing',
      url: `https://www.allmovie.com/search/all/${query}`,
    },
  ];
};

export default function TrustedMediaLinks({ media }) {
  const links = buildLinks(media);

  return (
    <section className="mt-10 rounded-3xl border border-border bg-card/70 p-5">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Trusted info sources</p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">Reviews, ratings & watch tracking</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-border bg-secondary/50 p-4 transition-colors hover:border-primary/50 hover:bg-secondary"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-foreground group-hover:text-primary">{link.name}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{link.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}