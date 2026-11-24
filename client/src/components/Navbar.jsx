import { Link, NavLink } from "react-router-dom";
import { BookOpenCheck, Moon, Sun } from "lucide-react";
import { useNotes } from "../context/NotesContext";

const linkCls = ({ isActive }) =>
  `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-brand-soft text-brand-ink" : "text-muted hover:text-ink"
  }`;

export default function Navbar({ dark, onToggleTheme }) {
  const { notes } = useNotes();

  return (
    <header className="no-print sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 font-semibold">
          <img
            src="/logo.svg"
            alt="AI Notes Generator logo"
            className="h-9 w-9 rounded-lg object-contain"
          />
          <span className="hidden sm:inline">NotesSpace</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main">
          <NavLink to="/" end className={linkCls}>
            Generate
          </NavLink>
          <NavLink to="/notes" className={linkCls}>
            Note history
            {notes.length > 0 && (
              <span className="ml-2 rounded-full bg-brand-soft px-1.5 py-0.5 text-xs text-brand-ink">
                {notes.length}
              </span>
            )}
          </NavLink>
        </nav>

        <button
          onClick={onToggleTheme}
          className="btn-ghost h-9 w-9 !p-0"
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
