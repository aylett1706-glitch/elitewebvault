import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, TrendingUp } from 'lucide-react';

const CACHE_KEY = 'ev_trending_cache_v1';
const REFRESH_KEY = 'ev_trending_refresh_v1';
const REFRESH_INTERVAL = 10 * 60 * 1000;

const buildTrending = (history = []) => {
  const aggregated = {};
  history.forEach(item => {
    if (!item.media_id) return;
    if (!aggregated[item.media_id]) {
      aggregated[item.media_id] = { ...item, count: 0 };
    }
    aggregated[item.media_id].count++;
  });
  return Object.values(aggregated).sort((a, b) => b.count - a.count).slice(0, 10);
};

export default function TrendingNow({ historyItems = [] }) {
  const [items, setItems] = useState(() => JSON.parse(sessionStorage.getItem(CACHE_KEY) || '[]'));

  useEffect(() => {
    if (historyItems.length) {
      const trending = buildTrending(historyItems);
      setItems(trending);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(trending));
      return;
    }

    const load = async () => {
      const lastRefresh = Number(sessionStorage.getItem(REFRESH_KEY) || 0);
      if (items.length && Date.now() - lastRefresh < REFRESH_INTERVAL) return;

      try {
        const history = await base44.entities.WatchHistory.list('-last_watched', 100);
        const trending = buildTrending(history);
        setItems(trending);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(trending));
        sessionStorage.setItem(REFRESH_KEY, String(Date.now()));
      } catch {
        // Keep cached trending items if the API is rate-limited.
      }
    };
    load();
  }, [historyItems]);


  if (items.length === 0) return null;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="font-bebas text-2xl text-foreground">🔥 Trending Now</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
        {items.map((item, i) => (
          <motion.div key={item.media_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Link to={`/media/${item.media_id}`} className="group block">
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-secondary mb-2 group-hover:scale-105 transition-all duration-300 shadow-md group-hover:shadow-xl relative">
                {item.poster_url
                  ? <img src={item.poster_url} alt={item.media_title} className="w-full h-full object-cover" loading="lazy" />
                  : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted"><Film className="w-8 h-8 text-muted-foreground" /></div>
                }
                {/* Watch count badge */}
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-bold">
                  {item.count} watched
                </div>
              </div>
              <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{item.media_title}</p>
              <p className="text-xs text-muted-foreground">{item.media_type === 'tv_show' ? 'TV' : 'Movie'}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}