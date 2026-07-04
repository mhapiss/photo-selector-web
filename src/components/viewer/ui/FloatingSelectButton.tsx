import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

type FloatingSelectButtonProps = {
  show: boolean;
  selected: boolean;
  selectionIndex: number | null;
  isImageReady: boolean;
  onToggleSelect?: () => void;
  isMobile: boolean;
};

const springT = { type: 'spring' as const, stiffness: 340, damping: 32, mass: 0.8 };

export const FloatingSelectButton: React.FC<FloatingSelectButtonProps> = React.memo(({
  show, selected, selectionIndex, isImageReady, onToggleSelect, isMobile
}) => {
  return (
    <AnimatePresence>
      {show && isImageReady && onToggleSelect && (
        <motion.div
          className="absolute left-1/2 z-40 pointer-events-auto md:hidden"
          style={{
            bottom: isMobile 
              ? 'calc(env(safe-area-inset-bottom, 0px) + 20px)'
              : 'calc(env(safe-area-inset-bottom, 0px) + 84px)',
            transform: 'translateX(-50%)',
            width: 'min(88vw, 320px)',
            willChange: 'transform, opacity',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={springT}
        >
          <motion.button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full text-[14px] font-semibold text-white transition-colors duration-150 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            style={{
              background: selected ? '#0071E3' : 'rgba(22,22,24,0.92)',
              border: selected ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.36)',
            }}
            whileTap={{ scale: 0.97 }}
            transition={springT}
            aria-pressed={selected}
            aria-label={selected ? 'Batalkan pilihan' : 'Pilih foto ini'}
          >
            {selected ? (
              <>
                <Check size={16} strokeWidth={2.5} />
                <span>Terpilih</span>
                {typeof selectionIndex === 'number' && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white/20 px-1.5 text-[11px] font-bold">
                    {selectionIndex + 1}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/50" />
                <span>Pilih Foto</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

FloatingSelectButton.displayName = 'FloatingSelectButton';
export default FloatingSelectButton;
