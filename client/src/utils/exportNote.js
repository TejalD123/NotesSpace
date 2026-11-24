import { slugFile } from './format';

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));

// Export hamesha light theme madhe (dark mode PDF madhe kharab disto)
async function withLightTheme(fn) {
  const root = document.documentElement;
  const wasDark = root.classList.contains('dark');
  if (wasDark) {
    root.classList.remove('dark');
    await nextFrame();
  }
  try {
    return await fn();
  } finally {
    if (wasDark) root.classList.add('dark');
  }
}

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const downloadMarkdown = (title, content) =>
  downloadBlob(
    new Blob([content], { type: 'text/markdown;charset=utf-8' }),
    `${slugFile(title)}.md`
  );

export const exportPdf = (el, title) =>
  withLightTheme(async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    await html2pdf()
      .set({
        margin: [10, 8, 10, 8],
        filename: `${slugFile(title)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: {
          mode: ['css', 'legacy'],
          avoid: ['.callout', '.diagram-card', 'table', 'h2', 'h3', 'tr'],
        },
      })
      .from(el)
      .save();
  });

export const exportImage = (el, title) =>
  withLightTheme(async () => {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    downloadBlob(blob, `${slugFile(title)}.png`);
  });
