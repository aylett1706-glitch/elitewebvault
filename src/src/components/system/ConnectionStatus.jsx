import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function ConnectionStatus() {
  const [offline, setOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2 rounded-full border border-destructive/30 bg-background/95 px-4 py-2 text-sm font-bold text-destructive shadow-2xl backdrop-blur-xl">
      <span className="inline-flex items-center gap-2"><WifiOff className="h-4 w-4" /> Connection lost — playback may pause</span>
    </div>
  );
}