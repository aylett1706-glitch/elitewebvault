import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Search } from 'lucide-react';

export default function VoiceSearchTool() {
  const [query, setQuery] = useState('');
  const listen = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setQuery('Voice search is not supported in this browser'); return; }
    const recognition = new Recognition();
    recognition.onresult = event => setQuery(event.results[0][0].transcript);
    recognition.start();
  };
  return <section className="rounded-3xl border border-border bg-card p-5 elite-panel"><div className="mb-4 flex items-center gap-3"><Mic className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-black">Voice Search</h2><p className="text-sm text-muted-foreground">Speak a title, actor, mood, or genre.</p></div></div><div className="flex gap-3"><button onClick={listen} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground"><Mic className="h-4 w-4" /> Listen</button><input value={query} onChange={e => setQuery(e.target.value)} className="flex-1 rounded-2xl border border-border bg-secondary px-3 text-sm text-foreground" /></div>{query && <Link to={`/search?q=${encodeURIComponent(query)}`} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm font-black text-foreground"><Search className="h-4 w-4" /> Search for “{query}”</Link>}</section>;
}