import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronDown, Sparkles, Loader2, Check, Link2, X, Play, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function TVEpisodeManager({ media, onSave }) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [aiLoading, setAiLoading] = useState(false);
  const [sources, setSources] = useState([]);
  const [episodeInfo, setEpisodeInfo] = useState(null);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [customUrl, setCustomUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  const totalSeasons = media.seasons || 1;

  // Get current saved URL for this episode
  const currentEpisodeData = media.episodes?.find(
    e => e.season === selectedSeason && e.episode === selectedEpisode
  );

  const handleAISearch = async () => {
    if (!media.tmdb_id && !media.imdb_id) {
      toast.error('This show has no TMDB/IMDB ID. Add it first via the admin panel.');
      return;
    }
    setAiLoading(true);
    setSources([]);
    setEpisodeInfo(null);
    setSelectedSource(null);

    const res = await base44.functions.invoke('getTVEpisodeSources', {
      tmdb_id: media.tmdb_id,
      imdb_id: media.imdb_id,
      season: selectedSeason,
      episode: selectedEpisode,
    });

    const data = res.data;
    setSources(data.sources || []);
    setEpisodeInfo(data.episode_info);
    setSeasonEpisodes(data.season_episodes || []);

    if (data.recommended_source) {
      setSelectedSource(data.recommended_source);
      setCustomUrl(data.recommended_source.url);
      toast.success(`Found ${data.sources.length} sources — best pick pre-selected`);
    } else {
      toast.error('No sources found for this episode');
    }
    setAiLoading(false);
  };

  const handleSave = async () => {
    const urlToSave = customUrl.trim();
    if (!urlToSave) { toast.error('Enter or select a source URL'); return; }
    setSaving(true);

    // Merge into episodes array
    const existingEpisodes = [...(media.episodes || [])];
    const idx = existingEpisodes.findIndex(
      e => e.season === selectedSeason && e.episode === selectedEpisode
    );

    const epEntry = {
      season: selectedSeason,
      episode: selectedEpisode,
      title: episodeInfo?.title || currentEpisodeData?.title || `Episode ${selectedEpisode}`,
      video_url: urlToSave,
      duration_minutes: episodeInfo?.runtime || currentEpisodeData?.duration_minutes || null,
    };

    if (idx >= 0) {
      existingEpisodes[idx] = epEntry;
    } else {
      existingEpisodes.push(epEntry);
    }

    await base44.entities.Media.update(media.id, { episodes: existingEpisodes });
    toast.success(`S${selectedSeason}E${selectedEpisode} source saved!`);
    setSaving(false);
    if (onSave) onSave(existingEpisodes);
  };

  const handleSeasonChange = (s) => {
    setSelectedSeason(s);
    setSelectedEpisode(1);
    setSources([]);
    setEpisodeInfo(null);
    setCustomUrl('');
    setSelectedSource(null);
  };

  // Get episode count for selected season from fetched season data or existing episodes
  const episodesInSeason = seasonEpisodes.length > 0
    ? seasonEpisodes.map(e => e.episode)
    : (media.episodes?.filter(e => e.season === selectedSeason).map(e => e.episode) || []);
  const maxEpisode = Math.max(...episodesInSeason, selectedEpisode, 20);

  const tierLabel = (tier) => {
    if (tier === 1) return { label: 'Low Ads', color: 'text-green-400 bg-green-400/10' };
    if (tier === 2) return { label: 'Some Ads', color: 'text-yellow-400 bg-yellow-400/10' };
    return { label: 'More Ads', color: 'text-orange-400 bg-orange-400/10' };
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Play className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">Episode Source Manager</h3>
      </div>

      {/* Season / Episode pickers */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground font-medium">Season</label>
          <div className="relative">
            <select
              value={selectedSeason}
              onChange={e => handleSeasonChange(Number(e.target.value))}
              className="appearance-none bg-secondary border border-border rounded-xl px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:border-primary/60 cursor-pointer"
            >
              {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(s => (
                <option key={s} value={s}>Season {s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground font-medium">Episode</label>
          <div className="relative">
            <select
              value={selectedEpisode}
              onChange={e => { setSelectedEpisode(Number(e.target.value)); setSources([]); setEpisodeInfo(null); setCustomUrl(''); setSelectedSource(null); }}
              className="appearance-none bg-secondary border border-border rounded-xl px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:border-primary/60 cursor-pointer"
            >
              {Array.from({ length: maxEpisode }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>Episode {n}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <button
          onClick={handleAISearch}
          disabled={aiLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 text-primary rounded-xl text-sm font-medium hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          AI Find Sources
        </button>
      </div>

      {/* Current saved URL indicator */}
      {currentEpisodeData?.video_url && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400">
          <Check className="w-3.5 h-3.5" />
          <span>S{selectedSeason}E{selectedEpisode} has a saved source</span>
          <button onClick={() => setCustomUrl(currentEpisodeData.video_url)} className="ml-auto underline hover:no-underline">Load it</button>
        </div>
      )}

      {/* Episode info from TMDB */}
      {episodeInfo && (
        <div className="flex gap-3 p-3 bg-secondary/50 border border-border rounded-xl">
          {episodeInfo.still_url && (
            <img src={episodeInfo.still_url} alt={episodeInfo.title} className="w-24 h-14 rounded-lg object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm">{episodeInfo.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{episodeInfo.air_date}{episodeInfo.runtime ? ` · ${episodeInfo.runtime}min` : ''}</p>
            {episodeInfo.synopsis && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{episodeInfo.synopsis}</p>
            )}
          </div>
        </div>
      )}

      {/* AI-ranked sources */}
      {sources.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            AI-ranked sources (Tier 1 = fewest ads)
          </p>
          {sources.map((src, i) => {
            const t = tierLabel(src.tier);
            const isSelected = selectedSource?.name === src.name;
            return (
              <button
                key={i}
                onClick={() => { setSelectedSource(src); setCustomUrl(src.url); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all text-sm ${
                  isSelected
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-border bg-secondary/40 hover:border-primary/30'
                }`}
              >
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-current">
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <span className="font-medium text-foreground flex-1">{src.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.color}`}>{t.label}</span>
                {i === 0 && <span className="text-xs text-primary font-bold">⭐ Best</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Custom URL input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5" />
          Source URL {selectedSource ? `(${selectedSource.name})` : ''}
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={e => { setCustomUrl(e.target.value); setSelectedSource(null); }}
            placeholder="Paste embed or direct video URL..."
            className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
          />
          {customUrl && (
            <button onClick={() => { setCustomUrl(''); setSelectedSource(null); }} className="p-2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!customUrl.trim() || saving}
        className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {saving ? 'Saving...' : `Save S${selectedSeason}E${selectedEpisode} Source`}
      </button>
    </div>
  );
}
