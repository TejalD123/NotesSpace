export const DEPTHS = [
  { id: 'quick', label: 'Quick summary' },
  { id: 'comprehensive', label: 'Comprehensive study sheet' },
  { id: 'cram', label: 'Exam cram sheet' },
];

export default function DepthSelector({ value, onChange, disabled }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span id="depth-label" className="text-sm font-medium">
        Note style
      </span>
      <div role="radiogroup" aria-labelledby="depth-label" className="flex flex-wrap gap-2">
        {DEPTHS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={value === d.id}
            disabled={disabled}
            onClick={() => onChange(d.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              value === d.id
                ? 'bg-brand-soft text-brand-ink ring-1 ring-brand/40'
                : 'bg-tint text-muted hover:text-ink'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
