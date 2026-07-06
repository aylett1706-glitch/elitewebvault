import EmbeddedGameVideoCard from './EmbeddedGameVideoCard';
import { BookOpen, Lightbulb, ListChecks, Map, Shield, Sparkles } from 'lucide-react';

const wikiSections = [
  { icon: ListChecks, title: 'Step-by-step path', text: 'Follow the video in order, pause at major objectives, and use checkpoints or save points before boss fights and puzzle rooms.' },
  { icon: Lightbulb, title: 'Quick tips', text: 'Watch for shortcuts, safe routes, inventory upgrades, hidden doors, timing windows, and recommended loadouts shown in the guide.' },
  { icon: Map, title: 'Collectibles & secrets', text: 'Use the walkthrough to track optional items, side quests, map completion, trophies, achievements, and easter eggs.' },
  { icon: Shield, title: 'Bosses & mechanics', text: 'Replay combat sections for attack patterns, weak points, dodges, parries, builds, and phase changes.' }
];

export default function GameWikiWalkthroughCard({ video }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-primary/20 bg-card">
      <EmbeddedGameVideoCard video={video} />
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
          <BookOpen className="h-4 w-4" /> Wiki-style walkthrough notes
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use this like a Fandom-style companion page: video first, then reference notes for objectives, secrets, mechanics, and completion help.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {wikiSections.map(section => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded-2xl border border-border bg-secondary/50 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-black text-foreground">
                  <Icon className="h-4 w-4 text-primary" /> {section.title}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{section.text}</p>
              </div>
            );
          })}
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-black text-primary"><Sparkles className="mr-1 inline h-3.5 w-3.5" />Pro tip:</span> search the exact game title plus “100%”, “boss guide”, “collectibles”, or “all endings” for deeper routes.
        </div>
      </div>
    </article>
  );
}