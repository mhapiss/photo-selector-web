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

export const FilmStrip: React.FC<FilmStripProps> = React.memo(({
  photos, currentIndex, selectedIds, onNavigate, show,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const active = el.children[currentIndex] as HTMLElement | undefined;
    if (!active) return;
    requestAnimationFrame(() => {
      active.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    });
  }, [currentIndex]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute left-0 right-0 z-20 pointer-events-auto hidden md:block"
          style={{
            bottom: 'env(safe-area-inset-bottom, 0px)',
            background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            ref={containerRef}
            className="flex items-end gap-1.5 px-6 pt-4 pb-2 overflow-x-auto no-scrollbar"
          >
            {photos.map((photo, idx) => {
              const isActive = idx === currentIndex;
              const isSelected = selectedIds.has(photo.id);
              return (
                <button
                  key={photo.id}
                  onClick={() => onNavigate(idx)}
                  className="relative shrink-0 overflow-hidden rounded transition-all duration-200 focus:outline-none"
                  style={{
                    width: isActive ? 48 : 38,
                    height: isActive ? 48 : 38,
                    opacity: isActive ? 1 : 0.45,
                    outline: isActive ? '2px solid rgba(255,255,255,0.80)' : 'none',
                    outlineOffset: 1,
                  }}
                  aria-label={`Foto ${idx + 1}`}
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.triedDrive) {
                        target.dataset.triedDrive = 'true';
                        // Fallback 1: Bypass CDN entirely and go direct to Google Drive thumbnail
                        target.src = `https://drive.google.com/thumbnail?id=${photo.id}&sz=w200`;
                      } else if (!target.dataset.triedDirect) {
                        target.dataset.triedDirect = 'true';
                        // Fallback 2: Direct URL
                        target.src = photo.directUrl || photo.webContentLink || '';
                      }
                    }}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/40">
                      <Check size={10} strokeWidth={3} className="text-white" />
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
