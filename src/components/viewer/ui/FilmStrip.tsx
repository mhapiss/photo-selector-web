import React, { useRef, useEffect, useState, useMemo } from 'react';
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

// Item sizing: 38px width + 6px gap (gap-1.5) = 44px total pitch
const ITEM_WIDTH = 44;
// Buffer in px on each side (~5 extra items)
const BUFFER_PX = 200;

export const FilmStrip: React.FC<FilmStripProps> = React.memo(({
  photos, currentIndex, selectedIds, onNavigate, show,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth : 1000
  ));

  // Listen to scroll events on container with passive: true and RAF throttling
  useEffect(() => {
    if (!show) return;
    const el = containerRef.current;
    if (!el) return;

    setScrollLeft(el.scrollLeft);
    setContainerWidth(el.clientWidth || window.innerWidth);

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (containerRef.current) {
          setScrollLeft(containerRef.current.scrollLeft);
          setContainerWidth(containerRef.current.clientWidth);
        }
      });
    };

    el.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [show]);

  // Calculate visible range based on scroll position and buffer
  const total = photos.length;
  const minX = Math.max(0, scrollLeft - BUFFER_PX);
  const maxX = scrollLeft + containerWidth + BUFFER_PX;

  const startIdx = total === 0 ? 0 : Math.max(0, Math.floor(minX / ITEM_WIDTH));
  const endIdx = total === 0 ? 0 : Math.min(total, Math.ceil(maxX / ITEM_WIDTH));

  const visiblePhotos = useMemo(() => {
    return photos.slice(startIdx, endIdx);
  }, [photos, startIdx, endIdx]);

  // Keep scrollIntoView behavior for the active item
  useEffect(() => {
    if (!show) return;
    const el = containerRef.current;
    if (!el) return;
    const active = el.querySelector(`[data-index="${currentIndex}"]`) as HTMLElement | null;
    if (active) {
      requestAnimationFrame(() => {
        active.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      });
    } else {
      // If active item is outside current virtual window, scroll container to center it
      const itemCenter = currentIndex * ITEM_WIDTH + ITEM_WIDTH / 2;
      const targetLeft = Math.max(0, itemCenter - el.clientWidth / 2);
      el.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  }, [currentIndex, show]);

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
            {/* Leading spacer */}
            <div
              style={{ width: startIdx * ITEM_WIDTH }}
              className="shrink-0"
              aria-hidden="true"
            />

            {visiblePhotos.map((photo, i) => {
              const idx = startIdx + i;
              const isActive = idx === currentIndex;
              const isSelected = selectedIds.has(photo.id);
              return (
                <button
                  key={photo.id}
                  data-index={idx}
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

            {/* Trailing spacer */}
            <div
              style={{ width: Math.max(0, (total - endIdx) * ITEM_WIDTH) }}
              className="shrink-0"
              aria-hidden="true"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

FilmStrip.displayName = 'FilmStrip';
export default FilmStrip;
