import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const parseM3U = (text) => {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const channels = [];

  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].startsWith('#EXTINF')) continue;
    const info = lines[i];
    const streamUrl = lines[i + 1]?.startsWith('#') ? '' : lines[i + 1];
    if (!streamUrl) continue;

    const name = info.split(',').pop()?.trim() || 'Live Channel';
    const logo = info.match(/tvg-logo="([^"]+)"/)?.[1] || '';
    const group = info.match(/group-title="([^"]+)"/)?.[1] || 'General';

    channels.push({
      name,
      logo_url: logo,
      category: group,
      stream_url: streamUrl,
      source_type: 'm3u',
      status: 'approved'
    });
  }

  return channels;
};

export default function M3UImportPanel({ onImported }) {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistText, setPlaylistText] = useState('');
  const [importing, setImporting] = useState(false);

  const importPlaylist = async () => {
    setImporting(true);
    const text = playlistText.trim() || await fetch(playlistUrl).then(res => res.text());
    const channels = parseM3U(text).slice(0, 100);
    if (channels.length === 0) {
      setImporting(false);
      toast.error('No channels found in that playlist');
      return;
    }
    const created = await base44.entities.LiveChannel.bulkCreate(channels);
    setPlaylistText('');
    setPlaylistUrl('');
    setImporting(false);
    toast.success(`${channels.length} channels imported`);
    onImported(created);
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-foreground">Import M3U Playlist</h3>
      </div>
      <div className="space-y-3">
        <input value={playlistUrl} onChange={(e) => setPlaylistUrl(e.target.value)} placeholder="Playlist URL" className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" />
        <textarea value={playlistText} onChange={(e) => setPlaylistText(e.target.value)} placeholder="Or paste M3U playlist text here" rows={5} className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" />
        <button onClick={importPlaylist} disabled={importing || (!playlistUrl.trim() && !playlistText.trim())} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {importing ? 'Importing...' : 'Import Playlist'}
        </button>
      </div>
    </section>
  );
}