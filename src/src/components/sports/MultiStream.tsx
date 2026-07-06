'use client';

import { X, Plus } from 'lucide-react';
import HLSPlayer from './HLSPlayer';

interface MultiStreamProps {
  streams: any[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

export default function MultiStream({ streams, onRemove, onClose }: MultiStreamProps) {
  return (
    <div className="fixed inset-0 bg-black/98 z-[9999] flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-lg flex items-center justify-between">
        <h2 className="text-3xl font-black text-white flex items-center gap-3">
          ⚔️ MULTI-VIEW ELITE <span className="text-red-500">(MAX 4)</span>
        </h2>
        <button 
          onClick={onClose}
          className="text-red-500 hover:text-red-400 transition p-2 rounded-full hover:bg-red-500/10"
        >
          <X size={32} />
        </button>
      </div>

      {/* Grid of Streams */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 overflow-auto bg-zinc-950/80 backdrop-blur-sm">
        {streams.map((stream) => (
          <div key={stream.id} className="relative rounded-3xl overflow-hidden border-2 border-zinc-700/50 bg-black shadow-lg">
            <HLSPlayer 
              url={stream.stream_url || stream.hlsUrl || 'https://test-streams.mux.dev/x264_720p_1500kbs_30fps.mp4/index.m3u8'} 
              title={stream.title} 
            />
            <button
              onClick={() => onRemove(stream.id)}
              className="absolute top-4 right-4 bg-red-600/90 hover:bg-red-700 p-2.5 rounded-full text-white z-20 transition shadow-lg"
            >
              <X size={18} />
            </button>
          </div>
        ))}

        {/* Empty slot to add more */}
        {streams.length < 4 && (
          <div className="border-2 border-dashed border-zinc-700/50 rounded-3xl flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all bg-zinc-800/20">
            <Plus size={64} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Add stream from main hub</p>
            <p className="text-sm text-zinc-600">Up to 4 streams at once</p>
          </div>
        )}
      </div>
    </div>
  );
}
