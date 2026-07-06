export default function HubCategoryChips({ categories = [], active, onChange }) {
  if (!categories.length) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" role="tablist" aria-label="Hub subcategories">
      {categories.map(category => (
        <button
          key={category.value}
          type="button"
          onClick={() => onChange?.(category.value)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition-colors ${
            active === category.value
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-secondary text-muted-foreground hover:border-primary/40 hover:text-foreground'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
