import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// Register HLS streaming support
import '@videojs/http-streaming';

export default function VideoJSPlayer({ url, subtitles = [], startTime = 0, onProgress, onDuration, onPlay, onPause, onEnded, playerRef }) {
  const containerRef = useRef(null);
  const vjsRef = useRef(null);
  const callbacksRef = useRef({ onProgress, onDuration, onPlay, onPause, onEnded });

  useEffect(() => {
    callbacksRef.current = { onProgress, onDuration, onPlay, onPause, onEnded };
  }, [onProgress, onDuration, onPlay, onPause, onEnded]);

  useEffect(() => {
    if (!containerRef.current) return;

    const videoEl = document.createElement('video');
    videoEl.className = 'video-js vjs-big-play-centered vjs-fluid';
    videoEl.setAttribute('playsinline', 'true');
    videoEl.setAttribute('webkit-playsinline', 'true');
    videoEl.muted = true;
    containerRef.current.appendChild(videoEl);

    const player = videojs(videoEl, {
      controls: true,
      autoplay: 'muted',
      muted: true,
      preload: 'auto',
      fluid: false,
      fill: true,
      responsive: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      controlBar: {
        skipButtons: { forward: 10, backward: 10 },
        pictureInPictureToggle: true,
        remainingTimeDisplay: true,
      },
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          experimentalBufferBasedABR: true,
          bandwidth: 5000000,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
      sources: resolveSource(url),
      tracks: resolveSubtitleTracks(subtitles),
    });

    vjsRef.current = player;
    applySubtitleTracks(player, subtitles);

    // Expose seekTo via playerRef
    if (playerRef) {
      playerRef.current = {
        seekTo: (seconds) => player.currentTime(seconds),
        currentTime: () => player.currentTime(),
      };
    }

    // Progress reporting (every 1s)
    let progressTimer = null;
    player.on('play', () => {
      callbacksRef.current.onPlay?.();
      progressTimer = setInterval(() => {
        const t = player.currentTime();
        callbacksRef.current.onProgress?.({ playedSeconds: t });
      }, 1000);
    });

    player.on('pause', () => {
      callbacksRef.current.onPause?.();
      clearInterval(progressTimer);
    });

    player.on('ended', () => {
      callbacksRef.current.onEnded?.();
      clearInterval(progressTimer);
    });

    player.one('loadedmetadata', () => {
      const d = player.duration();
      if (d && isFinite(d)) callbacksRef.current.onDuration?.(d);
      if (startTime > 0 && startTime < d - 5) player.currentTime(startTime);
      player.play()?.catch(() => {});
    });

    player.on('durationchange', () => {
      const d = player.duration();
      if (d && isFinite(d)) callbacksRef.current.onDuration?.(d);
    });

    player.on('error', () => {
      console.warn('Video.js error:', player.error());
    });

    return () => {
      clearInterval(progressTimer);
      const finalTime = player.currentTime?.() || 0;
      if (finalTime > 0) callbacksRef.current.onProgress?.({ playedSeconds: finalTime });
      callbacksRef.current.onPause?.();
      if (vjsRef.current) {
        vjsRef.current.dispose();
        vjsRef.current = null;
      }
    };
  }, []); // only mount once

  // Update source when URL changes without remounting
  useEffect(() => {
    if (vjsRef.current && url) {
      const finalTime = vjsRef.current.currentTime?.() || 0;
      if (finalTime > 0) callbacksRef.current.onProgress?.({ playedSeconds: finalTime });
      vjsRef.current.src(resolveSource(url));
      applySubtitleTracks(vjsRef.current, subtitles);
      vjsRef.current.load();
      vjsRef.current.play()?.catch(() => {});
    }
  }, [url, subtitles]);

  return (
    <div ref={containerRef} className="w-full h-full" style={{ background: '#000' }} />
  );
}

function resolveSubtitleTracks(subtitles = []) {
  const tracks = Array.isArray(subtitles) ? subtitles : [subtitles];
  return tracks
    .map((track, index) => typeof track === 'string' ? { url: track, label: 'Subtitles', language: 'en', default: index === 0 } : track)
    .filter(track => track?.url || track?.src)
    .map((track, index) => ({
      kind: track.kind || 'subtitles',
      src: track.url || track.src,
      srclang: track.language || track.srclang || 'en',
      label: track.label || track.language || 'Subtitles',
      default: !!track.default || index === 0,
    }));
}

function applySubtitleTracks(player, subtitles = []) {
  if (!player) return;
  Array.from(player.remoteTextTracks?.() || []).forEach(track => player.removeRemoteTextTrack(track));
  resolveSubtitleTracks(subtitles).forEach(track => player.addRemoteTextTrack(track, false));
  setTimeout(() => {
    const textTracks = player.textTracks?.();
    if (!textTracks?.length) return;
    for (let i = 0; i < textTracks.length; i += 1) {
      textTracks[i].mode = i === 0 ? 'showing' : 'disabled';
    }
  }, 250);
}

function resolveSource(url) {
  if (!url) return [];
  if (/\.m3u8(\?.*)?$/i.test(url)) return [{ src: url, type: 'application/x-mpegURL' }];
  if (/\.mpd(\?.*)?$/i.test(url)) return [{ src: url, type: 'application/dash+xml' }];
  if (/\.webm(\?.*)?$/i.test(url)) return [{ src: url, type: 'video/webm' }];
  if (/\.ogv?(\?.*)?$/i.test(url)) return [{ src: url, type: 'video/ogg' }];
  // mp4 or fallback
  return [{ src: url, type: 'video/mp4' }];
}