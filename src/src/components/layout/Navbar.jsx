import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Upload, Shield, Menu, X, Play, Lock, Baby, Gamepad2, Tv, BookOpen, Radio, Keyboard, Library, Folder, UserRound, Wrench, TrendingUp, Trophy } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ user }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appName, setAppName] = useState(() => {
    const saved = localStorage.getItem('ev_elite_settings_v1');
    return saved ? JSON.parse(saved).appName || 'EliteVault' : 'EliteVault';
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onEliteSettings = (event) => setAppName(event.detail?.appName || 'EliteVault');
    window.addEventListener('scroll', onScroll);
    window.addEventListener('elite-settings-updated', onEliteSettings);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('elite-settings-updated', onEliteSettings);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'TV Shows', path: '/tv-shows' },
    { label: 'Spotlight', path: '/spotlight', icon: TrendingUp },
    { label: 'Kids', path: '/kids', icon: Baby },
    { label: 'Games Hub', path: '/games', icon: Gamepad2 },
    { label: 'Sports', path: '/sports', icon: Trophy },
    { label: 'Input Hub', path: '/input-hub', icon: Keyboard },
    { label: 'Live TV', path: '/live-tv', icon: Radio },
    { label: 'Collections', path: '/collections', icon: Folder },
    { label: 'Actors', path: '/actors', icon: UserRound },
    { label: 'Tools', path: '/tools', icon: Wrench },
    { label: 'Anime', path: '/anime', icon: Tv },
    { label: 'Manga', path: '/manga', icon: BookOpen },
    { label: 'Books', path: '/books', icon: Library },
    { label: 'My List', path: '/my-list' },
  ];

  const vaultUnlocked = sessionStorage.getItem('ev_vault_unlocked') === 'true';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-background/72 backdrop-blur-2xl border-b border-primary/15 shadow-2xl shadow-primary/10' : 'bg-gradient-to-b from-black/80 via-black/35 to-transparent'
    }`}>
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 elite-ring">
            <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="font-bebas text-2xl tracking-wider text-foreground">{appName}</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.icon && <link.icon className="inline h-3.5 w-3.5 mr-1" />}
              {link.label}
            </Link>
          ))}
          <Link
            to="/vault"
            title="Private Vault · 18+"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/vault'
                ? 'text-red-400'
                : 'text-red-500/70 hover:text-red-400'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Vault
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search all hubs..."
              className="bg-secondary/60 border border-border/50 rounded-full pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 w-56 focus:w-72 transition-all duration-300"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link to="/upload" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </Link>

          {user?.role === 'admin' && (
            <Link to="/admin" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          )}

          <Link to="/profile" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </Link>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-muted-foreground hover:text-foreground">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/98 backdrop-blur-xl border-b border-border"
          >
            <div className="px-4 py-4 space-y-1">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search all hubs..."
                    className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </form>
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  {link.label}
                </Link>
              ))}
              <Link to="/upload" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary">Upload</Link>
              <Link to="/vault" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-secondary">
                <Lock className="w-3.5 h-3.5" /> Vault
              </Link>
              {user?.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-secondary">Admin</Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}