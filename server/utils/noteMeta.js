// Note content (markdown) pasun list/viewer sathi meta kadhto.
const stripMarkdown = (text) =>
  text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^:::.*$/gm, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*([-+*]|\d+\.)\s+/gm, '')
    .replace(/-{3,}/g, ' ')
    .replace(/[#>*_`~|]/g, ' ')
    .replace(/==/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const getNoteMeta = (content = '') => {
  const words = stripMarkdown(content).split(' ').filter(Boolean).length;
  const callouts = (content.match(/^:::(key|tip|warning|example)[ \t]*$/gm) || []).length;
  const diagrams = (content.match(/```mermaid/g) || []).length;

  const keyMatch = content.match(/^:::key[ \t]*\r?\n([\s\S]*?)\r?\n:::/m);
  const keyPoint = keyMatch ? stripMarkdown(keyMatch[1]).slice(0, 120) : '';

  const body = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^:::(key|tip|warning|example)[ \t]*\r?\n[\s\S]*?\r?\n:::[ \t]*$/gm, '');
  const firstLine = body
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('#') && !l.startsWith('|'));
  const excerpt = firstLine ? stripMarkdown(firstLine).slice(0, 180) : '';

  return {
    words,
    readMinutes: Math.max(1, Math.ceil(words / 200)),
    callouts,
    diagrams,
    keyPoint,
    excerpt,
  };
};

module.exports = { getNoteMeta };