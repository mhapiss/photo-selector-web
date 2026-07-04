import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ClipboardPaste } from 'lucide-react';
import { parseFilenameList } from '../../services/driveService';
import type { PhotoFile } from '../../types';

type ManualPasteModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (photos: PhotoFile[]) => void;
};

export function ManualPasteModal({ open, onClose, onConfirm }: ManualPasteModalProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => textareaRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  const parsed = parseFilenameList(text);

  function handleConfirm() {
    const photos: PhotoFile[] = parsed.map((name, i) => ({
      id: `manual-${i}-${name}`,
      name,
      mimeType: 'image/jpeg',
      thumbnailUrl: '',
      directUrl: '',
      webContentLink: '',
      size: 0,
    }));
    onConfirm(photos);
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-lg overflow-hidden bg-card/90 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-t-[20px] p-5 sm:rounded-[20px] sm:p-7"
            style={{ boxShadow: '0 24px 48px -12px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.1) inset' }}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface border border-black/5 dark:border-white/5 text-muted shadow-sm">
                  <ClipboardPaste size={18} />
                </div>
                <div>
                  <h3 id="modal-title" className="text-[16px] font-semibold text-ink">
                    Tempel Nama File
                  </h3>
                  <p className="text-[12px] text-muted">Impor foto secara manual</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Tutup"
                className="grid h-8 w-8 place-items-center rounded-full bg-surface/50 text-muted transition-colors hover:bg-surface hover:text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 touch-manipulation"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mb-5 text-[14px] leading-relaxed text-muted">
              Gagal memuat folder secara otomatis? Tempel daftar nama file foto di bawah ini — satu file per baris.
            </p>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder={'IMG_0001.JPG\nIMG_0005.JPG\nIMG_0012.JPG'}
              className="w-full resize-y rounded-xl border border-black/10 dark:border-white/10 bg-background/50 px-4 py-3 font-mono text-[14px] text-ink placeholder:text-dim outline-none transition-all duration-200 hover:border-black/20 dark:hover:border-white/20 focus:border-primary/80 focus:ring-4 focus:ring-primary/30 focus:bg-background shadow-inner touch-manipulation"
              aria-label="Daftar nama file gambar"
            />

            {text.trim() && (
              <p className="mt-2 text-[12px] font-medium text-primary">
                {parsed.length} file gambar terdeteksi
              </p>
            )}

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-11 flex-1 rounded-xl border border-border bg-surface shadow-xs text-[14px] font-medium text-ink transition-all hover:bg-card hover:border-border/80 active:bg-card active:brightness-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={parsed.length === 0}
                className="h-11 flex-1 rounded-xl bg-primary text-[14px] font-semibold text-white shadow-sm shadow-btn transition-all duration-200 hover:brightness-105 active:scale-[0.97] active:brightness-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:opacity-40 disabled:pointer-events-none border border-black/10 dark:border-white/10"
              >
                Muat {parsed.length || ''} File
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
