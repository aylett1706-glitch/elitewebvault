import { useState } from 'react';
import { Clapperboard, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AITrailerClipGenerator() {
  const [idea, setIdea] = useState('A cinematic teaser for a premium streaming platform, gold and purple lighting, dramatic camera movement');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const generate = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.GenerateVideo({ prompt: idea, duration: 6, aspect_ratio: '16:9' });
    setVideoUrl(res.url);
    setLoading(false);
    toast.success('AI clip generated');
  };
  return <section className="rounded-3xl border border-border bg-card p-5 elite-panel"><div className="mb-4 flex items-center gap-3"><Clapperboard className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-black">AI Trailer / Clip Generator</h2><p className="text-sm text-muted-foreground">Generate short promo clips for hero sections and collections.</p></div></div><textarea value={idea} onChange={e => setIdea(e.target.value)} className="min-h-24 w-full rounded-2xl border border-border bg-secondary p-3 text-sm text-foreground" /><button onClick={generate} disabled={loading || !idea.trim()} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Clip</button>{videoUrl && <video src={videoUrl} controls className="mt-4 w-full rounded-2xl border border-border" />}</section>;
}