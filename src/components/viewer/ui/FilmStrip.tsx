import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhotoFile } from '../../../types';
import { Check } from 'lucide-react';

type FilmStripProps = {
  photos: PhotoFile[];
  currentIndex: number;
  selectedIds: Set<string>;
  onNavigate: (index: number) => void;
  show: boolean;
};

const glassStyle = {
  background: 'rgba(15, 15, 20, 0.4)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
};

export const FilmStrip: React.FC<FilmStripProps> = React.memo(({
  photos,
  currentIndex,
  selectedIds,
  onNavigate,
  show,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active thumbnail into center view
  useEffect(() => {
    if (!containerRef.current) return;
    const activeItem = containerRef.current.children[currentIndex] as HTMLElement;
    if (!activeItem) return;

    const container = containerRef.current;
    const scrollLeft = activeItem.offsetLeft - container.offsetWidth / 2 + activeItem.offsetWidth / 2;
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }, [currentIndex]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute left-0 right-0 z-20 pointer-events-auto hidden md:block"
          style={{
            bottom: '128px', // Positioned above the desktop zoom bar
            ...glassStyle
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring' as const, stiffness: 350, damping: 32 }}
        >
          <div 
            ref={containerRef}
            className="flex items-center gap-2 px-6 py-3.5 overflow-x-auto no-scrollbar scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {photos.map((photo, idx) => {
              const isActive = idx === currentIndex;
              const isSelected = selectedIds.has(photo.id);

              return (
                <button
                  key={photo.id}
                  onClick={() => onNavigate(idx)}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all duration-200 focus:outline-none ${
                    isActive 
                      ? 'ring-2 ring-white scale-105 shadow-md shadow-black/40' 
                      : 'opacity-40 hover:opacity-80 scale-95'
                  }`}
                  aria-label={`Buka foto ke-${idx + 1}`}
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center border border-black/20">
                      <Check size={9} strokeWidth={4} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

FilmStrip.displayName = 'FilmStrip';
export default FilmStrip;
