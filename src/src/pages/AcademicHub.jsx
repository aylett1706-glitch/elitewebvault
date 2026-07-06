import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FlaskConical, Search, Loader2, Plus, Check, FileText, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { webAISearchAcademic } from '@/lib/web-ai-search';

export default function AcademicHub() {
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
    const items = await base44.entities.AcademicPaper.filter({ status: 'approved' }, '-created_date', 100);
    setLibrary(items);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setAiResults([]);
    try {
      const results = await webAISearchAcademic({ query, limit: 30 });
      setAiResults(results);
    } catch {
      setAiResults([]);
    }
    setLoading(false);
  };

  const addToLibrary = async (item) => {
    await base44.entities.AcademicPaper.create({
      title: item.title,
      authors: item.authors || [],
      abstract: item.abstract || '',
      paper_url: item.paper_url || '',
      pdf_url: item.pdf_url || '',
      doi: item.doi || '',
      journal: item.journal || '',
      published_date: item.published_date || '',
      categories: item.categories || [],
      keywords: item.keywords || [],
      language: item.language || 'en',
      is_open_access: item.is_open_access !== false,
      source_name: item.source_name || '',
      status: 'approved',
      views: 0
    });
    setAddedIds(prev => new Set([...prev, item.title]));
    toast.success(`Paper added to library!`);
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
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-accent" />
          </div>
          <h1 className="font-bebas text-4xl md:text-5xl text-foreground">Academic Hub</h1>
        </div>

        <p className="text-muted-foreground text-sm mb-6">Discover open-access research papers from arXiv, PubMed, DOAJ, Semantic Scholar, and more.</p>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search research papers, topics, authors..." className="w-full bg-secondary border border-border rounded-2xl pl-12 pr-4 py-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60" />
            </div>
            <button type="submit" disabled={loading || !query.trim()} className="flex items-center gap-2 bg-accent text-accent-foreground px-6 py-4 rounded-2xl text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />} Search
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex items-center gap-3 py-12"><Loader2 className="w-6 h-6 text-accent animate-spin" /><p className="text-sm text-muted-foreground">Searching the web for open-access research...</p></div>
        )}

        {!loading && aiResults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><FlaskConical className="w-4 h-4 text-accent" /> Web Results ({aiResults.length})</h2>
            <div className="grid grid-cols-1 gap-3">
              {aiResults.map((item, i) => {
                const added = addedIds.has(item.title) || library.some(p => p.title === item.title);
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-4 bg-card border border-border rounded-2xl p-4 hover:border-accent/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm leading-tight">{item.title}</h3>
                      {item.authors?.length > 0 && <p className="text-xs text-muted-foreground mt-1">{item.authors.slice(0, 3).join(', ')}{item.authors.length > 3 ? ' et al.' : ''}</p>}
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.abstract}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {item.journal && <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">{item.journal}</span>}
                        {item.published_date && <span className="text-xs text-muted-foreground">{item.published_date}</span>}
                        {item.source_name && <span className="text-xs px-1.5 py-0.5 bg-accent/15 rounded text-accent">{item.source_name}</span>}
                        {item.is_open_access && <span className="text-xs px-1.5 py-0.5 bg-green-500/15 rounded text-green-300">Open Access</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {item.pdf_url && <a href={item.pdf_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent hover:text-accent/80"><FileText className="w-3 h-3" /> PDF</a>}
                        {item.paper_url && <a href={item.paper_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accent hover:text-accent/80"><ExternalLink className="w-3 h-3" /> Source</a>}
                        <button onClick={() => !added && addToLibrary(item)} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${added ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}>
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
            <h2 className="text-lg font-bold text-foreground mb-4">Saved Papers ({library.length})</h2>
            <div className="grid grid-cols-1 gap-3">
              {library.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className="flex gap-4 bg-card border border-border rounded-2xl p-4 hover:border-accent/30 transition-colors cursor-pointer" onClick={() => item.pdf_url ? window.open(item.pdf_url, '_blank') : item.paper_url && window.open(item.paper_url, '_blank')}>
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-accent" /></div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm leading-tight">{item.title}</h3>
                    {item.authors?.length > 0 && <p className="text-xs text-muted-foreground mt-0.5">{item.authors.slice(0, 3).join(', ')}</p>}
                    {item.journal && <p className="text-xs text-muted-foreground mt-0.5">{item.journal} · {item.published_date}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!loading && !aiResults.length && !library.length && (
          <div className="text-center py-20"><FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-lg font-semibold text-foreground mb-2">Search for research</p><p className="text-muted-foreground text-sm">Find open-access papers from top repositories</p></div>
        )}
      </div>
    </div>
  );
}
