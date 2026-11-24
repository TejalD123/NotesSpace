import { Globe, Camera, PenLine } from 'lucide-react';

const ICONS = { url: Globe, image: Camera, topic: PenLine };

export const sourceText = (note) => {
  if (note.inputType === 'url') {
    try {
      const u = new URL(note.source);
      return (u.hostname.replace(/^www\./, '') + u.pathname).replace(/\/$/, '');
    } catch {
      return note.source;
    }
  }
  return note.source;
};

export default function SourceBadge({ note, className = '' }) {
  const Icon = ICONS[note.inputType] || PenLine;
  return (
    <span className={`chip max-w-full ${className}`}>
      <Icon size={13} className="shrink-0" aria-hidden="true" />
      <span className="truncate">{sourceText(note)}</span>
    </span>
  );
}
