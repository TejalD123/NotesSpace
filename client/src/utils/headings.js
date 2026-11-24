// Markdown madhun "##" headings kadhto (TOC sathi). Fenced code blocks skip karto.
export const stripInline = (s) =>
  s.replace(/[*_`=]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim();

export const extractSections = (markdown = '') => {
  const clean = markdown.replace(/```[\s\S]*?```/g, '');
  const out = [];
  clean.split('\n').forEach((line) => {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) out.push({ id: `section-${out.length + 1}`, title: stripInline(m[1]) });
  });
  return out;
};
