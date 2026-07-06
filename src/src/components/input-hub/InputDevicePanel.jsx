import { useEffect, useState } from 'react';
import { Gamepad2, Keyboard, MousePointer2, Radio, Usb, Bluetooth, Activity } from 'lucide-react';

const deviceTypes = [
  'Xbox / XInput', 'PlayStation / DualSense', 'Nintendo / Switch Pro', 'Generic Controller',
  'Fight Stick', 'Racing Wheel', 'HOTAS', 'Keyboard', 'Gaming Mouse', 'Touch', 'Adaptive Controller'
];

export default function InputDevicePanel({ liveInput, setLiveInput }) {
  const [gamepads, setGamepads] = useState([]);
  const [lastKey, setLastKey] = useState('Waiting');
  const [mouse, setMouse] = useState({ x: 0, y: 0, clicks: 0 });

  useEffect(() => {
    let frameId;
    const poll = () => {
      const pads = Array.from(navigator.getGamepads?.() || []).filter(Boolean);
      const normalizedPads = pads.map(pad => ({
        id: pad.id,
        index: pad.index,
        buttons: pad.buttons.map(button => Number(button.pressed)),
        axes: pad.axes.map(axis => Number(axis.toFixed(2))),
        connected: pad.connected
      }));
      setGamepads(normalizedPads);
      if (normalizedPads[0]) setLiveInput(prev => ({ ...prev, gamepad: normalizedPads[0] }));
      frameId = requestAnimationFrame(poll);
    };

    const keyHandler = (event) => {
      setLastKey(event.code);
      setLiveInput(prev => ({ ...prev, key: event.code, apm: prev.apm + 1 }));
    };
    const mouseHandler = (event) => setMouse(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
    const clickHandler = () => {
      setMouse(prev => ({ ...prev, clicks: prev.clicks + 1 }));
      setLiveInput(prev => ({ ...prev, clicks: prev.clicks + 1, apm: prev.apm + 1 }));
    };

    window.addEventListener('keydown', keyHandler);
    window.addEventListener('mousemove', mouseHandler);
    window.addEventListener('click', clickHandler);
    poll();
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', keyHandler);
      window.removeEventListener('mousemove', mouseHandler);
      window.removeEventListener('click', clickHandler);
    };
  }, [setLiveInput]);

  return (
    <section className="rounded-3xl border border-border bg-card p-5" aria-labelledby="device-panel-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="device-panel-title" className="text-xl font-black text-foreground">Universal Device Support</h2>
          <p className="text-sm text-muted-foreground">Auto-detects browser-visible controllers, keyboards, mice and touch input.</p>
        </div>
        <Activity className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {deviceTypes.map(type => (
          <div key={type} className="rounded-2xl border border-white/10 bg-secondary/60 p-3">
            <p className="text-sm font-bold text-foreground">{type}</p>
            <p className="mt-1 text-xs text-muted-foreground">Supported profile type</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <Gamepad2 className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />
          <p className="text-sm font-bold text-foreground">Detected Controllers</p>
          <p className="mt-1 text-xs text-muted-foreground">{gamepads.length ? `${gamepads.length} active gamepad(s)` : 'Press a controller button to wake detection.'}</p>
          {gamepads.map(pad => <p key={pad.index} className="mt-2 truncate text-xs text-primary">#{pad.index}: {pad.id}</p>)}
        </div>
        <div className="rounded-2xl border border-border bg-secondary/50 p-4">
          <Keyboard className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />
          <p className="text-sm font-bold text-foreground">Keyboard</p>
          <p className="mt-1 text-xs text-muted-foreground">Last key: <span className="font-bold text-foreground">{lastKey}</span></p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/50 p-4">
          <MousePointer2 className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />
          <p className="text-sm font-bold text-foreground">Mouse / Connection</p>
          <p className="mt-1 text-xs text-muted-foreground">Clicks: {mouse.clicks} · X {mouse.x} · Y {mouse.y}</p>
          <div className="mt-2 flex gap-2 text-xs text-muted-foreground"><Usb className="h-3.5 w-3.5" /> USB <Bluetooth className="h-3.5 w-3.5" /> Bluetooth <Radio className="h-3.5 w-3.5" /> Dongle</div>
        </div>
      </div>
    </section>
  );
}