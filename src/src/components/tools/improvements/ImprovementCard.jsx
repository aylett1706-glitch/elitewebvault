import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ImprovementCard({ item }) {
  const Icon = item.icon;
  const isReady = item.status === 'Live';

  return (
    <div className="rounded-2xl border border-border bg-secondary/35 p-4 transition-colors hover:border-primary/35">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-foreground">{item.title}</h3>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${isReady ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
              {isReady ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              {item.status}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
      </div>
      {item.metric && <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">{item.metric}</p>}
      {item.href && (
        <Link to={item.href} className="inline-flex min-h-11 items-center rounded-xl border border-primary/30 bg-primary/10 px-4 text-sm font-bold text-primary hover:bg-primary/20">
          {item.action || 'Open'}
        </Link>
      )}
    </div>
  );
}
