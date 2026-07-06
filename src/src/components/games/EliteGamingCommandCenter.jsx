import { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Brain, Gamepad2, Library, Cloud, Users, Radio, Trophy, Sparkles, Puzzle, ShieldCheck, Gauge, Smartphone, Store, Wand2, Accessibility, Loader2, Mic, MonitorPlay, Play, Plus, Video, ExternalLink, Keyboard, MousePointer2 } from 'lucide-react';

const featureGroups = [
  {
    title: 'AI Gaming System',
    icon: Brain,
    accent: 'text-violet-300',
    items: ['Mood search', 'Personality matching', 'What should I play tonight?', 'Voice launch assistant', 'AI coach', 'Quest helper', 'AI moderation']
  },
  {
    title: 'Advanced Library',
    icon: Library,
    accent: 'text-primary',
    items: ['Installed', 'Cloud', 'Recently played', 'Wishlist', 'Favorites', 'Continue playing', 'Hidden games', 'Collections', 'Smart categories']
  },
  {
    title: 'Elite Launcher',
    icon: MonitorPlay,
    accent: 'text-emerald-300',
    items: ['One-click play', 'Repair tools', 'FPS boost', 'RAM cleaner', 'GPU optimizer', 'Driver checker', 'Controller auto-detect', 'Mods manager', 'Launch arguments']
  },
  {
    title: 'Cloud Play',
    icon: Cloud,
    accent: 'text-sky-300',
    items: ['Instant streaming', 'Resume anywhere', 'Mobile cloud play', 'Controller sync', 'Save syncing', 'Adaptive quality', 'Offline cache mode']
  },
  {
    title: 'Social & Parties',
    icon: Users,
    accent: 'text-pink-300',
    items: ['Profiles', 'Badges', 'Levels', 'XP', 'Friends', 'Parties', 'Voice chat', 'Screen share', 'Activity feed']
  },
  {
    title: 'Live Streaming',
    icon: Radio,
    accent: 'text-red-300',
    items: ['Go live', 'Watch friends', 'Co-stream', 'Record clips', 'Highlights', 'Viewer chat', 'Reactions', 'Overlays', 'AI moderation']
  },
  {
    title: 'Competitive Hub',
    icon: Trophy,
    accent: 'text-yellow-300',
    items: ['Ranked play', 'Elo/MMR', 'Seasons', 'Tournaments', 'Leaderboards', 'Regional rankings', 'Brackets', 'Match scheduling']
  },
  {
    title: 'Discovery Feed',
    icon: Sparkles,
    accent: 'text-orange-300',
    items: ['Trending now', 'New releases', 'Hidden gems', 'Retro classics', 'Horror', 'RPG', 'Survival', 'Co-op', 'Australian-made games', 'Clip feed']
  },
  {
    title: 'Mods & Retro',
    icon: Puzzle,
    accent: 'text-cyan-300',
    items: ['Mod hub', 'Mod packs', 'Texture packs', 'Custom maps', 'Arcade mode', 'Save states', 'ROM manager', 'Controller mapping', 'CRT shaders']
  },
  {
    title: 'Family Controls',
    icon: ShieldCheck,
    accent: 'text-green-300',
    items: ['Child profiles', 'Time limits', 'Content ratings', 'Educational games', 'Approval system', 'Family dashboard']
  },
  {
    title: 'Performance Hub',
    icon: Gauge,
    accent: 'text-blue-300',
    items: ['FPS', 'Ping', 'GPU temps', 'CPU usage', 'Session time', 'Achievement stats', 'Gaming habits', 'AI optimization']
  },
  {
    title: 'Cross Device',
    icon: Smartphone,
    accent: 'text-indigo-300',
    items: ['Remote install', 'Launch downloads', 'Join parties', 'Watch streams', 'Chat', 'Cloud sync', 'Phone controller']
  },
  {
    title: 'Marketplace',
    icon: Store,
    accent: 'text-amber-300',
    items: ['Games', 'DLC', 'Cosmetics', 'Subscriptions', 'Creator items', 'Indie uploads', 'Gifting', 'Bundles', 'Sales']
  },
  {
    title: 'Smart Worlds',
    icon: Wand2,
    accent: 'text-fuchsia-300',
    items: ['AI worlds', 'Procedural missions', 'AI events', 'AI NPCs', 'Dynamic UI', 'Virtual rooms', 'Arcade lobby', 'Cinema mode']
  },
  {
    title: 'Accessibility',
    icon: Accessibility,
    accent: 'text-lime-300',
    items: ['Dyslexia fonts', 'Colorblind modes', 'Narration', 'Adaptive controls', 'Low-signal mode', 'Family-safe filters']
  },
  {
    title: 'Input & Control Hub',
    icon: Keyboard,
    accent: 'text-cyan-300',
    items: ['Universal devices', 'Deep remapping', 'Macros', 'Game profiles', 'KB/M tuning', 'Input overlays', 'AI input assistant', 'Touch controls', 'Gyro controls', 'Haptics', 'RGB sync', 'Training drills']
  }
];

