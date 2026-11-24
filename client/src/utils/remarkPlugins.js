import { visit, SKIP } from 'unist-util-visit';

// ==text==  ->  <mark>text</mark>
export function remarkHighlight() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index == null || !node.value.includes('==')) return;
      const parts = node.value.split(/(==[^=\n]+==)/g);
      if (parts.length === 1) return;
      const children = parts
        .filter(Boolean)
        .map((p) =>
          /^==[^=\n]+==$/.test(p)
            ? {
                type: 'highlight',
                data: { hName: 'mark' },
                children: [{ type: 'text', value: p.slice(2, -2) }],
              }
            : { type: 'text', value: p }
        );
      parent.children.splice(index, 1, ...children);
      return [SKIP, index + children.length];
    });
  };
}

// "##" headings la id + section number deto (TOC ani "Section 01" label sathi)
export const remarkSections = (offset = 0) =>
  function attacher() {
    return (tree) => {
      let n = offset;
      visit(tree, 'heading', (node) => {
        if (node.depth !== 2) return;
        n += 1;
        node.data = {
          ...(node.data || {}),
          hProperties: { id: `section-${n}`, dataSection: String(n).padStart(2, '0') },
        };
      });
    };
  };
