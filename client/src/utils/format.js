export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || '');

export const modKey = isMac ? '⌘' : 'Ctrl';

export const slugFile = (text) =>
  (text || 'notes')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'notes';

export const SOURCE_LABEL = { topic: 'Topic', url: 'Web link', image: 'Photo' };
