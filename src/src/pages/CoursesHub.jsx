import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { GraduationCap, Search, Loader2, Plus, Check, ExternalLink, ArrowLeft, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { webAISearchCourses } from '@/lib/web-ai-search';

export default function CoursesHub() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [library, setLibrary] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    const items = await base44.entities.Course.filter({ status: 'approved' }, '-created_date', 100);
    setLibrary(items);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setAiResults([]);
    try {
      const results = await webAISearchCourses({ query, limit: 30 });
      setAiResults(results);
    } catch {
      setAiResults([]);
    }
    setLoading(false);
  };

  const addToLibrary = async (item) => {
    await base44.entities.Course.create({
      title: item.title,
      provider: item.provider || '',
      instructor: item.instructor || '',
      description: item.description || '',
      cover_url: item.cover_url || '',
      course_url: item.course_url || '',
      video_url: item.video_url || '',
      categories: item.categories || [],
      level: item.level || 'all_levels',
      duration_hours: item.duration_hours,
      language: item.language || 'en',
      is_free: item.is_free !== false,
      certificate_available: item.certificate_available || false,
      rating: item.rating || 0,
      status: 'approved',
      views: 0
    });
    setAddedIds(prev => new Set([...prev, item.title]));
    toast.success(`"${item.title}" added to library!`);
    loadLibrary();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="pt-24 max-w-screen-xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-bebas text-4xl md:text-5xl text-foreground">Courses Hub</h1>
        </div>

        <p className="text-muted-foreground text-sm mb-6">Discover free online courses from Coursera, edX, MIT OpenCourseWare, Khan Academy, and more.</p>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses, subjects, skills..." className="w-full bg-secondary border border-border rounded-2xl pl-12 pr-4 py-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60" />
            </div>
            <button type="submit" disabled={loading || !query.trim()} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-4 rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />} Search
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex items-center gap-3 py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /><p className="text-sm text-muted-foreground">Searching the web for free courses...</p></div>
        )}

        {!loading && aiResults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> Web Results ({aiResults.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiResults.map((item, i) => {
                const added = addedIds.has(item.title) || library.some(c => c.title === item.title);
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-4 bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary shrink-0">
                      {item.cover_url ? <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-muted-foreground" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.provider}{item.instructor ? ` · ${item.instructor}` : ''}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {item.level && <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground capitalize">{item.level}</span>}
                        {item.duration_hours && <span className="text-xs text-muted-foreground">{item.duration_hours}h</span>}
                        {item.is_free && <span className="text-xs px-1.5 py-0.5 bg-green-500/15 rounded text-green-300">Free</span>}
                        {item.certificate_available && <span className="text-xs px-1.5 py-0.5 bg-primary/15 rounded text-primary">Certificate</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {item.course_url && <a href={item.course_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent hover:text-accent/80"><ExternalLink className="w-3 h-3" /> Open</a>}
                        <button onClick={() => !added && addToLibrary(item)} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${added ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                          {added ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {library.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Saved Courses ({library.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {library.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => item.course_url && window.open(item.course_url, '_blank')}>
                  <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.provider}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {item.level && <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground capitalize">{item.level}</span>}
                    {item.is_free && <span className="text-xs px-1.5 py-0.5 bg-green-500/15 rounded text-green-300">Free</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!loading && !aiResults.length && !library.length && (
          <div className="text-center py-20"><GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-lg font-semibold text-foreground mb-2">Search for courses</p><p className="text-muted-foreground text-sm">Find free courses from top universities and platforms</p></div>
        )}
      </div>
    </div>
  );
}
