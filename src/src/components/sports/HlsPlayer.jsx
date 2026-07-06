import { useEffect, useRef, useState } from 'react';

export default function HLSPlayer({ url, title, isLive = false, autoPlay = true }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    const video = videoRef.current;
    if (!video || !url) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHLS = /\.m3u8/i.test(url) || /hls/i.test(url);

    const loadDirect = () => {
      video.src = url;
      if (autoPlay) video.play().catch(() => {});
    };

    if (isHLS) {
      import('hls.js')
        .then(({ default: Hls }) => {
          if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (autoPlay) video.play().catch(() => {});
            });
            hls.on(Hls.Events.ERROR, (_, data) => {
              if (data.fatal) {
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
                else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
                else {
                  hls.destroy();
                  setError('Stream failed — may be offline or geo-restricted.');
                }
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            loadDirect();
          } else {
            setError('HLS not supported in this browser.');
          }
        })
        .catch(loadDirect);
    } else {
      loadDirect();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url, autoPlay]);

  if (error) {
    return (
      <div className="aspect-video rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="text-5xl">📡</span>
        <p className="text-zinc-300 font-bold text-lg">{error}</p>
        <p className="text-zinc-500 text-sm max-w-sm">
          Add a direct <strong>.m3u8</strong> or <strong>.mp4</strong> stream URL in the event form to watch in-app.
        </p>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
      <video
        ref={videoRef}
        controls
        className="w-full aspect-video"
        playsInline
        poster="https://picsum.photos/id/1015/1280/720"
      />
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 z-10 pointer-events-none">
        {isLive ? (
          <>
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
            <span className="text-white">LIVE • {title}</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 bg-blue-400 rounded-full inline-block" />
            <span className="text-white">{title}</span>
          </>
        )}
      </div>
    </div>
  );
}
