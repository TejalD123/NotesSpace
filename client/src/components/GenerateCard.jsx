import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Link2, ScanLine, Sparkles } from 'lucide-react';
import * as api from '../api/notesApi';
import { useNotes } from '../context/NotesContext';
import { useToast } from '../context/ToastContext';
import { modKey } from '../utils/format';
import DepthSelector from './DepthSelector';
import ImageUpload from './ImageUpload';
import ErrorBanner from './ErrorBanner';
import GeneratingState from './GeneratingState';

const TABS = [
  { id: 'topic', label: 'Topic / Prompt', Icon: BookOpen },
  { id: 'url', label: 'Web page link', Icon: Link2 },
  { id: 'image', label: 'Photo / Scan', Icon: ScanLine, badge: 'Vision' },
];

const MAX_TOPIC = 500;

export default function GenerateCard({ prefill }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh } = useNotes();

  const [tab, setTab] = useState('topic');
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [depth, setDepth] = useState('comprehensive');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // "Try one of these" chip click -> topic fill
  useEffect(() => {
    if (prefill?.text) {
      setTab('topic');
      setTopic(prefill.text.slice(0, MAX_TOPIC));
      setError(null);
    }
  }, [prefill]);

  const fail = (title, message) => setError({ title, message });

  const submit = useCallback(async () => {
    if (loading) return;
    setError(null);

    try {
      let call;
      if (tab === 'topic') {
        const t = topic.trim();
        if (!t) return fail('Enter a topic first', 'Describe what you want notes on, e.g. "Photosynthesis".');
        call = () => api.createFromTopic(t, depth);
      } else if (tab === 'url') {
        let u = url.trim();
        if (!u) return fail('Paste a link first', 'Add the address of the page you want notes from.');
        if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
        try {
          new URL(u);
        } catch {
          return fail('That link looks invalid', 'Check the address and try again.');
        }
        call = () => api.createFromUrl(u, depth);
      } else {
        if (!file) return fail('Add a photo first', 'Choose or drop an image of the page.');
        call = () => api.createFromImage(file, depth);
      }

      setLoading(true);
      const note = await call();
      refresh();
      toast.success(`Notes ready: ${note.title}`);
      navigate(`/notes/${note._id}`);
    } catch (e) {
      fail("Couldn't generate notes", e.message);
      setLoading(false);
    }
  }, [loading, tab, topic, url, file, depth, refresh, toast, navigate]);

  // Ctrl/Cmd + Enter
  const submitRef = useRef(submit);
  submitRef.current = submit;
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        submitRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const inputCls =
    'w-full rounded-xl border border-transparent bg-tint px-4 py-3 text-base placeholder:text-muted/70 focus:border-brand focus:outline-none disabled:opacity-60';

  return (
    <>
      <div className="card p-4 sm:p-6">
        <div role="tablist" aria-label="Input type" className="mb-5 grid grid-cols-3 gap-1 rounded-xl bg-tint p-1">
          {TABS.map(({ id, label, Icon, badge }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              disabled={loading}
              onClick={() => {
                setTab(id);
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors ${
                tab === id ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              <span className="truncate">{label}</span>
              {badge && (
                <span className="hidden rounded-full bg-tip-bg px-2 py-0.5 text-[11px] font-semibold text-tip-ink sm:inline">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'topic' && (
          <div>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={MAX_TOPIC}
              rows={4}
              disabled={loading}
              aria-label="Topic or prompt"
              placeholder="e.g. Explain the Central Dogma of Molecular Biology with transcription and translation stages, key enzymes, and clinical significance"
              className={`${inputCls} resize-none`}
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted">
              <span>The more specific you are, the sharper the notes.</span>
              <span className="font-mono">
                {topic.length} / {MAX_TOPIC}
              </span>
            </div>
          </div>
        )}

        {tab === 'url' && (
          <div>
            <input
              type="text"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              aria-label="Web page link"
              placeholder="https://en.wikipedia.org/wiki/Photosynthesis"
              className={inputCls}
            />
            <p className="mt-2 text-xs text-muted">
              Works with public pages that have readable text. Pages behind a login won't work.
            </p>
          </div>
        )}

        {tab === 'image' && <ImageUpload file={file} onChange={setFile} onError={(m) => (m ? fail('Image not accepted', m) : setError(null))} disabled={loading} />}

        <div className="mt-5">
          <DepthSelector value={depth} onChange={setDepth} disabled={loading} />
        </div>

        {error && (
          <div className="mt-5">
            <ErrorBanner title={error.title} message={error.message} onClose={() => setError(null)} />
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-4">
          <span className="hidden text-xs text-muted sm:inline">{modKey} + Enter</span>
          <button onClick={submit} disabled={loading} className="btn-primary px-6 py-3 text-base">
            <Sparkles size={18} aria-hidden="true" />
            {loading ? 'Generating…' : 'Generate notes'}
          </button>
        </div>
      </div>

      {loading && <GeneratingState tab={tab} />}
    </>
  );
}
