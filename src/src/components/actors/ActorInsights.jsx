import { Brain, Clapperboard, Sparkles, Trophy } from 'lucide-react';

export default function ActorInsights({ actor, credits }) {
  const genres = actor?.top_genres || [];
  const notable = actor?.known_for || credits.slice(0, 5).map(item => item.title);

  const cards = [
    { icon: Brain, title: 'Acting Style', text: actor?.acting_style || 'Built from recurring roles, genres, and performance patterns across the actor’s credits.' },
    { icon: Trophy, title: 'Career Impact', text: actor?.industry_impact || 'A profile of cultural reach, genre influence, and standout eras.' },
    { icon: Clapperboard, title: 'Notable Performances', text: notable.filter(Boolean).join(', ') || 'Notable credits will appear after search.' },
    { icon: Sparkles, title: 'Genre Dominance', text: genres.length ? genres.join(', ') : 'Genre breakdown appears after the filmography loads.' }
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(card => (
        <article key={card.title} className="rounded-3xl border border-border bg-card p-5">
          <card.icon className="mb-4 h-6 w-6 text-primary" />
          <h3 className="font-black text-foreground">{card.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.text}</p>
        </article>
      ))}
    </section>
  );
}