import { useEffect, useRef } from 'react';
import { Gamepad2 } from 'lucide-react';

export default function EmulatorJsPlayer({ game }) {
  const containerRef = useRef(null);
  const playerIdRef = useRef(`emulator-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!game?.rom_url || !game?.emulator_core) return;

    const playerId = playerIdRef.current;
    const player = document.createElement('div');
    player.id = playerId;
    player.className = 'h-full w-full';
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(player);

    window.EJS_player = `#${playerId}`;
    window.EJS_core = game.emulator_core;
    window.EJS_gameName = game.title;
    window.EJS_gameUrl = game.rom_url;
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_startOnLoaded = true;
    window.EJS_DEBUG_XX = false;

    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [game?.rom_url, game?.emulator_core, game?.title]);

  if (!game?.rom_url || !game?.emulator_core) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-black text-center text-white">
        <Gamepad2 className="h-14 w-14 text-primary" />
        <p className="text-lg font-bold">ROM and emulator core required</p>
        <p className="max-w-md text-sm text-white/60">Upload a legal ROM and choose a core such as nes, snes, gba, n64, psx or arcade.</p>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full bg-black" />;
}