import { useState } from 'react';
import { Highlighter, Palette, Workflow } from 'lucide-react';
import GenerateCard from '../components/GenerateCard';

const SUGGESTIONS = [
  'Quantum computing and superposition',
  'CRISPR-Cas9 mechanism',
  'Macroeconomics: fiscal vs monetary policy',
  'Neurotransmitters and synapses',
  'How HTTPS and TLS work',
  'Causes of the French Revolution',
];

function FeatureCard({ Icon, title, children, text }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
          <Icon size={18} aria-hidden="true" />
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="mt-4 rounded-xl bg-tint p-4 text-sm leading-6">{children}</div>
      <p className="mt-3 text-xs text-muted">{text}</p>
    </div>
  );
}

export default function Home() {
  const [prefill, setPrefill] = useState(null);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="mx-auto max-w-3xl pt-12 text-center sm:pt-16">
        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
          Turn any topic, link or photo into study notes
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Type a topic, paste a page link, or upload a photo of a textbook page. You get structured notes
          with highlights, colored callouts and diagrams, ready to revise or export.
        </p>
      </section>

      <section className="mx-auto mt-10 max-w-3xl">
        <GenerateCard prefill={prefill} />

        <div className="mt-8">
          <p className="mb-3 text-sm font-medium">Try one of these</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setPrefill({ text: s, at: Date.now() })}
                className="rounded-lg bg-tint px-3 py-2 text-sm text-muted transition-colors hover:bg-brand-soft hover:text-brand-ink"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3" aria-label="What your notes include">
        <FeatureCard
          Icon={Highlighter}
          title="Smart highlights"
          text="Key terms are marked so you can scan a page in seconds."
        >
          The <mark className="rounded bg-mark px-1 font-medium text-[#1a1a1a]">Krebs cycle</mark> produces 2 ATP, 6
          NADH and 2 FADH2 per molecule of glucose.
        </FeatureCard>
        <FeatureCard
          Icon={Palette}
          title="Color callouts"
          text="Key points, memory aids, common mistakes and worked examples get their own color."
        >
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <span className="rounded-md border-l-4 border-key-bar bg-key-bg px-2 py-1.5 text-key-ink">Key point</span>
            <span className="rounded-md border-l-4 border-tip-bar bg-tip-bg px-2 py-1.5 text-tip-ink">Memory aid</span>
            <span className="rounded-md border-l-4 border-warn-bar bg-warn-bg px-2 py-1.5 text-warn-ink">Common mistake</span>
            <span className="rounded-md border-l-4 border-ex-bar bg-ex-bg px-2 py-1.5 text-ex-ink">Worked example</span>
          </div>
        </FeatureCard>
        <FeatureCard
          Icon={Workflow}
          title="Auto diagrams"
          text="Processes, cycles and hierarchies are drawn for you as flowcharts and mind maps."
        >
          <svg viewBox="0 0 260 44" className="w-full" role="img" aria-label="Flowchart: Input, Notes, Export">
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x={i * 90 + 2} y="8" width="76" height="28" rx="8" fill="rgb(var(--brand-soft))" stroke="rgb(var(--brand))" />
                <text x={i * 90 + 40} y="26" textAnchor="middle" fontSize="11" fill="rgb(var(--brand-ink))" fontFamily="Inter, sans-serif">
                  {['Input', 'Notes', 'Export'][i]}
                </text>
                {i < 2 && <path d={`M${i * 90 + 78} 22h12`} stroke="rgb(var(--muted))" strokeWidth="1.5" />}
              </g>
            ))}
          </svg>
        </FeatureCard>
      </section>
    </div>
  );
}
