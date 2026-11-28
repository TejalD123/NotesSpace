import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NotesContext';
import { modKey } from '../utils/format';

const Kbd = ({ children }) => (
  <kbd className="rounded-md bg-brand-soft px-1.5 py-0.5 font-mono text-xs text-brand-ink">
    {children}
  </kbd>
);

export default function Footer() {
  const { user } = useAuth();
  const { online, loading } = useNotes();

  return (
    <footer className="no-print mt-16 border-t border-line bg-surface/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-muted sm:px-6">
        <div className="hidden items-center gap-5 sm:flex">
          {user && (
            <>
              <span className="flex items-center gap-2">
                <Kbd>{modKey} K</Kbd> Search notes
              </span>
              <span className="flex items-center gap-2">
                <Kbd>{modKey} ↵</Kbd> Generate notes
              </span>
            </>
          )}
        </div>
        {user && (
          <span className="flex items-center gap-2" aria-live="polite">
            <span
              className={`h-2 w-2 rounded-full ${
                loading ? 'bg-slate-400' : online ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            {loading ? 'Connecting…' : online ? 'Connected to server' : 'Server offline'}
          </span>
        )}
      </div>
    </footer>
  );
}
