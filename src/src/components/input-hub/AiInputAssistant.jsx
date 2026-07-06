import { useState } from 'react';
import { supabaseApi, base44 } from '@/api/supabaseApi';
import { Brain, Loader2, Sparkles } from 'lucide-react';

export default function AiInputAssistant({ profile, setProfile }) {
  const [prompt, setPrompt] = useState('Optimize controls for Fortnite building');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);

  const optimize = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create an input profile optimization for: ${prompt}. Current profile: ${JSON.stringify(profile)}. Return practical game controls for binds, sensitivity, macros, accessibility and touch/gyro if useful.`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          binds: { type: 'object' },
          sensitivity: { type: 'object' },
          macros: { type: 'array', items: { type: 'object' } },
          accessibility: { type: 'object' }
        }
      }
    });
    setAdvice(result);
    setLoading(false);
  };

  const applyAdvice = () => {
    if (!advice) return;
    setProfile(prev => ({
      ...prev,
      binds: { ...prev.binds, ...(advice.binds || {}) },
      sensitivity: { ...prev.sensitivity, ...(advice.sensitivity || {}) },
      macros: [...(prev.macros || []), ...(advice.macros || []).map(item => ({ ...item, id: crypto.randomUUID() }))],
      accessibility: { ...prev.accessibility, ...(advice.accessibility || {}) }
    }));
  };

  return (
    <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-5" aria-labelledby="ai-input-title">
      <div className="mb-4 flex items-center gap-3">
        <Brain className="h-6 w-6 text-primary" aria-hidden="true" />
        <div>
          <h2 id="ai-input-title" className="text-xl font-black text-foreground">AI Input Assistant</h2>
          <p className="text-sm text-muted-foreground">Generate binds, macros, sensitivity and accessibility layouts from plain language.</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="sr-only" htmlFor="ai-input-prompt">AI input request</label>
        <input id="ai-input-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground" />
        <button onClick={optimize} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Optimize
        </button>
      </div>
      {advice && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-card/80 p-4">
          <p className="text-sm text-muted-foreground">{advice.summary}</p>
          <button onClick={applyAdvice} className="mt-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-black text-primary hover:bg-primary/20">Apply to active profile</button>
        </div>
      )}
    </section>
  );
}
