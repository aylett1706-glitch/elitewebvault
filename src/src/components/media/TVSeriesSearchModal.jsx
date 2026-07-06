import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Search, Loader2, Play, ChevronDown, Sparkles, Check, Film, Star, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function TVSeriesSearchModal({ media, onClose, onEpisodeSaved }) {
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [episodeInfo, setEpisodeInfo] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [searched, setSearched] = useState(false);

  const totalSeasons = media.seasons || 1;

  // Auto-search when season/episode changes if we already have TMDB id
  const doSearch = useCallback(async (season, episode) => {
    if (!media.tmdb_id && !media.imdb_id) return;
    setLoading(true);
    setSources([]);
    setEpisodeInfo(null);
    setSelectedSource(null);
    const res = await base44.functions.invoke('getTVEpisodeSources', {
      tmdb_id: media.tmdb_id,
      imdb_id: media.imdb_id,
      season,
      episode,
    });
    const data = res.data;
    setSources(data.sources || []);
    setEpisodeInfo(data.episode_info);
    setSeasonEpisodes(data.season_episodes || []);
    setSearched(true);
    if (data.recommended_source) setSelectedSource(data.recommended_source);
    setLoading(false);
  }, [media.tmdb_id, media.imdb_id]);

  // Auto-search on mount
  useEffect(() => {
    doSearch(1, 1);
  }, [doSearch]);

  const handleSearch = () => {
    if (!media.tmdb_id && !media.imdb_id) {
      toast.error('This show has no TMDB ID — add it via the Admin panel first.');
      return;
    }
    doSearch(selectedSeason, selectedEpisode);
  };

  const handleSeasonChange = (s) => {
    setSelectedSeason(s);
    setSelectedEpisode(1);
    setSources([]);
    setEpisodeInfo(null);
    setSelectedSource(null);
    setSearched(false);
    setSeasonEpisodes([]);
    doSearch(s, 1);
  };

  const handleEpisodeChange = (e) => {
    setSelectedEpisode(e);
    setSources([]);
    setEpisodeInfo(null);
    setSelectedSource(null);
    setSearched(false);
    doSearch(selectedSeason, e);
  };

  // Save best source URL and go watch
  const handleWatchNow = async () => {
    if (!selectedSource) return;
    setSaving(true);

    // Save the source URL to the episode record
    const existingEpisodes = [...(media.episodes || [])];
    const idx = existingEpisodes.findIndex(
      e => e.season === selectedSeason && e.episode === selectedEpisode
    );
    const epEntry = {
      season: selectedSeason,
      episode: selectedEpisode,
      title: episodeInfo?.title || `Episode ${selectedEpisode}`,
      video_url: selectedSource.url,
      duration_minutes: episodeInfo?.runtime || null,
    };
    if (idx >= 0) {
      existingEpisodes[idx] = epEntry;
    } else {
      existingEpisodes.push(epEntry);
    }
    await base44.entities.Media.update(media.id, { episodes: existingEpisodes });
    if (onEpisodeSaved) onEpisodeSaved(existingEpisodes);
    setSaving(false);

    navigate(`/watch/${media.id}?season=${selectedSeason}&episode=${selectedEpisode}`);
    onClose();
  };

  const episodesInSeason = seasonEpisodes.length > 0
    ? seasonEpisodes
    : Array.from({ length: 20 }, (_, i) => ({ episode: i + 1, title: `Episode ${i + 1}` }));

  const tierLabel = (tier) => {
    if (tier === 1) return { label: 'Clean', color: 'text-green-400 bg-green-400/10 border-green-400/20' };
    if (tier === 2) return { label: 'Some Ads', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
    return { label: 'More Ads', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' };
  };

  const currentSavedEp = media.episodes?.find(
    e => e.season === selectedSeason && e.episode === selectedEpisode
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">{media.title}</h2>
              <p className="text-xs text-muted-foreground">Find & Watch any episode</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Season / Episode pickers + Search */}
        <div className="p-5 border-b border-border shrink-0 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Season */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Season</span>
              <div className="relative">
                <select value={selectedSeason} onChange={e => handleSeasonChange(Number(e.target.value))}
                  className="appearance-none bg-secondary border border-border rounded-xl px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:border-primary/60 cursor-pointer">
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(s => (
                    <option key={s} value={s}>Season {s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Episode */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Episode</span>
              <div className="relative">
                <select value={selectedEpisode} onChange={e => handleEpisodeChange(Number(e.target.value))}
                  className="appearance-none bg-secondary border border-border rounded-xl px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:border-primary/60 cursor-pointer">
                  {episodesInSeason.map(ep => (
                    <option key={ep.episode} value={ep.episode}>
                      Ep {ep.episode}{ep.title && ep.title !== `Episode ${ep.episode}` ? ` — ${ep.title}` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <button onClick={handleSearch} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 text-primary rounded-xl text-sm font-medium hover:bg-primary/30 transition-colors disabled:opacity-50 ml-auto">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? 'Searching...' : 'Find Sources'}
            </button>
          </div>

          {/* Already saved indicator */}
          {currentSavedEp?.video_url && !searched && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>S{selectedSeason}E{selectedEpisode} already has a saved source. You can watch it directly or find new sources.</span>
            </div>
          )}
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Searching for S{selectedSeason}E{selectedEpisode}...</p>
            </div>
          )}

          {!loading && !searched && (
            <div className="text-center py-8 text-muted-foreground">
              <Film className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Select a season and episode, then click "Find Sources"</p>
            </div>
          )}

          {/* Episode info card */}
          {!loading && episodeInfo && (
            <div className="flex gap-3 p-3 bg-secondary/50 border border-border rounded-xl">
              {episodeInfo.still_url && (
                <img src={episodeInfo.still_url} alt={episodeInfo.title}
                  className="w-28 h-16 rounded-lg object-cover shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm">{episodeInfo.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  S{selectedSeason}E{selectedEpisode}
                  {episodeInfo.air_date ? ` · ${episodeInfo.air_date}` : ''}
                  {episodeInfo.runtime ? ` · ${episodeInfo.runtime}min` : ''}
                </p>
                {episodeInfo.synopsis && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{episodeInfo.synopsis}</p>
                )}
              </div>
            </div>
          )}

          {/* Source picker */}
          {!loading && sources.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Select a source to watch (Tier 1 = fewest ads)
              </p>
              {sources.map((src, i) => {
                const t = tierLabel(src.tier);
                const isSelected = selectedSource?.name === src.name;
                return (
                  <button key={i} onClick={() => setSelectedSource(src)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all text-sm ${
                      isSelected ? 'border-primary/60 bg-primary/10' : 'border-border bg-secondary/40 hover:border-primary/30'
                    }`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-primary' : 'border-muted-foreground'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className="font-medium text-foreground flex-1">{src.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${t.color}`}>{t.label}</span>
                    {i === 0 && <span className="text-xs text-primary font-bold">⭐ Best</span>}
                  </button>
                );
              })}
            </div>
          )}

          {!loading && searched && sources.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No sources found for this episode. Try a different source or add TMDB ID in Admin.</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-border shrink-0 flex gap-3">
          {/* Direct watch if already saved */}
          {currentSavedEp?.video_url && !selectedSource && (
            <button
              onClick={() => {
                navigate(`/watch/${media.id}?season=${selectedSeason}&episode=${selectedEpisode}`);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-secondary border border-border text-foreground py-3 rounded-xl font-semibold text-sm hover:bg-secondary/70 transition-colors">
              <Play className="w-4 h-4 fill-current" />
              Watch Saved Source
            </button>
          )}

          <button onClick={handleWatchNow} disabled={!selectedSource || saving}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-40">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {saving ? 'Loading...' : selectedSource ? `Watch on ${selectedSource.name}` : 'Find Sources First'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}