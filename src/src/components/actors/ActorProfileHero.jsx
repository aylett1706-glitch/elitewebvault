import { Calendar, Film, Star, Tv, UserRound } from 'lucide-react';

export default function ActorProfileHero({ actor, credits }) {
  const movies = credits.filter(item => item.type === 'movie').length;
  const tvShows = credits.filter(item => item.type === 'tv_show').length;
  const banner = actor?.banner_url || credits.find(item => item.backdrop_url)?.backdrop_url;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card card-glow">
      {banner && <img src={banner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/30" />
      <div className="relative grid gap-6 p-6 md:grid-cols-[180px_1fr] md:p-8">
        <div className="h-64 w-44 overflow-hidden rounded-3xl border border-primary/20 bg-secondary md:h-72 md:w-full">
          {actor?.profile_url ? <img src={actor.profile_url} alt={actor.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><UserRound className="h-16 w-16 text-primary" /></div>}
        </div>
        <div className="min-w-0 self-end">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Cinematic Actor Profile</p>
          <h2 className="mt-2 font-bebas text-5xl tracking-wider text-foreground md:text-7xl">{actor?.name}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{actor?.career_summary || actor?.biography || 'Generating a career overview from the actor’s filmography.'}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon={Film} label="Movies" value={movies} />
            <Stat icon={Tv} label="TV Shows" value={tvShows} />
            <Stat icon={Star} label="Popularity" value={Math.round(actor?.popularity || 0)} />
            <Stat icon={Calendar} label="Known For" value={actor?.known_for?.[0] || 'Acting'} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <Icon className="mb-2 h-4 w-4 text-primary" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-black text-foreground">{value}</p>
    </div>
  );
}