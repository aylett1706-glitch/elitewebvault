import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Star, Film } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { deriveMediaTopics } from '@/lib/media-classification';
import { hideWallpaperPreview, showWallpaperPreview } from '@/lib/wallpaper-preview';

function MediaCard({ item, index }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.6) }}
      className="relative shrink-0 w-32 sm:w-36 md:w-44 group cursor-pointer"
      onMouseEnter={() => showWallpaperPreview(item, 'media')}
      onMouseLeave={hideWallpaperPreview}
    >
      <Link to={`/media/${item.id}`}>
        <div className="relative rounded-2xl overflow-hidden transition-all duration-400 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/70">
          {/* Poster */}
          <div className="aspect-[2/3] bg-secondary">
            {item.poster_url ? (
              <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                <Film className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/watch/${item.id}`);
              }}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/40 mx-auto mb-2"
            >
              <Play className="w-4 h-4 fill-primary-foreground text-primary-foreground ml-0.5" />
            </button>
            {item.rating && (
              <div className="flex items-center justify-center gap-1 text-xs text-yellow-300">
                <Star className="w-3 h-3 fill-yellow-300" />
                {item.rating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Rating Badge (always visible) */}
          {item.rating && (
            <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-lg text-xs text-yellow-300 opacity-0 group-hover:opacity-0 transition-opacity">
              <Star className="w-2.5 h-2.5 fill-yellow-300" />
              {item.rating.toFixed(1)}
            </div>
          )}

          {/* Type badge */}
          {item.type === 'tv_show' && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/80 backdrop-blur-sm text-primary-foreground text-xs font-bold rounded-lg">
              TV
            </div>
          )}
        </div>

        <div className="mt-2.5 px-1">
          <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{item.title}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {[...new Set([...(item.genres || []), ...deriveMediaTopics(item)])].slice(0, 2).map(genre => (
              <span key={genre} className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{genre}</span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{item.year}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function MediaCarousel({ title, items, viewAllPath }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 450, behavior: 'smooth' });
    }
  };

  if (!items?.length) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between gap-3 mb-5 px-4 md:px-12">
        <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{title}</h2>
        <div className="flex items-center gap-3">
          {viewAllPath && (
            <Link to={viewAllPath} className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
              View All →
            </Link>
          )}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => scroll(-1)}
              className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll(1)}
              className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative group/carousel">
        {/* Mobile arrows */}
        <button onClick={() => scroll(-1)}
          className="md:hidden absolute left-2 top-1/2 -translate-y-6 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-4 md:px-12 pb-3 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, i) => (
            <MediaCard key={item.id} item={item} index={i} />
          ))}
        </div>

        <button onClick={() => scroll(1)}
          className="md:hidden absolute right-2 top-1/2 -translate-y-6 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white">
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Fade edges on desktop */}
        <div className="hidden md:block absolute left-0 top-0 bottom-3 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="hidden md:block absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}