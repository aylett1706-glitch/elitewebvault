import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';

const cropFileToAspect = (file, { aspectRatio, zoom, offsetX, offsetY, tileImage }) => new Promise((resolve, reject) => {
  const image = new window.Image();
  const url = URL.createObjectURL(file);

  image.onload = () => {
    const outputWidth = 1200;
    const outputHeight = Math.round(outputWidth / aspectRatio);
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');

    const baseScale = Math.min(outputWidth / image.width, outputHeight / image.height);
    const scale = baseScale * zoom;
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const maxX = Math.max(0, (drawWidth - outputWidth) / 2);
    const maxY = Math.max(0, (drawHeight - outputHeight) / 2);
    const x = (outputWidth - drawWidth) / 2 + (offsetX / 100) * maxX;
    const y = (outputHeight - drawHeight) / 2 + (offsetY / 100) * maxY;

    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    if (tileImage) {
      for (let drawX = x - drawWidth; drawX < outputWidth + drawWidth; drawX += drawWidth) {
        for (let drawY = y - drawHeight; drawY < outputHeight + drawHeight; drawY += drawHeight) {
          ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
        }
      }
    } else {
      ctx.drawImage(image, x, y, drawWidth, drawHeight);
    }

    canvas.toBlob((blob) => {
      URL.revokeObjectURL(url);
      if (!blob) {
        reject(new Error('Could not crop image'));
        return;
      }
      resolve(new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.92);
  };

  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('Could not load image'));
  };

  image.src = url;
});

export default function ImageCropperModal({ file, aspectRatio = 1, onCancel, onCrop }) {
  const [cropAspectRatio, setCropAspectRatio] = useState(aspectRatio);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [tileImage, setTileImage] = useState(false);
  const [dragCrop, setDragCrop] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [saving, setSaving] = useState(false);
  const previewUrlRef = useRef('');
  const dragRef = useRef(null);

  const previewUrl = useMemo(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = URL.createObjectURL(file);
    return previewUrlRef.current;
  }, [file]);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  useEffect(() => {
    const image = new window.Image();
    image.onload = () => setImageSize({ width: image.width, height: image.height });
    image.src = previewUrl;
  }, [previewUrl]);

  const imageRatio = imageSize.width / imageSize.height;
  const previewStyle = {
    aspectRatio: cropAspectRatio,
    backgroundImage: `url(${previewUrl})`,
    backgroundSize: imageRatio > cropAspectRatio ? `${zoom * 100}% auto` : `auto ${zoom * 100}%`,
    backgroundPosition: `${50 + offsetX / 2}% ${50 + offsetY / 2}%`,
    backgroundRepeat: tileImage ? 'repeat' : 'no-repeat'
  };

  const startDrag = (event) => {
    event.preventDefault();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX,
      offsetY
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!dragRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextX = dragRef.current.offsetX + ((event.clientX - dragRef.current.startX) / bounds.width) * 200;
    const nextY = dragRef.current.offsetY + ((event.clientY - dragRef.current.startY) / bounds.height) * 200;
    setOffsetX(Math.max(-100, Math.min(100, nextX)));
    setOffsetY(Math.max(-100, Math.min(100, nextY)));
  };

  const stopDrag = () => {
    dragRef.current = null;
  };

  const handleCrop = async () => {
    setSaving(true);
    const croppedFile = await cropFileToAspect(file, { aspectRatio: cropAspectRatio, zoom, offsetX, offsetY, tileImage });
    await onCrop(croppedFile);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-primary/20 bg-card p-5 shadow-2xl shadow-black/60">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground">Crop image</h2>
            <p className="text-sm text-muted-foreground">Drag the image to position it, zoom far in or out, then save.</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-xl bg-secondary p-2 text-muted-foreground hover:text-foreground" aria-label="Close crop editor">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {[
            ['Landscape', 16 / 9],
            ['Portrait', 3 / 4],
            ['Square', 1]
          ].map(([label, ratio]) => (
            <button
              key={label}
              type="button"
              onClick={() => setCropAspectRatio(ratio)}
              className={`rounded-xl border px-3 py-2 text-xs font-black ${cropAspectRatio === ratio ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className={`${dragCrop ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} touch-none select-none overflow-hidden rounded-2xl border border-border bg-secondary bg-center`}
          style={previewStyle}
          onPointerDown={dragCrop ? startDrag : undefined}
          onPointerMove={dragCrop ? moveDrag : undefined}
          onPointerUp={dragCrop ? stopDrag : undefined}
          onPointerCancel={dragCrop ? stopDrag : undefined}
        />

        <div className="mt-5 space-y-4">
          <label className="block text-sm font-bold text-foreground">
            Zoom
            <input type="range" min="0.25" max="8" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-2 w-full accent-primary" />
          </label>
          <label className="block text-sm font-bold text-foreground">
            Move left / right
            <input type="range" min="-100" max="100" step="1" value={offsetX} onChange={(e) => setOffsetX(Number(e.target.value))} className="mt-2 w-full accent-primary" />
          </label>
          <label className="block text-sm font-bold text-foreground">
            Move up / down
            <input type="range" min="-100" max="100" step="1" value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} className="mt-2 w-full accent-primary" />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <input type="checkbox" checked={dragCrop} onChange={(e) => setDragCrop(e.target.checked)} className="h-4 w-4 accent-primary" />
            Drag crop image
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <input type="checkbox" checked={tileImage} onChange={(e) => setTileImage(e.target.checked)} className="h-4 w-4 accent-primary" />
            Repeat image as pattern
          </label>
        </div>

        <div className="sticky bottom-0 -mx-5 mt-5 flex gap-3 border-t border-border bg-card px-5 pt-4 pb-1">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-muted-foreground hover:text-foreground">Cancel</button>
          <button type="button" onClick={handleCrop} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-black text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save cropped image
          </button>
        </div>
      </div>
    </div>
  );
}
