import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Accessibility,
  Activity,
  Baby,
  BarChart3,
  BookOpen,
  Copy,
  Database,
  Download,
  Film,
  Folder,
  Gamepad2,
  Globe2,
  Heart,
  Library,
  Link as LinkIcon,
  Lock,
  Mic,
  Palette,
  PlayCircle,
  Radio,
  Search,
  Share2,
  ShieldAlert,
  Smartphone,
  Sparkles,
  UploadCloud,
  UserRound,
  Users,
  Wand2,
  Wrench
} from 'lucide-react';
import { filterMainAppSafeMedia, isAdultRated, normalizeRating } from '@/lib/content-safety';
import ImprovementCard from './ImprovementCard';

const ratingFolderRatings = new Set(['R', 'X', 'XXX', 'NC-17', '18+', 'R18+', 'X18+']);

const buildDuplicateGroups = (items) => {
  const groups = items.reduce((acc, item) => {
    const key = String(item.title || '').trim().toLowerCase();
    if (!key) return acc;
    acc[key] = [...(acc[key] || []), item];
    return acc;
  }, {});
  return Object.values(groups).filter(group => group.length > 1);
};

export default function ImprovementCommandCenter() {
  const [media, setMedia] = useState([]);
  const [games, setGames] = useState([]);
  const [books, setBooks] = useState([]);
  const [liveChannels, setLiveChannels] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);

  useEffect(() => {
    const load = async () => {
      const mediaData = await base44.entities.Media.filter({ status: 'approved' }, '-created_date', 300).catch(() => []);
      setMedia(mediaData || []);
      const gameData = await base44.entities.Game.filter({ status: 'approved' }, '-created_date', 120).catch(() => []);
      setGames(gameData || []);
      const bookData = await base44.entities.Book.filter({ status: 'approved' }, '-created_date', 120).catch(() => []);
      setBooks(bookData || []);
      const liveData = await base44.entities.LiveChannel.filter({ status: 'approved' }, '-created_date', 120).catch(() => []);
      setLiveChannels(liveData || []);
      const historyData = await base44.entities.WatchHistory.list('-last_watched', 120).catch(() => []);
      setWatchHistory(historyData || []);
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const adultItems = media.filter(isAdultRated);
    const safeItems = filterMainAppSafeMedia(media);
    const ratingFolder = adultItems.filter(item => ratingFolderRatings.has(normalizeRating(item.content_rating)) || /\bsnuff\b/i.test(`${item.title || ''} ${item.synopsis || ''} ${item.content_notes || ''}`));
    const duplicateGroups = buildDuplicateGroups(media);
    const missingPosters = media.filter(item => !item.poster_url);
    const missingVideos = media.filter(item => !item.video_url && item.type === 'movie');
    const missingSubtitles = media.filter(item => item.video_url && !item.subtitle_url && !item.subtitles?.length);
    const collections = Object.values(media.reduce((acc, item) => {
      const key = item.collection_key || item.collection_name;
      if (!key) return acc;
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {})).filter(group => group.length > 1);

    return {
      adultItems,
      safeItems,
      ratingFolder,
      duplicateGroups,
      missingPosters,
      missingVideos,
      missingSubtitles,
      collections,
      continueWatching: watchHistory.filter(item => !item.completed),
      totalLibrary: media.length,
      playableSafe: safeItems.filter(item => item.video_url).length,
      games: games.length,
      books: books.length,
      liveChannels: liveChannels.length
    };
  }, [media, games, books, liveChannels, watchHistory]);

  const sections = [
    {
      title: 'Vault, safety and access',
      items: [
        { title: 'Vault folders', description: 'Dedicated folders for adult/private content, including R & X rated titles.', status: 'Live', metric: `${stats.adultItems.length} vault item${stats.adultItems.length === 1 ? '' : 's'}`, href: '/vault', action: 'Open Vault', icon: Folder },
        { title: 'Vault counters', description: 'Live counts for hidden and rating-based Vault groups.', status: 'Live', metric: `${stats.ratingFolder.length} R/X/snuff flagged`, href: '/vault', action: 'View folder', icon: BarChart3 },
        { title: 'Vault audit tool', description: 'Scans the library for titles that should be hidden from the main app.', status: 'Live', metric: `${stats.adultItems.length} hidden from main`, href: '/tools', action: 'Review here', icon: ShieldAlert },
        { title: 'Bulk Vault actions', description: 'Admin pathway for quickly reviewing and marking multiple titles private.', status: 'Ready to use', metric: 'Use Admin library controls', href: '/admin', action: 'Open Admin', icon: Lock },
        { title: 'Main app safety banner', description: 'Confirms mature titles are separated from normal browsing.', status: 'Live', metric: `${stats.safeItems.length} main-app safe titles`, href: '/', action: 'View Home', icon: ShieldAlert },
        { title: 'Kids mode lock', description: 'Keeps kids browsing separate from mature and adult content.', status: 'Live', href: '/kids', action: 'Open Kids', icon: Baby },
        { title: 'Search cleanup', description: 'Normal Search hides adult, R, X, snuff and private titles.', status: 'Live', href: '/search', action: 'Open Search', icon: Search },
        { title: 'Security hardening', description: 'Direct adult title access redirects to Vault unless unlocked.', status: 'Live', metric: 'Vault unlock required', href: '/vault', action: 'Test Vault', icon: Lock }
      ]
    },
    {
      title: 'Discovery, search and library quality',
      items: [
        { title: 'Better search filters', description: 'Search supports moods, director, platform, year and genre filters.', status: 'Live', href: '/search', action: 'Use Search', icon: Search },
        { title: 'Duplicate detector', description: 'Finds repeated movie or TV titles that may need merging.', status: 'Live', metric: `${stats.duplicateGroups.length} duplicate group${stats.duplicateGroups.length === 1 ? '' : 's'}`, href: '/tools', action: 'Review count', icon: Copy },
        { title: 'Missing media alerts', description: 'Flags missing posters, video sources and subtitles.', status: 'Live', metric: `${stats.missingPosters.length} posters · ${stats.missingVideos.length} videos · ${stats.missingSubtitles.length} subtitles`, href: '/tools', action: 'View health', icon: Activity },
        { title: 'Home speed improvements', description: 'Home uses session caching and safer filtered rows for faster loading.', status: 'Live', href: '/', action: 'Open Home', icon: Sparkles },
        { title: 'Watchlist and favourites', description: 'Personal list entry point is available from navigation.', status: 'Live', href: '/my-list', action: 'Open My List', icon: Heart },
        { title: 'Continue Watching cleanup', description: 'Resume data is tracked so users can keep watching from where they left off.', status: 'Live', metric: `${stats.continueWatching.length} active resume item${stats.continueWatching.length === 1 ? '' : 's'}`, href: '/', action: 'View row', icon: PlayCircle },
        { title: 'Better recommendations', description: 'Recommendations use watch history, ratings, genres and game activity.', status: 'Live', href: '/', action: 'View recommendations', icon: Wand2 },
        { title: 'Data quality rules', description: 'Ratings, adult checks, genres and collections are normalised for safer browsing.', status: 'Live', metric: `${stats.totalLibrary} titles scanned`, href: '/tools', action: 'View scan', icon: Database }
      ]
    },
    {
      title: 'Content hubs and viewing',
      items: [
        { title: 'Actor pages upgrade', description: 'Actor hub and profiles organise cast-based discovery.', status: 'Live', href: '/actors', action: 'Open Actors', icon: UserRound },
        { title: 'Collection pages', description: 'Collection folders group franchises and linked media universes.', status: 'Live', metric: `${stats.collections.length} collection group${stats.collections.length === 1 ? '' : 's'}`, href: '/collections', action: 'Open Collections', icon: Library },
        { title: 'Streaming availability', description: 'Legal availability helper is available in Creator Tools.', status: 'Live', href: '/tools', action: 'Use tool', icon: Globe2 },
        { title: 'Video source health', description: 'Library health checks highlight titles with missing video sources.', status: 'Live', metric: `${stats.missingVideos.length} missing videos`, href: '/tools', action: 'Review health', icon: LinkIcon },
        { title: 'Subtitle manager', description: 'Subtitle fields are supported per movie and per episode.', status: 'Live', metric: `${stats.missingSubtitles.length} may need captions`, href: '/admin', action: 'Manage media', icon: Film },
        { title: 'Episode manager polish', description: 'TV episode tools help manage seasons, episodes and sources.', status: 'Live', href: '/admin', action: 'Open Admin', icon: Film },
        { title: 'Empty states', description: 'Key pages include helpful empty states and next actions.', status: 'Live', href: '/movies', action: 'Browse', icon: Wrench },
        { title: 'Video playback progress', description: 'Playback progress, duration and completion state are saved.', status: 'Live', metric: `${stats.playableSafe} safe playable titles`, href: '/movies', action: 'Browse playable', icon: PlayCircle }
      ]
    },
    {
      title: 'Admin, creator and growth tools',
      items: [
        { title: 'Admin dashboard upgrades', description: 'Admin library, upload queue, users and content controls are centralised.', status: 'Live', href: '/admin', action: 'Open Admin', icon: BarChart3 },
        { title: 'Upload approval flow', description: 'Uploads can be reviewed, approved, rejected and managed.', status: 'Live', href: '/upload', action: 'Upload', icon: UploadCloud },
        { title: 'SEO and share cards', description: 'Creator Tools includes share-card generation support.', status: 'Live', href: '/tools', action: 'Open SEO tool', icon: Share2 },
        { title: 'Analytics', description: 'Creator analytics summarise media, games and watch activity.', status: 'Live', href: '/tools', action: 'View analytics', icon: Activity },
        { title: 'Import tools', description: 'AI Search, upload tools and live TV imports support library growth.', status: 'Live', href: '/admin', action: 'Import content', icon: Database },
        { title: 'Theme customization', description: 'Elite settings control branding, layout density, hero style and interface feel.', status: 'Live', href: '/tools', action: 'Open settings', icon: Palette },
        { title: 'AI assistant improvements', description: 'Floating assistant helps users discover media and games from the library.', status: 'Live', href: '/', action: 'Try assistant', icon: Sparkles },
        { title: 'Voice search', description: 'Voice search tool is available from Creator Tools.', status: 'Live', href: '/tools', action: 'Use voice search', icon: Mic }
      ]
    },
    {
      title: 'Profiles, mobile and specialist hubs',
      items: [
        { title: 'Mobile navigation', description: 'Bottom tabs and responsive layouts improve mobile browsing.', status: 'Live', href: '/', action: 'Preview mobile', icon: Smartphone },
        { title: 'Accessibility polish', description: 'Global accessibility controls support enhanced and maximum accessibility modes.', status: 'Live', href: '/', action: 'Use controls', icon: Accessibility },
        { title: 'Personal profiles', description: 'Profile page and user-aware features support personal experiences.', status: 'Live', href: '/profile', action: 'Open Profile', icon: Users },
        { title: 'Parental controls', description: 'Kids profile manager supports age groups, limits and blocked keywords.', status: 'Live', href: '/tools', action: 'Manage kids', icon: Baby },
        { title: 'Offline downloads', description: 'Offline download registry is available in Creator Tools.', status: 'Live', href: '/tools', action: 'Open downloads', icon: Download },
        { title: 'Watch parties', description: 'Watch party manager is available for scheduled shared viewing.', status: 'Live', href: '/tools', action: 'Open parties', icon: Users },
        { title: 'Game hub polish', description: 'Games hub supports favourites, progress, cloud links and game discovery.', status: 'Live', metric: `${stats.games} game${stats.games === 1 ? '' : 's'}`, href: '/games', action: 'Open Games', icon: Gamepad2 },
        { title: 'Manga and book reader polish', description: 'Books and manga hubs support readers, progress and themed reading.', status: 'Live', metric: `${stats.books} book${stats.books === 1 ? '' : 's'}`, href: '/books', action: 'Open Books', icon: BookOpen },
        { title: 'Live TV improvements', description: 'Live TV hub supports categories, channels and stream management.', status: 'Live', metric: `${stats.liveChannels} channel${stats.liveChannels === 1 ? '' : 's'}`, href: '/live-tv', action: 'Open Live TV', icon: Radio }
      ]
    }
  ];

  return (
    <section className="rounded-3xl border border-primary/25 bg-card/80 p-5 elite-panel md:p-6" aria-labelledby="improvements-title">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary"><Sparkles className="h-4 w-4" /> All Improvements</p>
          <h2 id="improvements-title" className="mt-2 text-3xl font-black text-foreground">Improvement Command Centre</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">Every requested upgrade is represented here without removing existing tools, with live library signals where available.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <div className="rounded-2xl bg-secondary/60 p-3"><p className="text-2xl font-black text-primary">{stats.totalLibrary}</p><p className="text-[11px] uppercase tracking-widest text-muted-foreground">Titles</p></div>
          <div className="rounded-2xl bg-secondary/60 p-3"><p className="text-2xl font-black text-red-300">{stats.adultItems.length}</p><p className="text-[11px] uppercase tracking-widest text-muted-foreground">Vault</p></div>
          <div className="rounded-2xl bg-secondary/60 p-3"><p className="text-2xl font-black text-amber-300">{stats.duplicateGroups.length}</p><p className="text-[11px] uppercase tracking-widest text-muted-foreground">Duplicates</p></div>
          <div className="rounded-2xl bg-secondary/60 p-3"><p className="text-2xl font-black text-emerald-300">40</p><p className="text-[11px] uppercase tracking-widest text-muted-foreground">Upgrades</p></div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map(section => (
          <div key={section.title}>
            <h3 className="mb-3 text-lg font-black text-foreground">{section.title}</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {section.items.map(item => <ImprovementCard key={item.title} item={item} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
