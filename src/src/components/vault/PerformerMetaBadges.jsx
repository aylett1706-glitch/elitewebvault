const COUNTRY_FLAGS = {
  australia: '🇦🇺', australian: '🇦🇺', au: '🇦🇺',
  america: '🇺🇸', american: '🇺🇸', usa: '🇺🇸', us: '🇺🇸', 'united states': '🇺🇸',
  british: '🇬🇧', england: '🇬🇧', uk: '🇬🇧', 'united kingdom': '🇬🇧',
  canadian: '🇨🇦', canada: '🇨🇦', ca: '🇨🇦',
  french: '🇫🇷', france: '🇫🇷', fr: '🇫🇷',
  german: '🇩🇪', germany: '🇩🇪', de: '🇩🇪',
  italian: '🇮🇹', italy: '🇮🇹', it: '🇮🇹',
  spanish: '🇪🇸', spain: '🇪🇸', es: '🇪🇸',
  brazilian: '🇧🇷', brazil: '🇧🇷', br: '🇧🇷',
  japanese: '🇯🇵', japan: '🇯🇵', jp: '🇯🇵'
};

export const getPerformerFlag = (performer) => {
  if (!performer) return '';
  const key = String(performer.country_code || performer.nationality || '').trim().toLowerCase();
  return COUNTRY_FLAGS[key] || '';
};

export default function PerformerMetaBadges({ performer, compact = false }) {
  if (!performer) return null;
  const flag = getPerformerFlag(performer);
  const categories = performer?.content_categories || [];
  const traits = performer?.character_traits || [];
  const tags = [...categories, ...traits].filter(Boolean).slice(0, compact ? 2 : 8);

  return (
    <div className="flex flex-wrap gap-2">
      {flag && <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs text-white/80">{flag} {performer.nationality || performer.country_code}</span>}
      {performer?.character_style && !compact && <span className="rounded-full bg-purple-500/15 border border-purple-400/20 px-3 py-1 text-xs text-purple-200">{performer.character_style}</span>}
      {performer?.bundle_name && <span className="rounded-full bg-primary/15 border border-primary/25 px-3 py-1 text-xs text-primary">Bundle: {performer.bundle_name}</span>}
      {tags.map(tag => <span key={tag} className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs text-white/70">{tag}</span>)}
    </div>
  );
}