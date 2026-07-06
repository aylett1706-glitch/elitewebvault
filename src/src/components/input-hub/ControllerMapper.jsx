import { useMemo, useState } from 'react';
import { Gamepad2, MoveRight } from 'lucide-react';

const controls = ['A / Cross', 'B / Circle', 'X / Square', 'Y / Triangle', 'LB / L1', 'RB / R1', 'LT / L2', 'RT / R2', 'Left Stick', 'Right Stick', 'D-Pad', 'Paddles', 'Touchpad', 'Gyro'];
const actions = ['Jump', 'Crouch', 'Reload', 'Interact', 'Sprint', 'Aim', 'Fire', 'Melee', 'Map', 'Inventory', 'Push to Talk', 'Macro Slot 1', 'Radial Menu', 'Accessibility Assist'];

export default function ControllerMapper({ binds, setBinds, liveInput }) {
  const [draggedAction, setDraggedAction] = useState(null);
  const activeButtons = useMemo(() => liveInput.gamepad?.buttons?.map((b, i) => b === 1 ? i : null).filter(v => v !== null) || [], [liveInput.gamepad]);

  const setMapping = (control, action) => setBinds(prev => ({ ...prev, [control]: action }));

  return (
    <section className="rounded-3xl border border-border bg-card p-5" aria-labelledby="mapper-title">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10"><Gamepad2 className="h-5 w-5 text-primary" /></div>
        <div>
          <h2 id="mapper-title" className="text-xl font-black text-foreground">Elite Controller Mapping</h2>
          <p className="text-sm text-muted-foreground">Drag actions onto buttons, sticks, triggers, paddles, touchpads or gyro slots.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <div className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-secondary to-background p-5">
          <div className="mx-auto max-w-3xl rounded-full border border-white/10 bg-black/30 p-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {controls.map(control => (
                <button
                  key={control}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => draggedAction && setMapping(control, draggedAction)}
                  onClick={() => setMapping(control, binds[control] || 'Unassigned')}
                  className="min-h-20 rounded-2xl border border-border bg-card p-3 text-left hover:border-primary/40"
                >
                  <p className="text-sm font-black text-foreground">{control}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-primary"><MoveRight className="h-3 w-3" /> {binds[control] || 'Drop action here'}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3" aria-live="polite">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Live input test</p>
            <p className="mt-1 text-sm text-muted-foreground">Pressed buttons: {activeButtons.length ? activeButtons.join(', ') : 'none'} · Axes: {liveInput.gamepad?.axes?.join(', ') || 'waiting'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Action Palette</p>
          {actions.map(action => (
            <div
              key={action}
              draggable
              onDragStart={() => setDraggedAction(action)}
              className="cursor-grab rounded-xl border border-border bg-secondary px-3 py-2 text-sm font-bold text-foreground active:cursor-grabbing"
            >
              {action}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}