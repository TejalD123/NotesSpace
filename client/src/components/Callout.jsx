import { Info, Lightbulb, TriangleAlert, FlaskConical } from 'lucide-react';

const KINDS = {
  key: { label: 'Key point', Icon: Info, cls: 'bg-key-bg border-key-bar text-key-ink' },
  tip: { label: 'Memory aid', Icon: Lightbulb, cls: 'bg-tip-bg border-tip-bar text-tip-ink' },
  warning: {
    label: 'Common mistake',
    Icon: TriangleAlert,
    cls: 'bg-warn-bg border-warn-bar text-warn-ink',
  },
  example: {
    label: 'Worked example',
    Icon: FlaskConical,
    cls: 'bg-ex-bg border-ex-bar text-ex-ink',
  },
};

export default function Callout({ kind, children }) {
  const { label, Icon, cls } = KINDS[kind] || KINDS.key;
  return (
    <aside className={`callout my-5 rounded-xl border-l-4 px-5 py-4 ${cls}`}>
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <Icon size={16} aria-hidden="true" />
        {label}
      </div>
      <div className="text-sm leading-6">{children}</div>
    </aside>
  );
}
