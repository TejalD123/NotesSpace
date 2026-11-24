import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const MESSAGES = {
  topic: [
    'Understanding your topic…',
    'Structuring sections…',
    'Adding highlights and callouts…',
    'Drawing diagrams…',
  ],
  url: [
    'Fetching the page…',
    'Reading the content…',
    'Structuring sections…',
    'Adding highlights and callouts…',
    'Drawing diagrams…',
  ],
  image: [
    'Reading your photo…',
    'Picking out the key content…',
    'Structuring sections…',
    'Adding highlights and callouts…',
  ],
};

export default function GeneratingState({ tab }) {
  const list = MESSAGES[tab] || MESSAGES.topic;
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => Math.min(n + 1, list.length - 1)), 3000);
    return () => clearInterval(t);
  }, [list]);

  return (
    <div className="card mt-4 p-5" role="status" aria-live="polite">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
          <Sparkles size={20} className="animate-pulse" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold">Creating your notes</p>
          <p className="text-sm text-muted">{list[i]}</p>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-tint">
        <div className="h-full w-1/3 animate-slide rounded-full bg-brand" />
      </div>
      <p className="mt-3 text-xs text-muted">This usually takes 10 to 40 seconds, depending on length.</p>
    </div>
  );
}
