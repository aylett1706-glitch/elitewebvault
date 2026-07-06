import { useState } from 'react';
import { supabaseApi, base44 } from '@/api/supabaseApi';
import { Check, Loader2, Plus, Radio, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function LiveAISearchPanel({ onAdded }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [added, setAdded] = useState(new Set());

  const searchSources = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);
    const response = await base44.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: `Find official, legal live TV sources for: "${query}".

Only include legitimate sources such as public broadcasters, official channel websites, FAST/free ad-supported TV channels, official YouTube live streams, or official embeddable players. Exclude pirate IPTV lists, cracked streams, adult content, malware sites, and unofficial rebroadcasts.

Prefer sources that can be watched in a web app using either a direct stream URL or a true embeddable player URL. Only use embed_url for real iframe/embed URLs such as YouTube embed links or provider player embeds. If only an official watch page is available, put it in stream_url, set source_type to stream, and explain in the description that it opens as an official source because it may block in-app playback.`,
      response_json_schema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
                country: { type: 'string' },
                logo_url: { type: 'string' },
                stream_url: { type: 'string' },
                embed_url: { type: 'string' },
                source_type: { type: 'string', enum: ['stream', 'embed'] }
              }
            }
          }
        }
      }
    });

    setResults((response?.results || []).filter(item => item.name && (item.stream_url || item.embed_url)));
    setLoading(false);
  };

  const addChannel = async (item) => {
    const payload = {
      name: item.name,
      description: item.description || '',
      category: item.category || 'General',
      country: item.country || '',
      logo_url: item.logo_url || '',
      stream_url: item.stream_url || '',
      embed_url: item.embed_url || '',
      source_type: item.embed_url && /\/embed\/|player\.|youtube\.com\/embed|twitch\.tv\/embed|vimeo\.com\/video/i.test(item.embed_url) ? 'embed' : 'stream',
      status: 'approved'
    };

    const created = await base44.entities.LiveChannel.create(payload);
    setAdded(prev => new Set([...prev, item.name]));
    toast.success(`${item.name} added to Live TV`);
    onAdded(created);
  };

  return (
    <section className="rounded-3xl border border-primary/20 bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-foreground">AI Find Live TV Sources</h3>
      </div>

      <form onSubmit={searchSources} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Australian news, kids channels, sports highlights, music TV"
          className="flex-1 rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
        />
        <button disabled={loading || !query.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Searching...' : 'Find Sources'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {results.map((item, index) => {
            const isAdded = added.has(item.name);
            return (
              <div key={`${item.name}-${index}`} className="rounded-2xl border border-border bg-secondary p-4">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card">
                    {item.logo_url ? <img src={item.logo_url} alt={item.name} className="h-full w-full object-contain p-1" /> : <Radio className="h-6 w-6 text-primary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category || 'General'} {item.country ? `• ${item.country}` : ''}</p>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => !isAdded && addChannel(item)}
                  className={`mt-3 inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold ${isAdded ? 'bg-green-500/20 text-green-400' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                >
                  {isAdded ? <><Check className="h-3.5 w-3.5" /> Added</> : <><Plus className="h-3.5 w-3.5" /> Add Channel</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}