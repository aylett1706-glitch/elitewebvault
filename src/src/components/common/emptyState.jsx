import { Film } from 'lucide-react';

export default function EmptyState({ icon: Icon = Film, title, message, action }) {
  return (
    <section className="elite-panel rounded-3xl px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="mb-2 text-xl font-black text-foreground">{title}</h2>
      {message && <p className="mx-auto max-w-md text-sm text-muted-foreground">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}
