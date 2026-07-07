import { useState, useEffect } from 'react';
import { base44 } from '@/api/supabaseApi';
import { Search, Loader2, ArrowLeft, Sparkles, Film, Gamepad2, BookOpen, Tv, Headphones, GraduationCap, Code2, Mic, FlaskConical, Globe, Plus, Check, ExternalLink, Play, Download, FileText, Music as MusicIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { universalAISearch } from '@/lib/web-ai-search';
import { filterMainAppSafeMedia, isAdultRated } from '@/lib/content-safety';

const HUB_CONFIG = [
  { key: 'media', label: 'Movies & TV', icon: Film, color: 'text-primary', path: '/movies' },
  { key: 'games', label: 'Games', icon: Gamepad2, color: 'text-accent', path: '/games' },
  { key: 'books', label: 'Books', icon: BookOpen, color: 'text-primary', path: '/books' },
  { key: 'manga', label: 'Manga', icon: Tv, color: 'text-accent', path: '/manga' },
  { key: 'music', label: 'Music', icon: MusicIcon, color: 'text-primary', path: '/music' },
  { key: 'courses', label: 'Courses', icon: GraduationCap, color: 'text-accent', path: '/courses' },
  { key: 'software', label: 'Software', icon: Code2, color: 'text-primary', path: '/software' },
  { key: 'podcasts', label: 'Podcasts', icon: Mic, color: 'text-accent', path: '/podcasts' },
  { key: 'academic', label: 'Academic', icon: FlaskConical, color: 'text-primary', path: '/academic' },
];

const MODEL_COUNT = 10;

export default function AllHubs() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [addedKeys, setAddedKeys] = useState(new Set());
  const [activeTab, setActiveTab] = useState('media');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const data = await universalAISearch({ query, limit: 20 });
      const safeMedia = filterMainAppSafeMedia(data.media || []);
      setResults({ ...data, media: safeMedia });
      const firstNonEmpty = HUB_CONFIG.find(h => (data[h.key] || []).length > 0);
      if (firstNonEmpty) setActiveTab(firstNonEmpty.key);
    } catch {
      setResults({ media: [], games: [], books: [], manga: [], music: [], courses: [], software: [], podcasts: [], academic: [] });
    }
    setLoading(false);
  };

  const totalResults = results ? HUB_CONFIG.reduce((sum, h) => sum + (results[h.key] || []).length, 0) : 0;

  const addMedia = async (item) => {
    await base44.entities.Media.create({
      title: item.title, type: item.type === 'tv_show' || String(item.type).toLowerCase().includes('tv') ? 'tv_show' : 'movie',
      synopsis: item.synopsis, year: item.year, rating: item.rating, genres: item.genres, cast: item.cast, director: item.director,
      poster_url: item.poster_url, backdrop_url: item.backdrop_url, video_url: item.video_url || '', trailer_url: item.trailer_url || '',
      content_rating: item.content_rating || '', streaming_platforms: item.streaming_platforms || [], source_url: item.source_url || '',
      status: 'approved', is_adult: isAdultRated(item), views: 0, language: 'en'
    });
    setAddedKeys(prev => new Set([...prev, 'media-' + item.title]));
    toast.success(`"${item.title}" added to library!`);
  };

  const addGame = async (item) => {
    await base44.entities.Game.create({
      title: item.title, description: item.description, cover_url: item.cover_url, banner_url: item.banner_url, year: item.year,
      genres: item.genres, platforms: item.platforms, source_type: item.source_type || 'web_game', play_url: item.play_url, store_url: item.store_url,
      age_rating: item.age_rating, rating: item.rating, tags: item.tags, status: 'approved', views: 0
    });
    setAddedKeys(prev => new Set([...prev, 'games-' + item.title]));
    toast.success(`"${item.title}" added to library!`);
  };

  const addBook = async (item) => {
    await base44.entities.Book.create({
      title: item.title, subtitle: item.subtitle, authors: item.authors, description: item.description, cover_url: item.cover_url,
      preview_url: item.preview_url, info_url: item.info_url, publisher: item.publisher, published_date: item.published_date,
      page_count: item.page_count, language: item.language, categories: item.categories, genres: item.genres, content_type: item.content_type || 'ebook', status: 'approved'
    });
    setAddedKeys(prev => new Set([...prev, 'books-' + item.title]));
    toast.success(`"${item.title}" added to library!`);
  };

  const addManga = async (item) => {
    await base44.entities.Manga.create({
      title: item.title, synopsis: item.synopsis, cover_url: item.cover_url, banner_url: item.banner_url, author: item.author, artist: item.artist,
      genres: item.genres, status: item.status || 'ongoing', content_rating: item.content_rating, source_url: item.source_url, read_url: item.read_url,
      read_source_label: item.read_source_label, status: 'approved', views: 0
    });
    setAddedKeys(prev => new Set([...prev, 'manga-' + item.title]));
    toast.success(`"${item.title}" added to library!`);
  };

  const addMusic = async (item) => {
    await base44.entities.Music.create({
      title: item.title, artist: item.artist, album: item.album, genre: item.genre, year: item.year, duration_seconds: item.duration_seconds,
      cover_url: item.cover_url, stream_url: item.stream_url, preview_url: item.preview_url, source_url: item.source_url, source_name: item.source_name,
      is_free: item.is_free !== false, license_type: item.license_type, language: item.language, status: 'approved', views: 0
    });
    setAddedKeys(prev => new Set([...prev, 'music-' + item.title + item.artist]));
    toast.success(`"${item.title}" added to library!`);
  };

  const addCourse = async (item) => {
    await base44.entities.Course.create({
      title: item.title, provider: item.provider, instructor: item.instructor, description: item.description, cover_url: item.cover_url,
      course_url: item.course_url, video_url: item.video_url, categories: item.categories, level: item.level || 'all_levels', duration_hours: item.duration_hours,
      language: item.language, is_free: item.is_free !== false, certificate_available: item.certificate_available, rating: item.rating, status: 'approved', views: 0
    });
    setAddedKeys(prev => new Set([...prev, 'courses-' + item.title]));
    toast.success(`"${item.title}" added to library!`);
  };

  const addSoftware = async (item) => {
    await base44.entities.Software.create({
      title: item.title, developer: item.developer, description: item.description, cover_url: item.cover_url, download_url: item.download_url,
      source_url: item.source_url, github_url: item.github_url, categories: item.categories, platforms: item.platforms, license_type: item.license_type,
      version: item.version, is_free: item.is_free !== false, is_open_source: item.is_open_source, rating: item.rating, status: 'approved', views: 0
    });
    setAddedKeys(prev => new Set([...prev, 'software-' + item.title]));
    toast.success(`"${item.title}" added to library!`);
  };

  const addPodcast = async (item) => {
    await base44.entities.Podcast.create({
      title: item.title, host: item.host, description: item.description, cover_url: item.cover_url, feed_url: item.feed_url, listen_url: item.listen_url,
      categories: item.categories, episode_count: item.episode_count, language: item.language, is_free: item.is_free !== false, source_name: item.source_name,
      status: 'approved', views: 0
    });
    setAddedKeys(prev => new Set([...prev, 'podcasts-' + item.title]));
    toast.success(`"${item.title}" added to library!`);
  };

  const addAcademic = async (item) => {
    await base44.entities.AcademicPaper.create({
      title: item.title, authors: item.authors, abstract: item.abstract, paper_url: item.paper_url, pdf_url: item.pdf_url, doi: item.doi,
      journal: item.journal, published_date: item.published_date, categories: item.categories, keywords: item.keywords, language: item.language,
      is_open_access: item.is_open_access !== false, source_name: item.source_name, status: 'approved', views: 0
    });
    setAddedKeys(prev => new Set([...prev, 'academic-' + item.title]));
    toast.success(`Paper added to library!`);
  };

  const addHandlers = { media: addMedia, games: addGame, books: addBook, manga: addManga, music: addMusic, courses: addCourse, software: addSoftware, podcasts: addPodcast, academic: addAcademic };

  const renderResultCard = (hubKey, item, i) => {
    const added = addedKeys.has(hubKey + '-' + (item.title || '') + (item.artist || ''));
    const onAdd = () => !added && addHandlers[hubKey](item);

    switch (hubKey) {
      case 'media':
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-3 bg-card border border-border rounded-2xl p-3 hover:border-primary/30 transition-colors">
            <div className="w-16 h-24 rounded-lg overflow-hidden bg-secondary shrink-0">
              {item.poster_url ? <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Film className="w-5 h-5 text-muted-foreground" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.year} • {item.type === 'tv_show' ? 'TV' : 'Movie'}{item.rating ? ` • ⭐${item.rating.toFixed(1)}` : ''}</p>
              {item.streaming_platforms?.length > 0 && <p className="text-xs text-muted-foreground mt-0.5 truncate">On {item.streaming_platforms.slice(0, 3).join(', ')}</p>}
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.synopsis}</p>
              <button onClick={onAdd} className={`mt-2 flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${added ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>{added ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}</button>
            </div>
          </motion.div>
        );
      case 'games':
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-3 bg-card border border-border rounded-2xl p-3 hover:border-accent/30 transition-colors">
            <div className="w-16 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">{item.cover_url ? <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-muted-foreground" /></div>}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.year}{item.rating ? ` • ⭐${item.rating.toFixed(1)}` : ''}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
              <div className="flex items-center gap-2 mt-2">
                {item.play_url && <a href={item.play_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent"><Play className="w-3 h-3" /> Play</a>}
                <button onClick={onAdd} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${added ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}>{added ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}</button>
              </div>
            </div>
          </motion.div>
        );
      case 'books':
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-3 bg-card border border-border rounded-2xl p-3 hover:border-primary/30 transition-colors">
            <div className="w-14 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">{item.cover_url ? <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-muted-foreground" /></div>}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.authors?.join(', ')}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
              <div className="flex items-center gap-2 mt-2">
                {item.preview_url && <a href={item.preview_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent"><ExternalLink className="w-3 h-3" /> Preview</a>}
                <button onClick={onAdd} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${added ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>{added ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}</button>
              </div>
            </div>
          </motion.div>
        );
      case 'manga':
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-3 bg-card border border-border rounded-2xl p-3 hover:border-accent/30 transition-colors">
            <div className="w-14 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">{item.cover_url ? <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Tv className="w-5 h-5 text-muted-foreground" /></div>}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.author}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.synopsis}</p>
              <div className="flex items-center gap-2 mt-2">
                {item.read_url && <a href={item.read_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent"><ExternalLink className="w-3 h-3" /> Read</a>}
                <button onClick={onAdd} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${added ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}>{added ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}</button>
              </div>
            </div>
          </motion.div>
        );
      case 'music':
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-3 bg-card border border-border rounded-2xl p-3 hover:border-primary/30 transition-colors">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">{item.cover_url ? <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><MusicIcon className="w-5 h-5 text-muted-foreground" /></div>}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.artist}{item.year ? ` • ${item.year}` : ''}</p>
              {item.genre && <span className="text-xs text-muted-foreground">{item.genre}</span>}
              <div className="flex items-center gap-2 mt-2">
                {item.stream_url && <a href={item.stream_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent"><Play className="w-3 h-3" /> Listen</a>}
                <button onClick={onAdd} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${added ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>{added ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}</button>
              </div>
            </div>
          </motion.div>
        );
      case 'courses':
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-3 bg-card border border-border rounded-2xl p-3 hover:border-accent/30 transition-colors">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">{item.cover_url ? <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><GraduationCap className="w-5 h-5 text-muted-foreground" /></div>}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.provider}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
              <div className="flex items-center gap-2 mt-2">
                {item.course_url && <a href={item.course_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent"><ExternalLink className="w-3 h-3" /> Open</a>}
                <button onClick={onAdd} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${added ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}>{added ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}</button>
              </div>
            </div>
          </motion.div>
        );
      case 'software':
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-3 bg-card border border-border rounded-2xl p-3 hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">{item.cover_url ? <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Code2 className="w-5 h-5 text-muted-foreground" /></div>}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.developer}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
              <div className="flex items-center gap-2 mt-2">
                {item.download_url && <a href={item.download_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent"><Download className="w-3 h-3" /> Get</a>}
                <button onClick={onAdd} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${added ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>{added ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}</button>
              </div>
            </div>
          </motion.div>
        );
      case 'podcasts':
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-3 bg-card border border-border rounded-2xl p-3 hover:border-accent/30 transition-colors">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">{item.cover_url ? <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Mic className="w-5 h-5 text-muted-foreground" /></div>}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.host}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
              <div className="flex items-center gap-2 mt-2">
                {item.listen_url && <a href={item.listen_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent"><Play className="w-3 h-3" /> Listen</a>}
                <button onClick={onAdd} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${added ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}>{added ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}</button>
              </div>
            </div>
          </motion.div>
        );
      case 'academic':
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-3 bg-card border border-border rounded-2xl p-3 hover:border-primary/30 transition-colors">
            <div className="w-10 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.authors?.slice(0, 3).join(', ')}{item.authors?.length > 3 ? ' et al.' : ''}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.abstract}</p>
              <div className="flex items-center gap-2 mt-2">
                {item.pdf_url && <a href={item.pdf_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent"><FileText className="w-3 h-3" /> PDF</a>}
                {item.paper_url && <a href={item.paper_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent"><ExternalLink className="w-3 h-3" /> Source</a>}
                <button onClick={onAdd} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${added ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>{added ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}</button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="pt-24 max-w-screen-2xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="font-bebas text-4xl md:text-5xl text-foreground">All Hubs Search</h1>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-sm text-muted-foreground">
            Searches <span className="text-primary font-semibold">all {HUB_CONFIG.length} content hubs</span> simultaneously using <span className="text-primary font-semibold">{MODEL_COUNT} AI models</span> in parallel — movies, TV, games, books, manga, music, courses, software, podcasts, and academic papers.
          </p>
        </div>

        {/* Hub quick links */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
          {HUB_CONFIG.map(hub => (
            <Link key={hub.key} to={hub.path} className="shrink-0 flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-primary/15 hover:text-primary transition-colors">
              <hub.icon className={`w-3.5 h-3.5 ${hub.color}`} />
              {hub.label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search everything — movies, games, books, music, courses, software, podcasts, papers..."
                className="w-full bg-secondary border border-border rounded-2xl pl-12 pr-4 py-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all" />
            </div>
            <button type="submit" disabled={loading || !query.trim()} className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
              {loading ? 'Searching...' : 'Search All'}
            </button>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="relative">
              <Globe className="w-12 h-12 text-primary animate-pulse" />
              <Loader2 className="w-12 h-12 text-primary animate-spin absolute inset-0" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {MODEL_COUNT} AI models are searching the entire web across all {HUB_CONFIG.length} content hubs in parallel...
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {HUB_CONFIG.map(h => (
                <span key={h.key} className="flex items-center gap-1 text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
                  <h.icon className={`w-3 h-3 ${h.color}`} /> {h.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && results && (
          <>
            {totalResults === 0 ? (
              <div className="text-center py-20">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">No results found</p>
                <p className="text-muted-foreground text-sm">Try different keywords or check spelling</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">{totalResults} results across all hubs for "<span className="text-foreground">{query}</span>"</p>

                {/* Tab bar */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6 sticky top-16 bg-background/80 backdrop-blur-xl z-10 -mx-4 px-4">
                  {HUB_CONFIG.map(hub => {
                    const count = (results[hub.key] || []).length;
                    if (count === 0) return null;
                    return (
                      <button key={hub.key} onClick={() => setActiveTab(hub.key)} className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${activeTab === hub.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                        <hub.icon className="w-3.5 h-3.5" />
                        {hub.label}
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === hub.key ? 'bg-primary-foreground/20' : 'bg-foreground/10'}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active tab results */}
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(results[activeTab] || []).map((item, i) => renderResultCard(activeTab, item, i))}
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && !results && (
          <div className="text-center py-20">
            <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">Search Every Hub at Once</p>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">One search across movies, TV, games, books, manga, music, courses, software, podcasts, and academic papers — powered by {MODEL_COUNT} AI models in parallel.</p>
          </div>
        )}
      </div>
    </div>
  );
}