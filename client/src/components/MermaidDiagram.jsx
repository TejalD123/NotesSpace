import { useEffect, useId, useState } from 'react';

let mermaidPromise;
const loadMermaid = () => {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        fontFamily: 'Inter, system-ui, sans-serif',
        htmlLabels: false, // SVG text -> PDF/image export madhe barobar yeto
        flowchart: { htmlLabels: false, curve: 'basis' },
        themeVariables: {
          primaryColor: '#ece9ff',
          primaryBorderColor: '#3525cd',
          primaryTextColor: '#12122b',
          lineColor: '#6b6b8d',
          secondaryColor: '#e6f7f0',
          tertiaryColor: '#fff7e6',
        },
      });
      return mermaid;
    });
  }
  return mermaidPromise;
};

// Diagram card hamesha light surface var (dark mode madhe pan) -> export consistent
export default function MermaidDiagram({ chart }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const id = `mmd-${uid}-${Math.random().toString(36).slice(2, 7)}`;
    setSvg('');
    setFailed(false);

    loadMermaid()
      .then((m) => m.render(id, chart))
      .then(({ svg: out }) => {
        if (!cancelled) setSvg(out);
      })
      .catch(() => {
        document.getElementById(`d${id}`)?.remove(); // mermaid error element cleanup
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [chart, uid]);

  return (
    <figure className="diagram-card my-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <figcaption className="border-b border-slate-100 px-4 py-2 text-xs font-medium text-slate-500">
        Diagram
      </figcaption>
      <div className="overflow-x-auto p-4">
        {failed ? (
          <>
            <p className="mb-2 text-sm text-slate-600">This diagram couldn't be drawn. Source:</p>
            <pre className="overflow-x-auto rounded-lg bg-slate-100 p-3 font-mono text-xs text-slate-700">
              {chart}
            </pre>
          </>
        ) : svg ? (
          <div
            className="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="h-32 animate-pulse rounded-lg bg-slate-100" aria-label="Drawing diagram" />
        )}
      </div>
    </figure>
  );
}
