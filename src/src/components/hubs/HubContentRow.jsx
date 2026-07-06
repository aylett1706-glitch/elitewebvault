export default function HubContentRow({ title, description, items = [], children }) {
  if (!items.length) return null;

  return (
    <section className="space-y-3" aria-label={title}>
      <div>
        <h3 className="text-xl font-black text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.map(item => children(item))}
      </div>
    </section>
  );
}
