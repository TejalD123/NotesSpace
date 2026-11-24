import { Link } from 'react-router-dom';
import { ArrowRight, Copy, Download, Trash2 } from 'lucide-react';
import * as api from '../api/notesApi';
import { useToast } from '../context/ToastContext';
import { downloadMarkdown } from '../utils/exportNote';
import { formatDate } from '../utils/format';
import SourceBadge from './SourceBadge';

export default function NoteCard({ note, onDelete }) {
  const toast = useToast();
  const { meta } = note;

  const withContent = (fn, okMsg) => async () => {
    try {
      const full = await api.getNote(note._id);
      await fn(full);
      if (okMsg) toast.success(okMsg);
    } catch (e) {
      toast.error(e.message || 'Something went wrong');
    }
  };

  return (
    <article className="card flex flex-col p-5 transition-shadow hover:shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <SourceBadge note={note} className="max-w-[80%]" />
        <button
          onClick={() => onDelete(note)}
          className="btn-ghost -mr-2 -mt-1 h-8 w-8 !p-0 hover:!text-warn-ink"
          aria-label={`Delete ${note.title}`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug">
        <Link to={`/notes/${note._id}`} className="hover:text-brand-ink">
          {note.title}
        </Link>
      </h3>

      {meta?.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{meta.excerpt}</p>}

      {meta?.keyPoint && (
        <p className="mt-3 line-clamp-1 rounded-lg border-l-4 border-key-bar bg-key-bg px-3 py-2 text-xs text-key-ink">
          {meta.keyPoint}
        </p>
      )}

      <div className="mt-auto pt-5">
        <p className="text-xs text-muted">Created {formatDate(note.createdAt)}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xs text-muted">
            {meta?.callouts || 0} callouts, {meta?.diagrams || 0} diagrams, {meta?.readMinutes || 1} min read
          </p>
          <div className="flex items-center gap-1">
            <button
              className="btn-ghost h-8 w-8 !p-0"
              aria-label="Download Markdown"
              onClick={withContent((n) => downloadMarkdown(n.title, n.content), 'Markdown downloaded')}
            >
              <Download size={16} />
            </button>
            <button
              className="btn-ghost h-8 w-8 !p-0"
              aria-label="Copy Markdown"
              onClick={withContent((n) => navigator.clipboard.writeText(n.content), 'Markdown copied')}
            >
              <Copy size={16} />
            </button>
            <Link
              to={`/notes/${note._id}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand-ink hover:opacity-80"
              aria-label={`Open ${note.title}`}
            >
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
