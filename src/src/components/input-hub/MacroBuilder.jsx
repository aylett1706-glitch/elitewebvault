import { useState } from 'react';
import { Plus, Zap, Trash2 } from 'lucide-react';

const macroTypes = ['combo', 'mmo', 'rapid_fire', 'auto_repeat', 'radial_menu', 'stream_hotkey'];

export default function MacroBuilder({ macros, setMacros }) {
  const [draft, setDraft] = useState({ name: '', type: 'combo', sequence: 'A, wait 100ms, B, RT' });

  const addMacro = () => {
    if (!draft.name.trim()) return;
    setMacros(prev => [...prev, { ...draft, id: crypto.randomUUID(), created_at: new Date().toISOString() }]);
    setDraft({ name: '', type: 'combo', sequence: 'A, wait 100ms, B, RT' });
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5" aria-labelledby="macro-title">
      <div className="mb-4 flex items-center gap-3">
        <Zap className="h-6 w-6 text-primary" aria-hidden="true" />
        <div>
          <h2 id="macro-title" className="text-xl font-black text-foreground">Advanced Macros</h2>
          <p className="text-sm text-muted-foreground">Create combos, MMO sequences, rapid fire, auto-repeat and stream hotkeys.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <label className="md:col-span-1 text-sm font-bold text-foreground">Macro name
          <input value={draft.name} onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))} className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground" placeholder="Fortnite build combo" />
        </label>
        <label className="text-sm font-bold text-foreground">Type
          <select value={draft.type} onChange={(e) => setDraft(prev => ({ ...prev, type: e.target.value }))} className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground">
            {macroTypes.map(type => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
          </select>
        </label>
        <label className="md:col-span-2 text-sm font-bold text-foreground">Timed sequence
          <input value={draft.sequence} onChange={(e) => setDraft(prev => ({ ...prev, sequence: e.target.value }))} className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground" />
        </label>
      </div>
      <button onClick={addMacro} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground"><Plus className="h-4 w-4" /> Add macro</button>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {macros.map(macro => (
          <div key={macro.id} className="rounded-2xl border border-border bg-secondary/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-foreground">{macro.name}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{macro.type.replace('_', ' ')}</p>
              </div>
              <button aria-label={`Delete macro ${macro.name}`} onClick={() => setMacros(prev => prev.filter(item => item.id !== macro.id))} className="rounded-lg p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{macro.sequence}</p>
          </div>
        ))}
      </div>
    </section>
  );
}