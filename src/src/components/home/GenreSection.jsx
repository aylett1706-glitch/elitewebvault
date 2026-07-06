import { Link } from 'react-router-dom';

const GENRE_COLORS = [
  'from-red-900/40 to-red-950/60 border-red-800/30',
  'from-blue-900/40 to-blue-950/60 border-blue-800/30',
  'from-purple-900/40 to-purple-950/60 border-purple-800/30',
  'from-green-900/40 to-green-950/60 border-green-800/30',
  'from-yellow-900/40 to-yellow-950/60 border-yellow-800/30',
  'from-pink-900/40 to-pink-950/60 border-pink-800/30',
];

export default function GenreSection({ genres }) {
  if (!genres?.length) return null;

  return (
    <div className="mb-12 px-6 md:px-12">
      <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight mb-5">Explore Genres & Topics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {genres.map((genre, i) => (
          <Link
            key={genre}
            to={`/genre/${encodeURIComponent(genre)}`}
            className={`group relative bg-gradient-to-br ${GENRE_COLORS[i % GENRE_COLORS.length]} border rounded-2xl px-4 py-3 hover:scale-105 transition-all duration-200 hover:shadow-lg`}
          >
            <span className="text-sm font-semibold text-white/90 group-hover:text-white">{genre}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}