import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

type DesktopZoomBarProps = {
  show: boolean;
  zoom: number;
  isImageReady: boolean;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onResetZoom: () => void;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

const toolbarGlassStyle = {
  background: 'rgba(18, 18, 24, 0.75)',
  backdropFilter: 'blur(35px)',
  WebkitBackdropFilter: 'blur(35px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const iconBtnBase =
  'flex items-center justify-center rounded-full transition-all duration-150 touch-manipulation shrink-0 focus-visible:ring-2 focus-visible:ring-white/40 focus:outline-none';
const iconBtnSm = `${iconBtnBase} w-9 h-9 text-white/70 hover:text-white hover:bg-white/10 active:scale-90`;

export const DesktopZoomBar: React.FC<DesktopZoomBarProps> = React.memo(({
  show,
  zoom,
  isImageReady,
  onZoomOut,
  onZoomIn,
  onResetZoom,
  canPrev,
  canNext,
  onPrev,
  onNext,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
          style={{ bottom: 'calc(max(env(safe-area-inset-bottom, 16px), 16px) + 56px)' }} // Adjusted slightly to stack above select button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ type: 'spring' as const, stiffness: 380, damping: 36 }}
        >
          <div
            className="flex items-center gap-1.5 rounded-full px-2 py-1 shadow-2xl"
            style={toolbarGlassStyle}
          >
            {/* Nav Prev shortcut on bar */}
            <button
              onClick={onPrev}
              disabled={!canPrev}
              className={`${iconBtnSm} disabled:opacity-20`}
              aria-label="Sebelumnya"
              title="Sebelumnya (←)"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>

            <div className="w-px h-4 bg-white/10 mx-0.5" />

            {/* Zoom controls */}
            <button
              onClick={onZoomOut}
              disabled={!isImageReady || zoom <= 1}
              className={`${iconBtnSm} disabled:opacity-30`}
              aria-label="Perkecil"
              title="Perkecil (-)"
            >
              <ZoomOut size={16} strokeWidth={2} />
            </button>
            <button
              onClick={onResetZoom}
              disabled={!isImageReady}
              className="h-9 px-3 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all tabular-nums min-w-[56px] text-center touch-manipulation focus:outline-none"
              title="Reset zoom (0)"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={onZoomIn}
              disabled={!isImageReady || zoom >= 6}
              className={`${iconBtnSm} disabled:opacity-30`}
              aria-label="Perbesar"
              title="Perbesar (+)"
            >
              <ZoomIn size={16} strokeWidth={2} />
            </button>

            <div className="w-px h-4 bg-white/10 mx-0.5" />

            {/* Nav Next shortcut on bar */}
            <button
              onClick={onNext}
              disabled={!canNext}
              className={`${iconBtnSm} disabled:opacity-20`}
              aria-label="Berikutnya"
              title="Berikutnya (→)"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

DesktopZoomBar.displayName = 'DesktopZoomBar';
export default DesktopZoomBar;
