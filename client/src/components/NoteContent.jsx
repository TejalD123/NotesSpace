import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Callout from './Callout';
import MermaidDiagram from './MermaidDiagram';
import { remarkHighlight, remarkSections } from '../utils/remarkPlugins';

const CALLOUT_RE = /^:::(key|tip|warning|example)[ \t]*\r?\n([\s\S]*?)\r?\n:::[ \t]*$/gm;

// Markdown la "markdown" ani "callout" segments madhe tod
export function splitSegments(markdown = '') {
  const segments = [];
  let last = 0;
  let h2Count = 0;

  const pushMd = (text) => {
    if (!text.trim()) return;
    segments.push({ type: 'md', text, offset: h2Count });
    h2Count += (text.replace(/```[\s\S]*?```/g, '').match(/^##[ \t]+\S/gm) || []).length;
  };

  for (const m of markdown.matchAll(CALLOUT_RE)) {
    pushMd(markdown.slice(last, m.index));
    segments.push({ type: 'callout', kind: m[1], text: m[2] });
    last = m.index + m[0].length;
  }
  pushMd(markdown.slice(last));
  return segments;
}

const components = {
  h2: ({ node, children, ...props }) => (
    <h2 id={props.id}>
      {props['data-section'] && (
        <span className="mb-0.5 block text-xs font-medium text-brand-ink">
          Section {props['data-section']}
        </span>
      )}
      {children}
    </h2>
  ),
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
  table: ({ node, children }) => (
    <div className="my-5 overflow-x-auto rounded-xl border border-line">
      <table>{children}</table>
    </div>
  ),
  pre: ({ node, children }) => {
    const child = Array.isArray(children) ? children[0] : children;
    const cls = child?.props?.className || '';
    if (/language-mermaid/.test(cls)) {
      return <MermaidDiagram chart={String(child.props.children).replace(/\n$/, '')} />;
    }
    return <pre>{children}</pre>;
  },
};

const Md = memo(function Md({ text, offset }) {
  const plugins = useMemo(
    () => (offset == null ? [remarkGfm, remarkHighlight] : [remarkGfm, remarkHighlight, remarkSections(offset)]),
    [offset]
  );
  return (
    <ReactMarkdown remarkPlugins={plugins} components={components}>
      {text}
    </ReactMarkdown>
  );
});

export default function NoteContent({ content }) {
  const segments = useMemo(() => splitSegments(content), [content]);
  return (
    <div className="note">
      {segments.map((s, i) =>
        s.type === 'callout' ? (
          <Callout key={i} kind={s.kind}>
            <Md text={s.text} />
          </Callout>
        ) : (
          <Md key={i} text={s.text} offset={s.offset} />
        )
      )}
    </div>
  );
}
