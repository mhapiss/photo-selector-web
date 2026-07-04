import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Check, ChevronLeft, Copy,
  Image as ImageIcon, MessageCircle, User,
} from 'lucide-react';
import type { AlbumMeta, PhotoFile } from '../types';
import { buildWhatsAppMessage } from '../services/whatsappService';

type SummaryPageProps = {
  meta: AlbumMeta;
  selectedPhotos: PhotoFile[];
  onBack: () => void;
  onSendWhatsApp: () => void;
};

export function SummaryPage({ meta, selectedPhotos, onBack, onSendWhatsApp }: SummaryPageProps) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filenames = useMemo(() => selectedPhotos.map((p) => p.name), [selectedPhotos]);
  const resultMessage = useMemo(() => buildWhatsAppMessage(meta, filenames), [meta, filenames]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(resultMessage.fullMessage);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-background text-ink">
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b border-border/60 bg-background/[0.92]"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingTop: 'env(safe-area-inset-top,0px)',
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            aria-label="Kembali ke galeri"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface border border-border text-muted transition-colors hover:text-ink hover:bg-card focus:outline-none touch-manipulation"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {meta.photographerName}
            </p>
            <h2 className="text-[14px] font-semibold text-ink">Ringkasan Pilihan</h2>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5 pb-24">
        {/* Meta cards */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <MetaCard icon={<User size={14} />} label="Nama Klien" value={meta.clientName} />
          <MetaCard icon={<CalendarDays size={14} />} label="Acara" value={meta.eventName} />
          <MetaCard
            icon={<ImageIcon size={14} />}
            label="Total Dipilih"
            value={`${selectedPhotos.length} Foto`}
            accent
          />
        </div>

        {/* Thumbnail strip */}
        <div className="mt-6">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Pratinjau Pilihan
          </h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {selectedPhotos.map((photo, i) => (
              <motion.div
                key={photo.id}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18, delay: Math.min(i * 0.025, 0.25) }}
              >
                {photo.thumbnailUrl ? (
                  <img src={photo.thumbnailUrl} alt={photo.name} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-surface">
                    <ImageIcon size={14} className="text-dim" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Filename list */}
        <div className="mt-6">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Daftar File
          </h3>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <ul className="max-h-[280px] overflow-y-auto scroll-container divide-y divide-border/60">
              {filenames.map((name, i) => (
                <li key={`${name}-${i}`} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded text-[10px] font-bold text-muted bg-surface border border-border">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate font-mono text-[12px] text-ink/70">{name}</span>
                  <Check size={11} className="shrink-0 text-success" strokeWidth={2.5} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          <button
            onClick={copyResult}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-[14px] font-medium text-ink transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span key="copied" className="flex items-center gap-2 text-success"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Check size={15} strokeWidth={2.5} /> Tersalin
                </motion.span>
              ) : (
                <motion.span key="copy" className="flex items-center gap-2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Copy size={15} /> Copy Result
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={onSendWhatsApp}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.10) inset' }}
          >
            <MessageCircle size={16} /> Kirim via WhatsApp
          </button>
        </div>

        <button
          onClick={onBack}
          className="mt-4 w-full py-2.5 text-[13px] text-muted transition-colors hover:text-ink focus:outline-none"
        >
          Ubah Pilihan
        </button>
      </main>
    </div>
  );
}

function MetaCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3.5 ${accent ? 'border-primary/25 bg-primary/06' : 'border-border bg-card'}`}>
      <div className={`mb-2.5 flex h-7 w-7 items-center justify-center rounded-lg border ${
        accent ? 'border-primary/20 text-primary' : 'border-border text-muted'
      }`}>
        {icon}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={`mt-0.5 truncate text-[13px] font-semibold ${accent ? 'text-primary' : 'text-ink/82'}`}>
        {value}
      </p>
    </div>
  );
}
