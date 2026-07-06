import { useEffect, useMemo, useState } from 'react';
import { Headphones, Pause, Play, Square } from 'lucide-react';

const buildSpeechText = (book) => [
  book?.title,
  book?.authors?.length ? `By ${book.authors.join(', ')}.` : '',
  book?.description,
  book?.categories?.length ? `Topics include ${book.categories.slice(0, 8).join(', ')}.` : ''
].filter(Boolean).join('\n\n');

export default function BookListenPanel({ book }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState('');
  const [rate, setRate] = useState(0.92);
  const speechText = useMemo(() => buildSpeechText(book), [book]);
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!canSpeak) return undefined;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [canSpeak]);

  const startSpeech = () => {
    if (!canSpeak || !speechText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = rate;
    utterance.pitch = 1;
    const selectedVoice = voices.find(voice => voice.name === voiceName);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    setPaused(false);
  };

  const pauseSpeech = () => {
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const resumeSpeech = () => {
    window.speechSynthesis.resume();
    setPaused(false);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  return (
    <section className="mb-5 rounded-3xl border border-primary/20 bg-primary/10 p-5">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-foreground"><Headphones className="h-5 w-5 text-primary" /> Listen in app</h2>
      {book?.audiobook_url ? (
        <audio controls src={book.audiobook_url} className="w-full" />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">No audiobook file is attached yet, so EliteVault can read the available book details aloud inside the app.</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-xs font-bold text-muted-foreground">
              Reader voice
              <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground">
                <option value="">Default voice</option>
                {voices.map(voice => <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs font-bold text-muted-foreground">
              Speed: {rate.toFixed(1)}x
              <input type="range" min="0.5" max="1.6" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-primary" />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {!speaking ? (
              <button type="button" onClick={startSpeech} disabled={!canSpeak || !speechText} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground disabled:opacity-50">
                <Play className="h-4 w-4" /> Start listening
              </button>
            ) : paused ? (
              <button type="button" onClick={resumeSpeech} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground">
                <Play className="h-4 w-4" /> Resume
              </button>
            ) : (
              <button type="button" onClick={pauseSpeech} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-black text-foreground hover:border-primary/50">
                <Pause className="h-4 w-4" /> Pause
              </button>
            )}
            {speaking && (
              <button type="button" onClick={stopSpeech} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-black text-foreground hover:border-primary/50">
                <Square className="h-4 w-4" /> Stop
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}