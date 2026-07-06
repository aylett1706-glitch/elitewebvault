import { Download, Star, Upload } from 'lucide-react';

const packs = [
  { name: 'Cyberpunk Rain', type: 'Community', rating: '4.9', accent: 'from-cyan-500/25 to-fuchsia-500/20' },
  { name: 'Horror Fog', type: 'Official', rating: '4.8', accent: 'from-red-500/25 to-black/30' },
  { name: 'Anime Dream Loop', type: 'AI Generated', rating: '4.7', accent: 'from-pink-500/25 to-blue-500/20' }
];

export default function WallpaperMarketplacePreview() {
  return (
    <section className="rounded-3xl border border-primary/20 bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary">Wallpaper Marketplace</p>
          <h2 className="text-xl font-black text-foreground">Community Worlds</h2>
        </div>
        <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-black text-muted-foreground hover:text-foreground">
          <Upload className="h-4 w-4" /> Upload
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {packs.map(pack => (
          <article key={pack.name} className={`rounded-2xl border border-border bg-gradient-to-br ${pack.accent} p-4`}>
            <div className="mb-8 h-20 rounded-xl border border-white/10 bg-black/25 shadow-inner" />
            <h3 className="font-black text-foreground">{pack.name}</h3>
            <p className="text-xs text-muted-foreground">{pack.type}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs font-black text-primary"><Star className="h-3 w-3 fill-primary" /> {pack.rating}</span>
              <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground"><Download className="h-3 w-3" /> Use</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}