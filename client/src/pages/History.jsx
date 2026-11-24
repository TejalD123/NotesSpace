import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, FileText, Globe, Camera, Plus, RotateCcw, Search } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import { useToast } from '../context/ToastContext';
import NoteCard from '../components/NoteCard';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorBanner from '../components/ErrorBanner';
import { modKey } from '../utils/format';

const FILTERS = [
  { id: 'all', label: 'All sources' },
  { id: 'url', label: 'Links' },
  { id: 'image', label: 'Photos' },
  { id: 'topic', label: 'Topics' },
];

const SORTS = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  title: (a, b) => a.title.localeCompare(b.title),
};

function Stat({ Icon, value, label }) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div>
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function History() {
  const { notes, loading, error, refresh, remove } = useNotes();
  const toast = useToast();
  const location = useLocation();
  const searchRef = useRef(null);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Ctrl/Cmd+K se aalyavar search focus
  useEffect(() => {
    if (location.state?.focus) searchRef.current?.focus();
  }, [location.state]);

  const counts = useMemo(
    () => ({
      all: notes.length,
      url: notes.filter((n) => n.inputType === 'url').length,
      image: notes.filter((n) => n.inputType === 'image').length,
      topic: notes.filter((n) => n.inputType === 'topic').length,
    }),
    [notes]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes
      .filter((n) => filter === 'all' || n.inputType === filter)
      .filter(
        (n) =>
          !q ||
          [n.title, n.source, n.meta?.excerpt, n.meta?.keyPoint].some((f) => f?.toLowerCase().includes(q))
      )
      .sort(SORTS[sort]);
  }, [notes, query, filter, sort]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await remove(toDelete._id);
      toast.success('Note deleted');
      setToDelete(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setQuery('');
    setFilter('all');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your study notes</h1>
          <p className="mt-1.5 text-muted">Search, export or reopen every study sheet you've generated.</p>
        </div>
        <Link to="/" className="btn-primary">
          <Plus size={16} aria-hidden="true" />
          New note
        </Link>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorBanner title="Couldn't load your notes" message={error} />
          <button onClick={refresh} className="btn-soft mt-3">
            <RotateCcw size={16} /> Try again
          </button>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat Icon={BookOpen} value={counts.all} label="Total notes" />
        <Stat Icon={Globe} value={counts.url} label="From web links" />
        <Stat Icon={Camera} value={counts.image} label="From photos" />
        <Stat Icon={FileText} value={counts.topic} label="From topics" />
      </div>

      <div className="card mt-4 flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search notes</span>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search notes by title or source (${modKey} K)`}
            className="w-full rounded-lg bg-tint py-2.5 pl-10 pr-3 text-sm placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Filter by source" className="flex gap-1 rounded-lg bg-tint p-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.id ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink'
                }`}
              >
                {f.label} ({counts[f.id]})
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-muted">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg bg-tint px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/40"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A to Z</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-64 animate-pulse bg-tint" />
          ))}
        </div>
      ) : visible.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((n) => (
            <NoteCard key={n._id} note={n} onDelete={setToDelete} />
          ))}
        </div>
      ) : (
        !error && (
          <div className="card mt-6 flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
              <FileText size={26} aria-hidden="true" />
            </span>
            {notes.length === 0 ? (
              <>
                <h2 className="mt-5 text-lg font-semibold">No notes yet</h2>
                <p className="mt-1 max-w-sm text-sm text-muted">
                  Generate your first study sheet from a topic, a link or a photo.
                </p>
                <Link to="/" className="btn-primary mt-6">
                  <Plus size={16} /> Create your first note
                </Link>
              </>
            ) : (
              <>
                <h2 className="mt-5 text-lg font-semibold">No notes match your filter</h2>
                <p className="mt-1 max-w-sm text-sm text-muted">
                  Try a different keyword or clear the filters to see all your notes.
                </p>
                <button onClick={resetFilters} className="btn-soft mt-6">
                  <RotateCcw size={16} /> Reset filters
                </button>
              </>
            )}
          </div>
        )
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this note?"
        message={toDelete ? `"${toDelete.title}" will be permanently deleted. This can't be undone.` : ''}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setToDelete(null)}
      />
    </div>
  );
}
