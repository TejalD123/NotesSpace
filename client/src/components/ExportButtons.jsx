import { useState } from 'react';
import { Download, FileImage, Copy, Printer } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { exportImage, exportPdf } from '../utils/exportNote';

export default function ExportButtons({ note, sheetRef }) {
  const toast = useToast();
  const [busy, setBusy] = useState('');

  const run = (key, fn, okMsg) => async () => {
    if (busy) return;
    setBusy(key);
    try {
      await fn();
      if (okMsg) toast.success(okMsg);
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setBusy('');
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(note.content);
  };

  return (
    <div className="no-print flex flex-wrap gap-2">
      <button
        className="btn-soft"
        disabled={!!busy}
        onClick={run('pdf', () => exportPdf(sheetRef.current, note.title), 'PDF downloaded')}
      >
        <Download size={16} aria-hidden="true" />
        {busy === 'pdf' ? 'Preparing…' : 'Download PDF'}
      </button>
      <button
        className="btn-soft"
        disabled={!!busy}
        onClick={run('img', () => exportImage(sheetRef.current, note.title), 'Image downloaded')}
      >
        <FileImage size={16} aria-hidden="true" />
        {busy === 'img' ? 'Preparing…' : 'Export image'}
      </button>
      <button className="btn-soft" disabled={!!busy} onClick={run('copy', copy, 'Markdown copied')}>
        <Copy size={16} aria-hidden="true" />
        Copy Markdown
      </button>
      <button className="btn-soft" onClick={() => window.print()} aria-label="Print note">
        <Printer size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Print</span>
      </button>
    </div>
  );
}
