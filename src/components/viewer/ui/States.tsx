import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ImageOff, RefreshCw, ScanLine } from 'lucide-react';

// ── BackgroundLayer ──────────────────────────────────────────
type BackgroundLayerProps = { darken: boolean };

export const BackgroundLayer: React.FC<BackgroundLayerProps> = React.memo(({ darken }) => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0" style={{ background: '#060608' }} />
    <motion.div
      className="absolute inset-0"
      animate={{ opacity: darken ? 0.55 : 0.25 }}
      transition={{ duration: 0.5 }}
      style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.70), transparent 60%)' }}
    />
  </div>
));
BackgroundLayer.displayName = 'BackgroundLayer';

// ── LoadingState ─────────────────────────────────────────────
type LoadingStateProps = { thumbnailUrl?: string };

export const LoadingState: React.FC<LoadingStateProps> = React.memo(({ thumbnailUrl }) => (
  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
    {thumbnailUrl && (
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(32px)',
          opacity: 0.10,
          transform: 'scale(1.04)',
        }}
      />
    )}
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border border-white/8" />
        <div className="absolute inset-0 rounded-full border border-t-white/50 border-transparent animate-spin" />
      </div>
      <span className="text-[10px] font-medium text-white/30 tracking-[0.2em] uppercase">
        Memuat
      </span>
    </div>
  </div>
));
LoadingState.displayName = 'LoadingState';

// ── ErrorState ───────────────────────────────────────────────
type ErrorStateProps = { onRetry: () => void };

export const ErrorState: React.FC<ErrorStateProps> = React.memo(({ onRetry }) => (
  <motion.div
    className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.25 }}
  >
    <div className="p-4 rounded-xl bg-white/5 border border-white/08">
      <ImageOff size={24} className="text-white/30" strokeWidth={1.5} />
    </div>
    <div className="flex flex-col items-center gap-1 text-center px-6">
      <p className="text-[14px] font-medium text-white/60">Gagal memuat gambar</p>
      <p className="text-[12px] text-white/30">Periksa koneksi internet Anda</p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/06 px-4 py-2 text-[12px] font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors touch-manipulation focus:outline-none"
    >
      <RefreshCw size={12} strokeWidth={2} />
      Coba lagi
    </button>
  </motion.div>
));
ErrorState.displayName = 'ErrorState';

// ── NavArrow ─────────────────────────────────────────────────
type NavArrowProps = {
  direction: 'prev' | 'next';
  show: boolean;
  onClick: (e: React.MouseEvent) => void;
};

export const NavArrow: React.FC<NavArrowProps> = React.memo(({ direction, show, onClick }) => {
  const isPrev = direction === 'prev';
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          className={`absolute top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center ${
            isPrev ? 'left-5' : 'right-5'
          } focus:outline-none`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onClick}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={isPrev ? 'Foto sebelumnya' : 'Foto berikutnya'}
        >
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center border border-white/12 text-white/55 hover:text-white hover:border-white/20 transition-colors"
            style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          >
            {isPrev
              ? <ChevronLeft size={18} strokeWidth={2} />
              : <ChevronRight size={18} strokeWidth={2} />
            }
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
});
NavArrow.displayName = 'NavArrow';

// ── FullResBadge ─────────────────────────────────────────────
type FullResBadgeProps = {
  show: boolean;
  active: boolean;
  onToggle: (e: React.MouseEvent) => void;
  isImageReady: boolean;
};

export const FullResBadge: React.FC<FullResBadgeProps> = React.memo(({ show, active, onToggle, isImageReady }) => (
  <AnimatePresence>
    {show && (
      <motion.button
        className="absolute top-16 right-3 sm:right-4 z-30 pointer-events-auto focus:outline-none"
        onClick={onToggle}
        disabled={!isImageReady}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        whileTap={{ scale: 0.96 }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={active ? 'Resolusi penuh aktif' : 'Aktifkan resolusi penuh'}
      >
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors duration-150 ${
            active
              ? 'text-primary bg-primary/10 border-primary/30'
              : 'text-white/40 border-white/08 bg-black/20 hover:text-white/60 hover:border-white/15'
          }`}
        >
          <ScanLine size={11} strokeWidth={2} />
          <span>HD</span>
        </div>
      </motion.button>
    )}
  </AnimatePresence>
));
FullResBadge.displayName = 'FullResBadge';
