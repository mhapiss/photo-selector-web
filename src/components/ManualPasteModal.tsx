import { useState } from 'react';
import { X, ClipboardPaste } from 'lucide-react';
import { Button } from './ui/Button';
import { parseFilenameList } from '../lib/drive';
import type { PhotoFile } from '../types';

type ManualPasteModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (photos: PhotoFile[]) => void;
};

export function ManualPasteModal({ open, onClose, onConfirm }: ManualPasteModalProps) {
  const [text, setText] = useState('');

  if (!open) return null;

  const parsed = parseFilenameList(text);

  function handleConfirm() {
    const photos: PhotoFile[] = parsed.map((name, i) => ({
      id: `manual-${i}-${name}`,
      name,
      thumbnailUrl: '',
      directUrl: '',
    }));
    onConfirm(photos);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-surface p-6 shadow-float-lg animate-slide-up sm:rounded-3xl">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-50 text-amber-500">
              <ClipboardPaste size={16} />
            </span>
            <h3 className="text-base font-bold tracking-tight text-ink">Paste filenames</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-slate-500">
          We couldn't auto-load the folder. Paste your filenames below (one per line) and
          we'll build your selection list from them.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder={'IMG_0001.JPG\nIMG_0005.JPG\nIMG_0012.JPG'}
          className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[13px] text-ink placeholder:text-slate-400 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400/30"
        />

        {text.trim() && (
          <p className="mt-2 text-xs font-medium text-slate-500 animate-fade-in">
            {parsed.length} image {parsed.length === 1 ? 'file' : 'files'} detected
          </p>
        )}

        <div className="mt-5 flex gap-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth onClick={handleConfirm} disabled={parsed.length === 0}>
            Load {parsed.length || ''} {parsed.length === 1 ? 'file' : 'files'}
          </Button>
        </div>
      </div>
    </div>
  );
}
