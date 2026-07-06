import { useRef, useState } from 'react';
import { Film } from 'lucide-react';
import { toDisplayImageUrl } from './imageUrl';

const isDirectVideo = (url) => /\.(mp4|webm|m3u8)(\?|$)/i.test(String(url || ''));

export default function VideoPreviewThumb({ item }) {
  const videoRef = useRef(null);
  const [imageError, setImageError] = useState(false);
  const previewUrl = item.preview_gif_url || item.gif_url || item.poster_url;
  const displayPreviewUrl = imageError ? '' : toDisplayImageUrl(previewUrl, 320, 220);
  const videoUrl = item.video_url || item.source_url;
  const canPreviewVideo = isDirectVideo(videoUrl);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= 3) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  return (
    <div className="relative w-28 h-20 rounded-lg overflow-hidden bg-background shrink-0 border border-white/10 group/preview">
      {displayPreviewUrl ? (
        <img
          src={displayPreviewUrl}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover/preview:scale-110 transition-transform duration-700"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2 text-center">
          <Film className="w-5 h-5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">No preview</span>
        </div>
      )}

      {canPreviewVideo && (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onMouseEnter={(e) => e.currentTarget.play()}
          onMouseLeave={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/preview:opacity-100 transition-opacity"
        />
      )}

      <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
        {item.preview_gif_url || item.gif_url ? 'GIF' : '3s Preview'}
      </div>
    </div>
  );
}