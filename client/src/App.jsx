import { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { NotesProvider } from './context/NotesContext';
import { ToastProvider } from './context/ToastContext';
import useTheme from './hooks/useTheme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import History from './pages/History';
import NoteDetail from './pages/NoteDetail';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Ctrl/Cmd + K -> history madhe search focus
function GlobalShortcuts() {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate('/notes', { state: { focus: Date.now() } });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);
  return null;
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 pt-24 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">That page doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">
        Go to Generate
      </Link>
    </div>
  );
}

function Shell() {
  const { dark, toggle } = useTheme();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar dark={dark} onToggleTheme={toggle} />
      <main className="flex-1 pb-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<History />} />
          <Route path="/notes/:id" element={<NoteDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <NotesProvider>
          <ScrollToTop />
          <GlobalShortcuts />
          <Shell />
        </NotesProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}