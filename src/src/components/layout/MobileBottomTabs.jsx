import { Link, useLocation } from 'react-router-dom';
import { Home, Search, TrendingUp, Trophy, UserRound } from 'lucide-react';
import { readEliteSettings } from '@/lib/elite-settings';
import { useEffect, useState } from 'react';

const TABS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Sports', path: '/sports', icon: Trophy },
  { label: 'Spotlight', path: '/spotlight', icon: TrendingUp },
  { label: 'Search', path: '/search', icon: Search },
  { label: 'Profile', path: '/profile', icon: UserRound }
];

export default function MobileBottomTabs() {
  const location = useLocation();
  const [settings, setSettings] = useState(readEliteSettings);

  useEffect(() => {
    const onSettings = (event) => setSettings(event.detail || readEliteSettings());
    window.addEventListener('elite-settings-updated', onSettings);
    return () => window.removeEventListener('elite-settings-updated', onSettings);
  }, []);

  if (settings.mobileNavMode !== 'bottom_tabs' && !settings.mobileFirstMode) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/20 bg-background/85 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-2xl md:hidden" aria-label="Mobile primary navigation">
      <div className="grid grid-cols-5 gap-1">
        {TABS.map(tab => {
          const active = tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path);
          return (
            <Link key={tab.path} to={tab.path} className={`flex min-h-14 flex-col items-center justify-center rounded-2xl text-[11px] font-black ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
              <tab.icon className="mb-1 h-4 w-4" aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}