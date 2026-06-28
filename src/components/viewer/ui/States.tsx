import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ImageOff, RefreshCw, ScanLine } from 'lucide-react';

// ==========================================
// 1. BackgroundLayer
// ==========================================
type BackgroundLayerProps = {
  darken: boolean;
};

export const BackgroundLayer: React.FC<BackgroundLayerProps> = React.memo(({ darken }) => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[#040406]" />
    <motion.div
      className="absolute inset-0"
      animate={{ opacity: darken ? 0.65 : 0.4 }}
      transition={{ duration: 0.6 }}
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.01) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%)',
      }}
    />
  </div>
));
BackgroundLayer.displayName = 'BackgroundLayer';

// ==========================================
// 2. LoadingState
// ==========================================
type LoadingStateProps = {
  thumbnailUrl?: string;
};

export const LoadingState: React.FC<LoadingStateProps> = React.memo(({ thumbnailUrl }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
    {thumbnailUrl && (
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(40px)',
          opacity: 0.12,
          transform: 'scale(1.05)',
        }}
      />
    )}
    <div className="relative flex flex-col items-center gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
      </div>
      <span className="text-[10px] text-white/30 tracking-[0.25em] uppercase font-semibold">Memuat</span>
    </div>
  </div>
));
LoadingState.displayName = 'LoadingState';

// ==========================================
// 3. ErrorState
// ==========================================
type ErrorStateProps = {
  onRetry: () => void;
};

export const ErrorState: React.FC<ErrorStateProps> = React.memo(({ onRetry }) => (
  <motion.div
    className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="p-5 rounded-2xl bg-white/5 border border-white/10"
      animate={{ x: [0, -6, 6, -4, 4, 0] }}
      transition={{ delay: 0.2, duration: 0.5, ease: 'easeInOut' }}
    >
      <ImageOff size={28} className="text-white/35" />
    </motion.div>
    <div className="flex flex-col items-center gap-1 text-center px-4">
      <p className="text-sm text-white/60 font-medium">Gagal memuat gambar</p>
      <p className="text-xs text-white/30">Periksa koneksi internet Anda</p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-5 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/15 hover:text-white active:scale-95 transition-all touch-manipulation focus:outline-none"
    >
      <RefreshCw size={13} strokeWidth={2.5} />
      Coba lagi
    </button>
  </motion.div>
));
ErrorState.displayName = 'ErrorState';

// ==========================================
// 4. NavArrow
// ==========================================
type NavArrowProps = {
  direction: 'prev' | 'next';
  show: boolean;
  onClick: (e: React.MouseEvent) => void;
};

const navArrowGlassStyle = {
  background: 'rgba(10, 10, 15, 0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
};

export const NavArrow: React.FC<NavArrowProps> = React.memo(({ direction, show, onClick }) => {
  const isPrev = direction === 'prev';
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          className={`absolute top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center ${
            isPrev ? 'left-4 lg:left-6' : 'right-4 lg:right-6'
          } focus:outline-none`}
          initial={{ opacity: 0, x: isPrev ? -12 : 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isPrev ? -12 : 12 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 36 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onClick}
          aria-label={isPrev ? 'Foto sebelumnya' : 'Foto berikutnya'}
        >
          <div
            className="w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border border-white/15 text-white/70 hover:text-white transition-colors"
            style={navArrowGlassStyle}
          >
            {isPrev ? (
              <ChevronLeft size={22} strokeWidth={2.5} />
            ) : (
              <ChevronRight size={22} strokeWidth={2.5} />
            )}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
});
NavArrow.displayName = 'NavArrow';

// ==========================================
// 5. FullResBadge
// ==========================================
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
        className="absolute top-16 sm:top-[72px] right-3 sm:right-4 z-30 pointer-events-auto focus:outline-none"
        onClick={onToggle}
        disabled={!isImageReady}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 28 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label={active ? 'Mode resolusi penuh aktif' : 'Aktifkan resolusi penuh'}
      >
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-colors duration-200 ${
            active
              ? 'text-blue-300 border-blue-500/50 bg-blue-500/20'
              : 'text-white/50 border-white/10 bg-white/5 hover:text-white/70 hover:bg-white/10'
          }`}
        >
          <ScanLine size={12} strokeWidth={2.5} />
          <span>Resolusi Penuh</span>
        </div>
      </motion.button>
    )}
  </AnimatePresence>
));
FullResBadge.displayName = 'FullResBadge';
