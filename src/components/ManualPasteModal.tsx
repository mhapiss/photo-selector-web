import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ClipboardPaste } from 'lucide-react';
import { parseFilenameList } from '../lib/drive';
import type { PhotoFile } from '../types';

type ManualPasteModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (photos: PhotoFile[]) => void;
};

export function ManualPasteModal({ open, onClose, onConfirm }: ManualPasteModalProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and accessibility
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
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
          className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-0 sm:p-4 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop Overlay */}
          <motion.div
            className="absolute inset-0 bg-[#020204]/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-[32px] sm:rounded-[24px] border border-white/10 bg-[#0a0a0f] p-6 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] will-change-transform"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          >
            {/* Ambient Aurora inside Modal */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" aria-hidden="true" />

            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span 
                    className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20"
                    aria-hidden="true"
                  >
                    <ClipboardPaste size={18} />
                  </span>
                  <div>
                    <h3 
                      id="modal-title" 
                      className="text-base font-bold tracking-tight text-white/90 sm:text-lg"
                    >
                      Tempel Nama File
                    </h3>
                    <p className="text-[11px] text-white/40">Impor foto secara manual</p>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  aria-label="Tutup"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/5 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="mb-5 text-sm leading-relaxed text-white/50">
                Gagal memuat folder secara otomatis? Tempel daftar nama file fotomu di bawah ini (satu file per baris), lalu kami akan membuat daftar pemilihan fotomu.
              </p>

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  placeholder={'IMG_0001.JPG\nIMG_0005.JPG\nIMG_0012.JPG'}
                  className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 font-mono text-[13px] text-white/80 placeholder:text-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.04] focus:ring-2 focus:ring-violet-500/20"
                  aria-label="Daftar nama file gambar"
                />
              </div>

              <div className="min-h-[20px] mt-2">
                <AnimatePresence>
                  {text.trim() && (
                    <motion.p 
                      className="text-xs font-semibold text-violet-400"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      {parsed.length} file gambar terdeteksi
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/2 h-11 px-5 text-sm font-semibold rounded-xl text-white/60 bg-white/5 hover:bg-white/10 active:scale-98 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={parsed.length === 0}
                  className="w-full sm:w-1/2 h-11 px-5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:pointer-events-none active:scale-98 transition-all duration-200 shadow-[0_4px_20px_rgba(120,40,200,0.3)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  Muat {parsed.length || ''} File
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
