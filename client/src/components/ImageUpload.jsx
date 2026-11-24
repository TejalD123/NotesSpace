import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;

export default function ImageUpload({ file, onChange, onError, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!file) return setPreview('');
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (f) => {
    if (!f) return;
    if (!ALLOWED.includes(f.type)) return onError('Use a JPG, PNG, WEBP or GIF image.');
    if (f.size > MAX_BYTES) return onError('That image is over 5 MB. Choose a smaller one.');
    onError('');
    onChange(f);
  };

  if (file) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-line bg-tint p-3">
        <img src={preview} alt="Selected page" className="h-24 w-24 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted">{(file.size / 1024).toFixed(0)} KB</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={disabled}
          className="btn-ghost h-9 w-9 !p-0"
          aria-label="Remove image"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) pick(e.dataTransfer.files?.[0]);
      }}
      className={`rounded-xl border-2 border-dashed transition-colors ${
        dragging ? 'border-brand bg-brand-soft' : 'border-line bg-tint'
      }`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 px-6 py-10 text-center"
      >
        <ImagePlus size={28} className="text-brand-ink" aria-hidden="true" />
        <span className="text-sm font-medium">Drop a photo of your page here, or click to browse</span>
        <span className="text-xs text-muted">JPG, PNG, WEBP or GIF, up to 5 MB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(',')}
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
