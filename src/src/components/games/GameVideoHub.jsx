import { useEffect, useState } from 'react';
import { supabaseApi, base44 } from '@/api/supabaseApi';
import { Clapperboard, Loader2, Search, Sparkles } from 'lucide-react';
import HubCategoryChips from '@/components/hubs/HubCategoryChips';
import HubContentRow from '@/components/hubs/HubContentRow';
import EmbeddedGameVideoCard from './EmbeddedGameVideoCard';
import GameWikiWalkthroughCard from './GameWikiWalkthroughCard';

const VIDEO_TABS = [
  { label: 'All Videos', value: 'all' },
  { label: 'Trailers', value: 'trailers' },
  { label: 'Walkthrough Wiki', value: 'walkthroughs' }
];

export default function GameVideoHub() {
  const [trailers, setTrailers] = useState([]);
  const [walkthroughs, setWalkthroughs] = useState([]);
  const [query, setQuery] = useState('');
  const [trailersLoading, setTrailersLoading] = useState(true);
  const [walkthroughLoading, setWalkthroughLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const loadTrailers = async () => {
      setTrailersLoading(true);
      const res = await base44.functions.invoke('gameVideoSearch', { mode: 'trailers', limit: 12 });
      setTrailers(res.data?.results || []);
      setTrailersLoading(false);
    };
    loadTrailers();
  }, []);

  const searchWalkthroughs = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setWalkthroughLoading(true);
    const res = await base44.functions.invoke('gameVideoSearch', { mode: 'walkthrough', query: query.trim(), limit: 12 });
    setWalkthroughs(res.data?.results || []);
    setWalkthroughLoading(false);
  };

  return (
    <section className="mb-10 space-y-6" aria-labelledby="game-video-hub-title">
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              <Clapperboard className="h-3.5 w-3.5" /> AI Video Discovery
            </div>
            <h2 id="game-video-hub-title" className="font-bebas text-4xl tracking-wider text-foreground md:text-5xl">Upcoming Trailers & Walkthrough Hub</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">Auto-finds upcoming game trailers and lets you search complete modern walkthroughs for any game.</p>
          </div>
          <form onSubmit={searchWalkthroughs} className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-xl">
            <label htmlFor="walkthrough-search" className="sr-only">Search a game walkthrough</label>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input id="walkthrough-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search any game walkthrough…" className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
            </div>
            <button disabled={walkthroughLoading || !query.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground disabled:opacity-50">
              {walkthroughLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Find Walkthroughs
            </button>
          </form>
        </div>
      </div>

      <HubCategoryChips categories={VIDEO_TABS} active={activeTab} onChange={setActiveTab} />

      {(activeTab === 'all' || activeTab === 'trailers') && (
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-xl font-black text-foreground">Upcoming Game Trailers</h3>
            {trailersLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trailers.map(video => <EmbeddedGameVideoCard key={video.id} video={video} />)}
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'walkthroughs') && walkthroughs.length > 0 && (
        <div className="space-y-5">
          <h3 className="text-xl font-black text-foreground">Complete Walkthrough Wiki</h3>
          <div className="grid gap-5 lg:grid-cols-2">
            {walkthroughs.slice(0, 4).map(video => <GameWikiWalkthroughCard key={video.id} video={video} />)}
          </div>
          <HubContentRow title="More walkthrough videos" description="Extra video guides you can play inside EliteVault." items={walkthroughs.slice(4)}>
            {(video) => <EmbeddedGameVideoCard key={video.id} video={video} compact />}
          </HubContentRow>
        </div>
      )}
    </section>
  );
}