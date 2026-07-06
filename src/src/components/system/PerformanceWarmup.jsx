import { useEffect } from 'react';

const WARMUP_ORIGINS = [
  'https://vidsrc.me',
  'https://vidsrc.to',
  'https://embed.su',
  'https://vidlink.pro',
  'https://vidfast.pro',
  'https://multiembed.mov',
  'https://image.tmdb.org',
  'https://images.weserv.nl'
];

export default function PerformanceWarmup() {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => warmupConnections());
    } else {
      setTimeout(warmupConnections, 600);
    }
  }, []);

  return null;
}

function warmupConnections() {
  WARMUP_ORIGINS.forEach((origin) => {
    if (document.querySelector(`link[data-elite-warmup="${origin}"]`)) return;

    const dns = document.createElement('link');
    dns.rel = 'dns-prefetch';
    dns.href = origin;
    dns.dataset.eliteWarmup = origin;
    document.head.appendChild(dns);

    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = origin;
    preconnect.crossOrigin = 'anonymous';
    preconnect.dataset.eliteWarmup = origin;
    document.head.appendChild(preconnect);
  });
}