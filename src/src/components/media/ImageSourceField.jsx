import { useRef, useState } from 'react';
import { supabaseApi, base44 } from '@/api/supabaseApi';
import { Clipboard, Copy, Crop, Download, Image, Link2, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { toDisplayImageUrl } from '@/components/vault/imageUrl';
import ImageCropperModal from '@/components/media/ImageCropperModal';

const extractImageUrl = (input) => {
  const value = String(input || '').trim().replace(/["'\\]/g, '');
  if (!value) return '';

  const encodedMatch = value.match(/[?&](?:mediaurl|imgurl|r|url)=([^&]+)/i);
  if (encodedMatch?.[1]) return decodeURIComponent(encodedMatch[1]);

  const directMatch = value.match(/https?:\/\/[^\s&]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s]*)?/i);
  if (directMatch?.[0]) return directMatch[0];

  return value;
};

const previewImageUrl = (input) => {
  const url = extractImageUrl(input);
  if (url.includes('bing.com') || url.includes('aznude.com')) return url;
  return toDisplayImageUrl(url, 420, 560);
};

const aspectToRatio = (aspect) => {
  if (aspect === 'aspect-video') return 16 / 9;
  const arbitraryMatch = String(aspect || '').match(/aspect-\[(\d+)\/(\d+)\]/);
  if (arbitraryMatch) return Number(arbitraryMatch[1]) / Number(arbitraryMatch[2]);
  if (aspect?.includes('3/4')) return 3 / 4;
  if (aspect?.includes('4/3')) return 4 / 3;
  return 1;
};

export default function ImageSourceField({ label, value, onChange, helper, aspect = 'aspect-video' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [loadingEditor, setLoadingEditor] = useState(false);

  const uploadCroppedFile = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    toast.success('Cropped picture uploaded');
    setUploading(false);
    setCropFile(null);
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCropFile(file);
    event.target.value = '';
  };

  const importRemoteImage = async () => {
    if (!value) return;
    setImporting(true);
    const res = await base44.functions.invoke('importRemoteImage', { url: value });
    onChange(res.data.file_url);
    toast.success('Image saved to your app');
    setImporting(false);
  };

  const copyImageUrl = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success('Image URL copied');
  };

  const pasteImage = async () => {
    if (!document.hasFocus()) {
      toast.error('Click inside the app, then try Paste again');
      return;
    }

    try {
      if (navigator.clipboard?.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find(type => type.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            setCropFile(new File([blob], `pasted-${Date.now()}.png`, { type: imageType }));
            toast.success('Pasted image ready to crop');
            return;
          }
        }
      }
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(extractImageUrl(text));
        toast.success('Image URL pasted');
      }
    } catch {
      toast.error('Paste was blocked by the browser. Use the URL field instead.');
    }
  };

  const editCurrentImage = async () => {
    if (!value) return;
    setLoadingEditor(true);
    const response = await fetch(previewImageUrl(value));
    const blob = await response.blob();
    setCropFile(new File([blob], `edit-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' }));
    setLoadingEditor(false);
  };

  return (
    <>
    {cropFile && (
      <ImageCropperModal
        file={cropFile}
        aspectRatio={aspectToRatio(aspect)}
        onCancel={() => setCropFile(null)}
        onCrop={uploadCroppedFile}
      />
    )}
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
          {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={editCurrentImage}
            disabled={loadingEditor || !value}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            {loadingEditor ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crop className="h-3.5 w-3.5" />}
            Edit Image
          </button>
          <button
            type="button"
            onClick={copyImageUrl}
            disabled={!value}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
          <button
            type="button"
            onClick={pasteImage}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10"
          >
            <Clipboard className="h-3.5 w-3.5" />
            Paste
          </button>
          <button
            type="button"
            onClick={importRemoteImage}
            disabled={importing || !value}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Save URL Image
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Upload
          </button>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      <div className="grid gap-3 md:grid-cols-[160px_1fr]">
        <button type="button" onClick={value ? editCurrentImage : () => inputRef.current?.click()} className={`${aspect} group relative overflow-hidden rounded-xl border border-border bg-secondary text-left`}>
          {value ? (
            <>
              <img src={previewImageUrl(value)} alt={label} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-black text-white opacity-0 transition-opacity group-hover:opacity-100">
                Click to crop
              </span>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </button>
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(extractImageUrl(e.target.value))}
            placeholder="Paste direct image URL, Bing image result, or upload a file..."
            className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
          />
        </div>
      </div>
    </div>
    </>
  );
}