import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, RotateCcw, MessageCircle, Copy, Check } from 'lucide-react';

type DonePageProps = {
  clientName: string;
  eventName: string;
  selectedCount: number;
  message: string;
  onRestart: () => void;
  onReopenWhatsApp: () => void;
};

export function DonePage({
  clientName, eventName, selectedCount, message, onRestart, onReopenWhatsApp,
}: DonePageProps) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-x-hidden bg-background"
    >
      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center px-5 pb-14 pt-16 sm:pt-24">

        {/* Success icon — simple, no pulse ring */}
        <motion.div
          className="grid h-16 w-16 place-items-center rounded-full bg-success/12 border border-success/20"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          <CheckCircle2 size={32} className="text-success" strokeWidth={1.8} />
        </motion.div>

        {/* Heading */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <h2
            className="text-ink"
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.12,
            }}
          >
            Pilihanmu terkirim!
          </h2>
          <p className="mt-2.5 text-[14px] leading-relaxed text-warm-muted">
            {selectedCount} foto dari{' '}
            <span className="font-medium text-ink">{eventName}</span>{' '}
            sudah dikirim ke fotografermu.
          </p>
        </motion.div>

        {/* Message preview */}
        <motion.div
          className="mt-7 w-full overflow-hidden rounded-2xl border border-warm-border bg-warm-card"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-warm-border px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle size={14} style={{ color: '#25D366' }} />
              <span className="text-[13px] font-medium text-warm-muted">Pratinjau Pesan</span>
            </div>
            <motion.button
              onClick={copyMessage}
              whileTap={{ scale: 0.95 }}
              className="inline-flex h-8 min-w-[80px] items-center justify-center gap-1.5 rounded-lg border text-[12px] font-medium transition-colors touch-manipulation focus:outline-none"
              style={{
                background: copied ? 'rgba(52,199,89,0.08)' : 'transparent',
                border: copied ? '1px solid rgba(52,199,89,0.25)' : '1px solid var(--color-border)',
                color: copied ? '#34C759' : 'var(--color-muted)',
              }}
              aria-label="Salin pesan"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span key="done" className="flex items-center gap-1"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Check size={10} strokeWidth={2.5} /> Tersalin
                  </motion.span>
                ) : (
                  <motion.span key="copy" className="flex items-center gap-1"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Copy size={10} strokeWidth={1.8} /> Salin
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Bubble */}
          <div className="px-4 py-4">
            <div className="flex justify-end">
              <div
                className="max-w-[88%] rounded-2xl rounded-br-sm px-3.5 py-2.5 bg-[#DCF8C6] dark:bg-[#005C4B]"
                style={{
                  boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                }}
              >
                <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-gray-800 dark:text-[#E9EDEF]"
                  style={{ overflowWrap: 'break-word' }}>
                  {message}
                </pre>
              </div>
            </div>
            <p className="mt-2 text-right text-[11px] text-warm-dim">
              {clientName} · {selectedCount} foto
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="mt-5 w-full space-y-2.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <button
            onClick={onReopenWhatsApp}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover focus:outline-none"
            style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.10) inset' }}
          >
            Buka WhatsApp
          </button>

          <button
            onClick={onRestart}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-medium text-warm-muted transition-colors hover:text-warm-card hover:bg-warm-border focus:outline-none"
          >
            <RotateCcw size={13} strokeWidth={1.8} />
            Mulai pemilihan baru
          </button>
        </motion.div>
      </div>
    </div>
  );
}
