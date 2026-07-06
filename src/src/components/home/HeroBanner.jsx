import { useState, useEffect } from 'react';
import { Play, Info, Star, Clock, ChevronLeft, ChevronRight, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CinematicHeroEffects from '@/components/home/CinematicHeroEffects';

export default function HeroBanner({ featuredItems, wallpaperSettings }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!featuredItems?.length) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % featuredItems.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredItems?.length]);

  useEffect(() => {
    if (current >= (featuredItems?.length || 0)) setCurrent(0);
  }, [current, featuredItems?.length]);

  if (!featuredItems?.length) {
    return (
      <div className="w-full h-[90vh] bg-gradient-to-b from-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg">No featured content yet</p>
        </div>
      </div>
    );
  }

  const item = featuredItems[current];
  const prev = () => setCurrent(c => (c - 1 + featuredItems.length) % featuredItems.length);
  const next = () => setCurrent(c => (c + 1) % featuredItems.length);

  return (
    <div className="relative w-full min-h-[560px] h-[78svh] md:h-[90vh] overflow-hidden bg-transparent">
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {item.backdrop_url ? (
            <img src={item.backdrop_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary via-background to-black" />
          )}
          {/* Cinematic gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <CinematicHeroEffects intensity={wallpaperSettings?.wallpaperMotion || 'medium'} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 flex items-center pt-16 md:pt-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-12 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-xl md:max-w-2xl"
            >
              {/* Type + Meta badges */}
              <div className="flex items-center gap-2.5 mb-5">
                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-widest shadow-lg shadow-primary/30">
                  {item.type === 'tv_show' ? 'Series' : 'Film'}
                </span>
                {item.rating && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur border border-white/15 rounded-full text-xs text-yellow-300 font-semibold">
                    <Star className="w-3 h-3 fill-yellow-300" />
                    {item.rating.toFixed(1)}
                  </span>
                )}
                {item.year && (
                  <span className="px-3 py-1 bg-white/10 backdrop-blur border border-white/15 rounded-full text-xs text-muted-foreground font-medium">
                    {item.year}
                  </span>
                )}
                {item.duration_minutes && (
                  <span className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur border border-white/15 rounded-full text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {Math.floor(item.duration_minutes / 60)}h {item.duration_minutes % 60}m
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-bebas text-5xl sm:text-6xl md:text-8xl tracking-wide text-foreground mb-4 leading-none drop-shadow-2xl">
                {item.title}
              </h1>

              {/* Genres */}
              {item.genres?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.genres.slice(0, 4).map(g => (
                    <span key={g} className="text-xs text-muted-foreground/80">{g}</span>
                  )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key={`dot-${i}`} className="text-muted-foreground/40 text-xs">·</span>, el], [])}
                </div>
              )}

              {/* Synopsis */}
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 md:mb-8 line-clamp-3 leading-relaxed max-w-xl">
                {item.synopsis}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/watch/${item.id}`}
                  className="flex min-h-11 items-center gap-2.5 bg-primary text-primary-foreground px-5 md:px-7 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/40"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Watch Now
                </Link>
                <Link
                  to={`/media/${item.id}`}
                  className="flex min-h-11 items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-foreground px-5 md:px-7 py-3 rounded-2xl font-semibold text-sm hover:bg-white/20 transition-all"
                >
                  <Info className="w-4 h-4" />
                  More Info
                </Link>
                {item.trailer_url && (
                  <a
                    href={item.trailer_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 bg-red-600/90 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-red-500 transition-all hover:scale-105"
                  >
                    <Youtube className="w-4 h-4" />
                    Trailer
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Arrows */}
      {featuredItems.length > 1 && (
        <>
          <button onClick={prev} aria-label="Previous featured title"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} aria-label="Next featured title"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary">
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Progress dots */}
      {featuredItems.length > 1 && (
        <div className="absolute bottom-10 left-6 md:left-12 flex items-center gap-2">
          {featuredItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Show featured title ${i + 1}`}
              className={`transition-all duration-500 rounded-full focus-visible:ring-2 focus-visible:ring-primary ${
                i === current ? 'w-8 h-2 bg-primary shadow-lg shadow-primary/50' : 'w-2 h-2 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Poster thumbnails (right side, desktop only) */}
      {featuredItems.length > 1 && (
        <div className="hidden xl:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col gap-3">
          {featuredItems.map((fi, index) => ({ fi, index })).slice(Math.max(0, Math.min(current - 2, featuredItems.length - 5)), Math.max(5, Math.min(current - 2, featuredItems.length - 5) + 5)).map(({ fi, index }) => (
            <button
              key={fi.id || index}
              onClick={() => setCurrent(index)}
              className={`w-16 h-24 rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                index === current ? 'border-primary scale-110 shadow-lg shadow-primary/30' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              {fi.poster_url
                ? <img src={fi.poster_url} alt={fi.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-secondary" />
              }
            </button>
          ))}
        </div>
      )}
    </div>
  );
}