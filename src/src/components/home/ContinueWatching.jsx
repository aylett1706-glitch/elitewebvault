import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ContinueWatching({ items }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 400, behavior: 'smooth' });

  const activeItems = (items || []).filter(item => !item.completed && (item.progress_seconds || 0) > 5);

  if (!activeItems.length) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Continue Watching</h2>
      </div>

      <div className="relative group/carousel">
        <button onClick={() => scroll(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 backdrop-blur border border-white/10 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-2" style={{ scrollbarWidth: 'none' }}>
          {activeItems.map((item, i) => {
            const progress = item.duration_seconds > 0
              ? (item.progress_seconds / item.duration_seconds) * 100
              : 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative shrink-0 w-56 md:w-64 group cursor-pointer"
              >
                <Link to={`/watch/${item.media_id}?${item.media_type === 'tv_show' ? `season=${item.season || 1}&episode=${item.episode || 1}&` : ''}t=${item.progress_seconds || 0}`}>
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-secondary group-hover:scale-105 transition-transform duration-300">
                    {item.poster_url ? (
                      <img src={item.poster_url} alt={item.media_title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secondary to-muted" />
                    )}

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-primary-foreground text-primary-foreground" />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                  </div>

                  <div className="mt-2 px-1">
                    <p className="text-xs font-medium text-foreground truncate">{item.media_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(progress)}% watched
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <button onClick={() => scroll(1)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 backdrop-blur border border-white/10 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}