import MediaCarousel from '@/components/home/MediaCarousel';

export default function SmartLists({ media, watchHistory, ratings }) {
  const watchedIds = new Set((watchHistory || []).map(item => item.media_id));
  const completedIds = new Set((watchHistory || []).filter(item => item.completed).map(item => item.media_id));
  const favoriteIds = new Set((ratings || []).filter(item => Number(item.rating || 0) >= 4).map(item => item.media_id));

  const favorites = media.filter(item => favoriteIds.has(item.id) || item.is_featured).slice(0, 20);
  const recentlyFinished = media.filter(item => completedIds.has(item.id)).slice(0, 20);
  const toWatch = media.filter(item => !watchedIds.has(item.id) && !item.is_adult).slice(0, 20);

  return (
    <section className="mb-4">
      <div className="mb-5 px-6 md:px-12">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Auto-organized</p>
        <h2 className="text-2xl font-black text-foreground">Smart Lists</h2>
        <p className="mt-1 text-sm text-muted-foreground">Favorites, finished titles, and your to-watch list update automatically from your activity.</p>
      </div>
      <MediaCarousel title="Favorites" items={favorites} viewAllPath="/my-list" />
      <MediaCarousel title="Recently Finished" items={recentlyFinished} viewAllPath="/my-list" />
      <MediaCarousel title="To-Watch" items={toWatch} viewAllPath="/movies" />
    </section>
  );
}