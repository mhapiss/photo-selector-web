import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, RotateCcw, MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from './ui/Button';

type DoneScreenProps = {
  clientName: string;
  eventName: string;
  selectedCount: number;
  message: string;
  onRestart: () => void;
  onReopenWhatsApp: () => void;
};

export function DoneScreen({
  clientName,
  eventName,
  selectedCount,
  message,
  onRestart,
  onReopenWhatsApp,
}: DoneScreenProps) {
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 30%, #0a0f1a 60%, #060a10 100%)',
      }}
    >
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(16,185,129,0.15) 0%, transparent 60%),' +
              'radial-gradient(ellipse 60% 40% at 20% 80%, rgba(80,30,160,0.12) 0%, transparent 60%),' +
              'radial-gradient(ellipse 50% 40% at 80% 60%, rgba(30,80,200,0.1) 0%, transparent 60%)',
          }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background:
              'radial-gradient(ellipse 80% 35% at 50% 0%, rgba(16,185,129,0.1) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center px-5 pb-16 pt-16 sm:px-6 sm:pt-24">

        {/* ── Success icon ── */}
        <motion.div
          className="relative grid h-20 w-20 place-items-center rounded-full"
          style={{
            background:
              'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(5,150,105,0.15) 100%)',
            border: '1px solid rgba(16,185,129,0.3)',
            boxShadow:
              '0 0 40px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
        >
          {/* Outer ring pulse */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: '1px solid rgba(16,185,129,0.4)' }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
          />
          <CheckCircle2
            size={42}
            strokeWidth={2}
            className="text-emerald-400"
          />
        </motion.div>

        {/* ── Heading ── */}
        <motion.div
          className="mt-7 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        >
          <h2
            className="bg-clip-text text-transparent"
            style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              backgroundImage:
                'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(160,230,210,0.9) 60%, rgba(80,220,180,0.85) 100%)',
            }}
          >
            Pilihanmu terkirim!
          </h2>
          <p
            className="mt-3 leading-relaxed text-white/50"
            style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
          >
            Sebanyak{' '}
            <span className="font-semibold text-white/80">{selectedCount}</span> foto
            {selectedCount === 1 ? '' : ''} dari acara{' '}
            <span className="font-semibold text-white/80">{eventName}</span> sudah dikirim
            ke fotografermu.
          </p>
        </motion.div>

        {/* ── WhatsApp message preview ── */}
        <motion.div
          className="mt-8 w-full overflow-hidden rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(20px)',
            boxShadow:
              '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.32 }}
        >
          {/* Card header */}
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={15} strokeWidth={2} style={{ color: '#25D366' }} />
              <span className="text-[13px] font-semibold text-white/70">
                Pratinjau Pesan
              </span>
            </div>
            <motion.button
              onClick={copyMessage}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{
                background: copied
                  ? 'rgba(16,185,129,0.15)'
                  : 'rgba(255,255,255,0.06)',
                border: copied
                  ? '1px solid rgba(16,185,129,0.3)'
                  : '1px solid rgba(255,255,255,0.08)',
                color: copied ? '#6ee7b7' : 'rgba(255,255,255,0.45)',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.93 }}
              transition={{ duration: 0.15 }}
              aria-label="Salin pesan"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="check"
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check size={11} strokeWidth={2.5} />
                    Tersalin!
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Copy size={11} strokeWidth={2} />
                    Salin pesan
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Message bubble */}
          <div className="px-5 py-4">
            <div className="flex justify-end">
              <div
                className="max-w-[88%] rounded-2xl rounded-br-sm px-4 py-3"
                style={{
                  background: 'linear-gradient(135deg, #dcf8c6 0%, #c8f0b0 100%)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}
              >
                <pre
                  className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-slate-800"
                  style={{ maxWidth: '100%', overflowWrap: 'break-word' }}
                >
                  {message}
                </pre>
              </div>
            </div>

            {/* Meta */}
            <p className="mt-3 text-right text-[11px] text-white/25">
              {clientName} · {selectedCount} foto
            </p>
          </div>
        </motion.div>

        {/* ── Actions ── */}
        <motion.div
          className="mt-6 w-full space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.44 }}
        >
          {/* Primary: reopen WhatsApp */}
          <motion.div whileTap={{ scale: 0.985 }}>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={onReopenWhatsApp}
            >
              Buka WhatsApp
            </Button>
          </motion.div>

          {/* Ghost: restart */}
          <motion.button
            onClick={onRestart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white/35 transition-colors"
            whileHover={{ color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.05)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <RotateCcw size={14} strokeWidth={2} />
            Mulai pemilihan baru
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}