const quickMoods = ['Relaxing', 'Competitive', 'Story-focused', 'Family-friendly', 'Co-op night', 'Retro classics'];

const realActions = {
  'Mood search': 'ai',
  'Personality matching': 'ai',
  'What should I play tonight?': 'ai',
  'AI coach': 'ai',
  'Quest helper': 'ai',
  'AI moderation': 'ai',
  Favorites: 'library',
  'Continue playing': 'library',
  Collections: 'library',
  'Smart categories': 'library',
  Installed: 'library',
  Cloud: 'cloud',
  Wishlist: 'wishlist',
  'One-click play': 'play',
  'Controller auto-detect': 'browser',
  'Instant streaming': 'cloud',
  'Resume anywhere': 'library',
  'Save syncing': 'library',
  Profiles: 'social',
  Badges: 'social',
  Levels: 'social',
  XP: 'social',
  'Activity feed': 'social',
  Tournaments: 'competitive',
  'Trending now': 'explore',
  'Hidden gems': 'explore',
  'Retro classics': 'explore',
  Horror: 'search',
  RPG: 'search',
  Survival: 'search',
  'Co-op': 'search',
  'Australian-made games': 'search',
  'Clip feed': 'clips',
  'Arcade mode': 'explore',
  'Save states': 'library',
  'Controller mapping': 'browser',
  'Content ratings': 'family',
  'Educational games': 'family',
  'FPS': 'performance',
  'Session time': 'performance',
  'Achievement stats': 'social',
  'Gaming habits': 'performance',
  'AI optimization': 'ai',
  'Cloud sync': 'library',
  Games: 'marketplace',
  'Indie uploads': 'add',
  'AI worlds': 'ai',
  'Dynamic UI': 'explore',
  'Arcade lobby': 'explore',
  'Cinema mode': 'clips',
  Narration: 'accessibility',
  'Low-signal mode': 'accessibility',
  'Family-safe filters': 'family',
  'Universal devices': 'input',
  'Deep remapping': 'input',
  'Macros': 'input',
  'Game profiles': 'input',
  'KB/M tuning': 'input',
  'Input overlays': 'input',
  'AI input assistant': 'input',
  'Touch controls': 'input',
  'Gyro controls': 'input',
  'Haptics': 'input',
  'RGB sync': 'input',
  'Training drills': 'input'
};

