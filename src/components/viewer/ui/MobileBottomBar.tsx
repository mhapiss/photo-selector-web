import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

type MobileBottomBarProps = {
  show: boolean;
  selected: boolean;
  selectionIndex: number | null;
  onToggleSelect: () => void;
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
  background: 'rgba(18, 18, 24, 0.8)',
  backdropFilter: 'blur(35px)',
  WebkitBackdropFilter: 'blur(35px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const iconBtnBase =
  'flex items-center justify-center rounded-full transition-all duration-150 touch-manipulation shrink-0 focus-visible:ring-2 focus-visible:ring-white/40 focus:outline-none';
const iconBtnSm = `${iconBtnBase} w-9 h-9 text-white/70 hover:text-white hover:bg-white/10 active:scale-90`;

export const MobileBottomBar: React.FC<MobileBottomBarProps> = React.memo(({
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
          className="absolute left-0 right-0 z-30 pointer-events-auto"
          style={{
            bottom: 'calc(max(env(safe-area-inset-bottom), 12px) + 52px)', // Positioned above the Select Photo button
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring' as const, stiffness: 380, damping: 36 }}
        >
          <div className="flex flex-col items-center gap-3 px-4 pb-2">
            
            {/* Upper row: Navigation */}
            <div className="flex items-center justify-between w-full max-w-[340px] gap-2">
              {/* Prev Navigation Button */}
              <button
                onClick={onPrev}
                disabled={!canPrev}
                className={`${iconBtnSm} disabled:opacity-20 disabled:pointer-events-none`}
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Spacer instead of original Selection Button */}
              <div className="flex-1" />

              {/* Next Navigation Button */}
              <button
                onClick={onNext}
                disabled={!canNext}
                className={`${iconBtnSm} disabled:opacity-20 disabled:pointer-events-none`}
                aria-label="Foto berikutnya"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Lower row: Zoom controls pill */}
            <div
              className="flex items-center rounded-full px-1"
              style={toolbarGlassStyle}
            >
              <button
                onClick={onZoomOut}
                disabled={!isImageReady || zoom <= 1}
                className={`${iconBtnSm} disabled:opacity-30`}
                aria-label="Perkecil"
              >
                <ZoomOut size={16} strokeWidth={2} />
              </button>
              <button
                onClick={onResetZoom}
                disabled={!isImageReady}
                className="h-9 px-3 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all tabular-nums min-w-[52px] text-center touch-manipulation focus:outline-none"
                title="Reset zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={onZoomIn}
                disabled={!isImageReady || zoom >= 6}
                className={`${iconBtnSm} disabled:opacity-30`}
                aria-label="Perbesar"
              >
                <ZoomIn size={16} strokeWidth={2} />
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

MobileBottomBar.displayName = 'MobileBottomBar';
export default MobileBottomBar;
