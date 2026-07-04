import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

type MobileBottomBarProps = {
  show: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  selected: boolean;
  selectionIndex: number | null;
  onToggleSelect?: () => void;
  isImageReady: boolean;
};

const toolbarStyle = {
  background: 'rgba(22,22,24,0.92)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
};

const btn = 'flex h-12 w-12 items-center justify-center rounded-full text-white/90 transition-all duration-150 active:scale-90 disabled:opacity-30 focus:outline-none shrink-0';

export const MobileBottomBar: React.FC<MobileBottomBarProps> = React.memo(({
  show, canPrev, canNext, onPrev, onNext, selected, selectionIndex, onToggleSelect, isImageReady
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute left-0 right-0 z-40 pointer-events-auto px-4"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="mx-auto max-w-[400px] flex items-center justify-between gap-3">
            <button onClick={onPrev} disabled={!canPrev} className={btn} style={toolbarStyle} aria-label="Sebelumnya">
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            
            {onToggleSelect && (
              <button
                type="button"
                disabled={!isImageReady}
                onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-white transition-colors duration-150 touch-manipulation focus:outline-none active:scale-95 disabled:opacity-50"
                style={{
                  ...toolbarStyle,
                  background: selected ? '#0071E3' : toolbarStyle.background,
                  border: selected ? '1px solid rgba(255,255,255,0.2)' : toolbarStyle.border,
                }}
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
              </button>
            )}
            
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
