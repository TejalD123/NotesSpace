import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ExternalLink, Trash2 } from 'lucide-react';
import * as api from '../api/notesApi';
import { useNotes } from '../context/NotesContext';
import { useToast } from '../context/ToastContext';
import NoteContent from '../components/NoteContent';
import NoteToc from '../components/NoteToc';
import ExportButtons from '../components/ExportButtons';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorBanner from '../components/ErrorBanner';
import SourceBadge from '../components/SourceBadge';
import { extractSections } from '../utils/headings';
import { formatDate, SOURCE_LABEL } from '../utils/format';

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 text-right font-medium">{children}</dd>
    </div>
  );
}

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { remove } = useNotes();
  const sheetRef = useRef(null);

  const [note, setNote] = useState(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setNote(null);
    setError('');
    api
      .getNote(id)
      .then((n) => !cancelled && setNote(n))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (note) document.title = `${note.title} | NotesSpace`;
    return () => {
      document.title = 'NotesSpace';
    };
  }, [note]);

  const sections = useMemo(() => extractSections(note?.content), [note]);

  const doDelete = async () => {
    setDeleting(true);
    try {
      await remove(note._id);
      toast.success('Note deleted');
      navigate('/notes');
    } catch (e) {
      toast.error(e.message);
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-16">
        <ErrorBanner title="Couldn't open this note" message={error} />
        <Link to="/notes" className="btn-soft mt-4">
          Back to note history
        </Link>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6" aria-busy="true">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-tint" />
        <div className="card mt-6 h-[28rem] animate-pulse bg-tint" />
      </div>
    );
  }

  const { meta } = note;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <div className="no-print flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted">
            <Link to="/notes" className="hover:text-ink">
              Note history
            </Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span className="truncate text-ink">{note.title}</span>
          </nav>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
            <SourceBadge note={note} className="max-w-xs" />
            <span>
              Created {formatDate(note.createdAt)}, {meta.readMinutes} min read, {meta.words.toLocaleString()} words
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButtons note={note} sheetRef={sheetRef} />
          <button className="btn-ghost text-warn-ink" onClick={() => setConfirm(true)}>
            <Trash2 size={16} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article ref={sheetRef} className="card print-sheet min-w-0 p-6 sm:p-10">
          <NoteContent content={note.content} />
        </article>

        <aside className="no-print space-y-4 lg:sticky lg:top-24 lg:self-start">
          <NoteToc sections={sections} />
          <div className="card p-4">
            <h2 className="px-2 text-sm font-semibold">Note details</h2>
            <dl className="mt-1 divide-y divide-line px-2">
              <Row label="Source type">{SOURCE_LABEL[note.inputType]}</Row>
              <Row label="Source">
                {note.inputType === 'url' ? (
                  <a
                    href={note.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-1 text-brand-ink hover:underline"
                  >
                    <span className="truncate">Open page</span>
                    <ExternalLink size={13} className="shrink-0" />
                  </a>
                ) : (
                  <span className="break-words">{note.source}</span>
                )}
              </Row>
              <Row label="Length">
                {meta.words.toLocaleString()} words, {meta.readMinutes} min
              </Row>
              <Row label="Includes">
                {meta.callouts} callouts, {meta.diagrams} diagrams
              </Row>
            </dl>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Delete this note?"
        message={`"${note.title}" will be permanently deleted. This can't be undone.`}
        busy={deleting}
        onConfirm={doDelete}
        onCancel={() => !deleting && setConfirm(false)}
      />
    </div>
  );
}