export default function EliteGamingCommandCenter({ games = [], user, saves = [], clips = [], achievements = [], tournaments = [], activities = [], favorites = [], onAddGames, onSearch }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPick, setAiPick] = useState(null);

  const stats = useMemo(() => {
    const playable = games.filter(game => game.play_url).length;
    const cloud = games.filter(game => game.source_type === 'cloud_link').length;
    const retro = games.filter(game => game.source_type === 'emulator').length;
    const genres = new Set(games.flatMap(game => game.genres || []));
    return [
      { label: 'Playable now', value: playable },
      { label: 'Cloud sources', value: cloud },
      { label: 'Retro/emulator', value: retro },
      { label: 'Smart genres', value: genres.size },
      { label: 'Cloud saves', value: saves.length },
      { label: 'Favorites', value: favorites.length },
      { label: 'Clips', value: clips.length },
      { label: 'Tournaments', value: tournaments.length }
    ];
  }, [games, saves.length, favorites.length, clips.length, tournaments.length]);

  const askAi = async (mood = 'what should I play tonight') => {
    setAiLoading(true);
    const catalogue = games.slice(0, 80).map(game => ({ title: game.title, genres: game.genres, platforms: game.platforms, source_type: game.source_type, description: game.description }));
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Recommend one game for ${user?.full_name || 'this player'} based on this request: "${mood}". Use this game library only: ${JSON.stringify(catalogue)}. Return a concise recommendation with reason and mood fit.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          reason: { type: 'string' },
          mood_fit: { type: 'string' }
        }
      }
    });
    setAiPick(response);
    setAiLoading(false);
  };

  const playableGame = games.find(game => game.play_url);

  const runAction = (item) => {
    const action = realActions[item];
    if (action === 'ai') return askAi(item);
    if (action === 'add') return onAddGames?.();
    if (action === 'search') return onSearch?.(item);
    if (action === 'input') return window.location.assign('/input-hub');
    const target = {
      library: 'library', cloud: 'library', wishlist: 'library', social: 'social', competitive: 'competitive', explore: 'explore', clips: 'social', family: 'family', performance: 'performance', marketplace: 'marketplace', accessibility: 'accessibility', browser: 'performance'
    }[action];
    if (target) document.getElementById(`elite-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="mb-10 space-y-6">
      <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Elite Gaming OS
            </div>
            <h2 className="font-bebas text-4xl tracking-wider text-foreground md:text-5xl">Steam + Xbox + PlayStation + Discord + Twitch</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">A unified gaming command center for AI discovery, library management, cloud play, social, streaming, esports, achievements, mods, retro, family controls, performance, marketplace, and accessibility.</p>
          </div>
          <button onClick={() => askAi()} disabled={aiLoading || games.length === 0} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-black text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            What should I play tonight?
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {playableGame && (
            <Link to={`/games/${playableGame.id}/play`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground hover:bg-primary/90">
              <Play className="h-4 w-4" /> One-click play
            </Link>
          )}
          <button onClick={onAddGames} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 text-sm font-black text-primary hover:bg-primary/20">
            <Plus className="h-4 w-4" /> Add / repair library
          </button>
          <button onClick={() => document.getElementById('elite-social')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-secondary px-4 text-sm font-black text-muted-foreground hover:text-foreground">
            <Users className="h-4 w-4" /> Social feed
          </button>
          <button onClick={() => document.getElementById('elite-competitive')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-secondary px-4 text-sm font-black text-muted-foreground hover:text-foreground">
            <Trophy className="h-4 w-4" /> Competitive hub
          </button>
          <Link to="/input-hub" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 text-sm font-black text-primary hover:bg-primary/20">
            <Keyboard className="h-4 w-4" /> Input hub
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {quickMoods.map(mood => (
            <button key={mood} onClick={() => askAi(mood)} disabled={aiLoading || games.length === 0} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-secondary px-4 text-xs font-bold text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-50">
              <Mic className="h-3.5 w-3.5" /> {mood}
            </button>
          ))}
        </div>

        {aiPick && (
          <div className="mt-5 rounded-2xl border border-primary/25 bg-primary/10 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">AI Recommendation</p>
            <h3 className="mt-1 text-xl font-black text-foreground">{aiPick.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{aiPick.reason}</p>
            <p className="mt-2 text-xs font-bold text-primary">Mood fit: {aiPick.mood_fit}</p>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featureGroups.map(group => {
          const Icon = group.icon;
          return (
            <article key={group.title} className="rounded-3xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                  <Icon className={`h-5 w-5 ${group.accent}`} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">{group.title}</h3>
                  <p className="text-xs text-muted-foreground">Elite module</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map(item => {
                  const connected = Boolean(realActions[item]);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => connected && runAction(item)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${connected ? 'border-primary/25 bg-primary/10 text-primary hover:bg-primary/20' : 'border-white/10 bg-secondary text-muted-foreground'}`}
                      title={connected ? 'Connected pathway' : 'Browser/device or external service limited'}
                    >
                      {item}{connected ? ' ✓' : ''}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div id="elite-library" className="rounded-3xl border border-border bg-card p-5">
          <Library className="mb-3 h-6 w-6 text-primary" />
          <p className="text-sm font-bold text-foreground">Home: Continue playing, trending, favorites, AI recommendations</p>
          <p className="mt-2 text-xs text-muted-foreground">Linked to {saves.length} saves, {favorites.length} favorites, and {games.filter(game => game.play_url).length} playable games.</p>
        </div>
        <div id="elite-explore" className="rounded-3xl border border-border bg-card p-5">
          <Sparkles className="mb-3 h-6 w-6 text-primary" />
          <p className="text-sm font-bold text-foreground">Explore: categories, AI search, top charts, discovery feed</p>
          <button onClick={() => onSearch?.('trending')} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground">Open trending <ExternalLink className="h-3 w-3" /></button>
        </div>
        <div id="elite-social" className="rounded-3xl border border-border bg-card p-5">
          <Users className="mb-3 h-6 w-6 text-primary" />
          <p className="text-sm font-bold text-foreground">Social: profiles, badges, XP, clips, activity feed</p>
          <p className="mt-2 text-xs text-muted-foreground">{achievements.length} achievements, {clips.length} clips, {activities.length} feed events connected.</p>
        </div>
        <div id="elite-competitive" className="rounded-3xl border border-border bg-card p-5">
          <Trophy className="mb-3 h-6 w-6 text-primary" />
          <p className="text-sm font-bold text-foreground">Competitive Hub: tournaments, brackets, rankings, scheduling</p>
          <p className="mt-2 text-xs text-muted-foreground">{tournaments.length} upcoming tournaments linked.</p>
        </div>
        <div id="elite-performance" className="rounded-3xl border border-border bg-card p-5">
          <Gauge className="mb-3 h-6 w-6 text-primary" />
          <p className="text-sm font-bold text-foreground">Performance Hub: session stats, controller detection, browser-supported checks</p>
          <p className="mt-2 text-xs text-muted-foreground">Hardware repair, RAM/GPU/driver tools are limited by browser security, so this links to in-app playable/session data.</p>
        </div>
        <div id="elite-family" className="rounded-3xl border border-border bg-card p-5">
          <ShieldCheck className="mb-3 h-6 w-6 text-primary" />
          <p className="text-sm font-bold text-foreground">Family Controls: ratings, educational games, safe filters</p>
          <p className="mt-2 text-xs text-muted-foreground">Uses game age ratings, tags, and library categories.</p>
        </div>
        <div id="elite-marketplace" className="rounded-3xl border border-border bg-card p-5">
          <Store className="mb-3 h-6 w-6 text-primary" />
          <p className="text-sm font-bold text-foreground">Marketplace: games, indie uploads, store links, bundles</p>
          <button onClick={onAddGames} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground">Add games <Plus className="h-3 w-3" /></button>
        </div>
        <div id="elite-accessibility" className="rounded-3xl border border-border bg-card p-5">
          <Accessibility className="mb-3 h-6 w-6 text-primary" />
          <p className="text-sm font-bold text-foreground">Accessibility: low-signal mode, narration-ready labels, family-safe filters</p>
          <p className="mt-2 text-xs text-muted-foreground">Connected through responsive UI, keyboard focus styles, and safe category filters.</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5">
          <Video className="mb-3 h-6 w-6 text-primary" />
          <p className="text-sm font-bold text-foreground">Live Streaming & Clips: highlights, clip feed, overlays</p>
          <p className="mt-2 text-xs text-muted-foreground">{clips.length} clips connected. Screen share and voice chat require external browser permissions/services.</p>
        </div>
      </div>
    </section>
  );
}
