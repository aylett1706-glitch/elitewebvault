import GameCard from './GameCard';

export default function GameCollectionRow({ title, description, games, favoriteIds, onToggleFavorite }) {
  if (!games?.length) return null;

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map(game => (
          <GameCard
            key={game.id}
            game={game}
            isFavorite={favoriteIds?.has(game.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}