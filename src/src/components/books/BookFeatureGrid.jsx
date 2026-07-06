import { Accessibility, BookMarked, Brain, Gamepad2, GraduationCap, Headphones, Library, Sparkles, Users } from 'lucide-react';

const features = [
  { icon: Library, title: 'Digital library', text: 'Save eBooks, PDFs, comics, manga, magazines, manuals, light novels and learning books.' },
  { icon: BookMarked, title: 'Elite reader', text: 'Dark, sepia, dyslexia, spacing, margins, scrolling, highlights, notes, quotes and progress.' },
  { icon: Headphones, title: 'Audiobooks', text: 'Speed, sleep timer, chapters, bookmarks, transcripts, enhanced voices and offline-ready planning.' },
  { icon: Brain, title: 'AI assistant', text: 'Ask for summaries, translations, dictionary help, chapter answers, quizzes and study notes.' },
  { icon: Sparkles, title: 'Immersive mode', text: 'Plan cinematic reading with ambience, soundtrack sync, animated pages and AI scenery.' },
  { icon: Gamepad2, title: 'Cross-media universe', text: 'Connect books with movies, games, lore, soundtracks, videos and community discussions.' },
  { icon: Users, title: 'Social reading', text: 'Book clubs, live reading rooms, shared highlights, comments, reactions and streaks.' },
  { icon: GraduationCap, title: 'Knowledge hub', text: 'Learning paths, textbooks, certifications, AI tutoring, flashcards and note generation.' },
  { icon: Accessibility, title: 'Accessible by design', text: 'Text-to-speech, high contrast, dyslexia support, voice navigation and large text mode.' }
];

export default function BookFeatureGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Books hub features">
      {features.map(feature => {
        const Icon = feature.icon;
        return (
          <div key={feature.title} className="rounded-3xl border border-border bg-card p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.text}</p>
          </div>
        );
      })}
    </section>
  );
}