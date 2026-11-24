import { useEffect, useState } from 'react';
import { List } from 'lucide-react';

export default function NoteToc({ sections }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -65% 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  if (!sections.length) return null;

  return (
    <nav className="card p-4" aria-label="On this page">
      <div className="mb-2 flex items-center justify-between px-2 text-sm font-semibold">
        On this page
        <List size={16} className="text-muted" aria-hidden="true" />
      </div>
      <ul className="space-y-0.5">
        {sections.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => {
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActive(s.id);
              }}
              className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                active === s.id
                  ? 'bg-brand-soft font-medium text-brand-ink'
                  : 'text-muted hover:bg-tint hover:text-ink'
              }`}
            >
              {s.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
