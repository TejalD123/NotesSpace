import { TriangleAlert, X } from 'lucide-react';

export default function ErrorBanner({ title, message, onClose }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-warn-bar/30 bg-warn-bg px-4 py-3 text-warn-ink"
    >
      <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 text-sm">
        <p className="font-semibold">{title}</p>
        {message && <p className="mt-0.5">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss error" className="opacity-70 hover:opacity-100">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
