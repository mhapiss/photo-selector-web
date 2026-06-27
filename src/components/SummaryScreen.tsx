import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Copy, Image as ImageIcon, User, CalendarDays, Check } from 'lucide-react';
import type { AlbumMeta, PhotoFile } from '../types';

type SummaryScreenProps = {
  meta: AlbumMeta;
  selectedPhotos: PhotoFile[];
  onBack: () => void;
  onSendWhatsApp: () => void;
};

export function SummaryScreen({
  meta,
  selectedPhotos,
  onBack,
  onSendWhatsApp,
}: SummaryScreenProps) {
  const [copied, setCopied] = useState(false);
  const filenames = selectedPhotos.map((p) => p.name);

  async function copyList() {
    try {
      await navigator.clipboard.writeText(filenames.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — clipboard may be unavailable
    }
  }

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-x-hidden text-white bg-[#030307]"
      style={{
        background: 'linear-gradient(135deg, #020204 0%, #080615 40%, #04050a 100%)',
      }}
    >
      {/* Background Aurora Mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(139,92,246,0.15) 0%, transparent 60%),' +
              'radial-gradient(ellipse 50% 30% at 10% 30%, rgba(99,102,241,0.08) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Floating Header */}
      <header
        className="sticky top-0 z-30 border-b border-white/5 safe-top backdrop-blur-3xl bg-[#030307]/75"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3.5">
          <button
            onClick={onBack}
            aria-label="Kembali ke galeri"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/5 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 touch-manipulation"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold tracking-tight text-white/90">
              Ringkasan Pilihan
            </h2>
            <p className="text-[11px] text-white/45">Tinjau foto favoritmu sebelum mengirim</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 pb-24" role="main">
        {/* Info Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetaCard icon={<User size={16} />} label="Nama Klien" value={meta.clientName} />
          <MetaCard icon={<CalendarDays size={16} />} label="Acara" value={meta.eventName} />
          <MetaCard
            icon={<ImageIcon size={16} />}
            label="Total Foto"
            value={`${selectedPhotos.length} Foto`}
            accent
          />
        </div>

        {/* Thumbnail Strip */}
        <div className="mt-8">
          <h3 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-white/35">
            Pratinjau Album
          </h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {selectedPhotos.map((photo, i) => (
              <motion.div
                key={photo.id}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
              >
                {photo.thumbnailUrl ? (
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-white/5">
                    <ImageIcon size={18} className="text-white/20" />
                  </div>
                )}
                <div
                  className="absolute inset-x-0 bottom-0 px-1.5 py-0.5 truncate text-[8px] font-medium text-white/90"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                  }}
                >
                  {photo.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Filenames list */}
        <div className="mt-8">
          <div className="mb-3.5 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/35">
              Daftar Nama File
            </h3>
            <button
              onClick={copyList}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="check"
                    className="flex items-center gap-1.5 text-emerald-400"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check size={12} strokeWidth={2.5} />
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
                    <Copy size={12} />
                    Salin List
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <ul className="divide-y divide-white/5 max-h-[320px] overflow-y-auto scroll-container">
              {filenames.map((name, i) => (
                <li
                  key={name}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.01] transition-colors"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-violet-500/10 text-[9px] font-bold text-violet-400 border border-violet-500/20">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate font-mono text-xs text-white/70">{name}</span>
                  <Check size={12} className="shrink-0 text-emerald-400" strokeWidth={2.5} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 space-y-3">
          <button
            onClick={onSendWhatsApp}
            className="w-full inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl font-bold tracking-tight text-white transition-all shadow-[0_8px_24px_rgba(37,211,102,0.25)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{
              background: 'linear-gradient(135deg, #25D366 0%, #1FB855 100%)',
            }}
          >
            <WhatsAppIcon />
            Kirim ke WhatsApp
          </button>

          <button
            onClick={onBack}
            className="w-full py-3 text-sm font-semibold text-white/45 hover:text-white/80 transition-colors focus:outline-none focus:text-white/80"
          >
            Ubah Pilihan
          </button>

          <p className="text-center text-[11px] leading-relaxed text-white/30">
            Daftar foto terpilih akan dikirimkan langsung ke WhatsApp fotografermu secara otomatis.
          </p>
        </div>
      </main>
    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        accent
          ? 'border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 shadow-[0_8px_24px_rgba(139,92,246,0.15)]'
          : 'border-white/5 bg-white/[0.02] shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
      }`}
    >
      <div
        className={`mb-3 grid h-8 w-8 place-items-center rounded-xl border ${
          accent
            ? 'border-violet-500/20 bg-violet-500/20 text-violet-300'
            : 'border-white/5 bg-white/5 text-white/50'
        }`}
      >
        {icon}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{label}</p>
      <p className={`mt-0.5 truncate text-sm font-bold ${accent ? 'text-violet-300' : 'text-white/80'}`}>
        {value}
      </p>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
    </svg>
  );
}
