import { useEffect, useState } from 'react';
import { Crosshair, TimerReset } from 'lucide-react';

export default function TrainingSystem() {
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [started, setStarted] = useState(null);
  const [reaction, setReaction] = useState(null);
  const [hits, setHits] = useState(0);

  const spawn = () => {
    setTarget({ x: 10 + Math.random() * 80, y: 15 + Math.random() * 70 });
    setStarted(performance.now());
  };

  useEffect(() => { spawn(); }, []);

  const hit = () => {
    if (started) setReaction(Math.round(performance.now() - started));
    setHits(prev => prev + 1);
    spawn();
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5" aria-labelledby="training-title">
      <div className="mb-4 flex items-center gap-3">
        <Crosshair className="h-6 w-6 text-primary" aria-hidden="true" />
        <div>
          <h2 id="training-title" className="text-xl font-black text-foreground">Built-In Training System</h2>
          <p className="text-sm text-muted-foreground">Aim, reaction and precision drills for mouse, touch or controller navigation.</p>
        </div>
      </div>
      <div className="relative h-72 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-secondary to-background">
        <button
          onClick={hit}
          className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/30 focus-visible:ring-4 focus-visible:ring-primary/50"
          style={{ left: `${target.x}%`, top: `${target.y}%` }}
          aria-label="Hit training target"
        >
          <Crosshair className="h-6 w-6" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="rounded-full bg-secondary px-3 py-1">Hits: {hits}</span>
        <span className="rounded-full bg-secondary px-3 py-1">Reaction: {reaction ? `${reaction}ms` : 'waiting'}</span>
        <button onClick={spawn} className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 font-bold text-foreground"><TimerReset className="h-4 w-4" /> Reset</button>
      </div>
    </section>
  );
}