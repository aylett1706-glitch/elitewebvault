export default function MangaChapterReader({ manga, chapter, zoom }) {
  return (
    <div className="space-y-4">
      {(chapter?.pages || []).map((page, index) => (
        <img
          key={`${page}-${index}`}
          src={page}
          alt={`${manga.title} chapter ${chapter.chapter} page ${index + 1}`}
          className="mx-auto rounded-2xl border border-border bg-card"
          style={{ width: `${zoom}%` }}
          loading="eager"
          decoding="sync"
        />
      ))}
    </div>
  );
}