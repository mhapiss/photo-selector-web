import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type MobileBottomBarProps = {
  show: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

const toolbarStyle = {
  background: 'rgba(22,22,24,0.88)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
};

const btn = 'flex h-12 w-12 items-center justify-center rounded-full text-white/90 transition-all duration-150 active:scale-90 disabled:opacity-0 focus:outline-none shrink-0';

export const MobileBottomBar: React.FC<MobileBottomBarProps> = React.memo(({
  show, canPrev, canNext, onPrev, onNext,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute left-0 right-0 z-30 pointer-events-auto"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center gap-16 px-4">
            <button onClick={onPrev} disabled={!canPrev} className={btn} style={toolbarStyle} aria-label="Sebelumnya">
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            
            <button onClick={onNext} disabled={!canNext} className={btn} style={toolbarStyle} aria-label="Berikutnya">
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

MobileBottomBar.displayName = 'MobileBottomBar';
export default MobileBottomBar;
