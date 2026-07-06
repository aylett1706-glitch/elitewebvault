import { RotateCcw, Play } from 'lucide-react';

const formatTime = (seconds = 0) => {
  const total = Math.floor(seconds || 0);
  const mins = Math.floor(total / 60);
  const secs = String(total % 60).padStart(2, '0');
  return `${mins}:${secs}`;
};

export default function ResumePrompt({ progressSeconds, onResume, onRestart }) {
  if (!progressSeconds || progressSeconds < 30) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <div className="pointer-events-auto rounded-3xl border border-primary/20 bg-background/90 p-4 shadow-2xl backdrop-blur-xl">
        <p className="mb-3 text-sm font-bold text-foreground">Resume from {formatTime(progressSeconds)}?</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onRestart} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3.5 w-3.5" /> Start over
          </button>
          <button type="button" onClick={onResume} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90">
            <Play className="h-3.5 w-3.5 fill-current" /> Resume
          </button>
        </div>
      </div>
    </div>
  );
}