import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, FileImage, RefreshCw } from 'lucide-react';
import type { PhotoFile } from '../../types';

type PhotoCardProps = {
  photo: PhotoFile;
  selected: boolean;
  selectionIndex: number | null;
  onToggle: (id: string) => void;
  onOpen: () => void;
};

/**
 * Pick thumbnail size based on viewport width to avoid downloading
 * oversized images on mobile. Matches card sizes:
 * - Mobile 2-col (~180px cards) → 200px thumbnail
 * - Mobile 3-col (~120px cards) → 150px thumbnail  
 * - Tablet/Desktop → 250px thumbnail
 */
function getResponsiveThumbSize(): number {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
  if (w < 400) return 200; // 2-col mobile
  if (w < 640) return 200; // 3-col mobile, cards ~180px
  if (w < 1024) return 250; // tablet
  return 300; // desktop
}

function PhotoCardComponent({ photo, selected, selectionIndex, onToggle, onOpen }: PhotoCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);

  const thumbnailUrls = useMemo(() => {
    const sz = getResponsiveThumbSize();
    const urls: string[] = [];
    if (photo.thumbnailUrl) {
      // Resize thumbnail to match actual card size
      urls.push(photo.thumbnailUrl.replace(/=s\d+/, `=s${sz}`).replace(/=w\d+/, `=s${sz}`));
      urls.push(photo.thumbnailUrl);
    }
    urls.push(
      `https://drive.google.com/thumbnail?id=${photo.id}&sz=w${sz}`,
      `https://lh3.googleusercontent.com/d/${photo.id}=s${sz}`,
    );
    if (photo.webContentLink) urls.push(photo.webContentLink);
    if (photo.directUrl) urls.push(photo.directUrl);
    urls.push(`https://drive.google.com/uc?id=${photo.id}&export=download`);
    return [...new Set(urls.filter(Boolean))];
  }, [photo]);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setUrlIndex(0);
  }, [photo.id]);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); onToggle(photo.id); },
    [onToggle, photo.id]
  );

  const handleImageError = useCallback(() => {
    if (urlIndex < thumbnailUrls.length - 1) {
      setUrlIndex(v => v + 1);
      setIsLoaded(false);
      setHasError(false);
    } else {
      setHasError(true);
    }
  }, [urlIndex, thumbnailUrls.length]);

  const currentUrl = thumbnailUrls[urlIndex] ?? photo.thumbnailUrl;
  const showFallback = !currentUrl || hasError;

  return (
    <div
      className="group relative block w-full overflow-hidden bg-surface shadow-xs transition-shadow hover:shadow-md"
      style={{
        borderRadius: 12,
        outline: selected ? '3px solid var(--color-primary)' : '1px solid var(--color-border)',
        outlineOffset: selected ? 2 : 0,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto 200px',
      }}
    >
      {/* Image area */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Buka foto ${photo.name}`}
        className="block w-full text-left focus:outline-none"
      >
        <div className="relative aspect-square overflow-hidden bg-surface">
          {!showFallback ? (
            <>
              {/* Loading placeholder */}
              {!isLoaded && (
                <div className="absolute inset-0 skeleton" />
              )}
              <img
                src={currentUrl}
                alt={photo.name}
                loading="lazy"
                decoding="async"
                draggable={false}
                className={[
                  'h-full w-full object-cover no-drag',
                  'transition-all duration-300',
                  'group-hover:scale-[1.03]',
                  isLoaded ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
                onLoad={() => setIsLoaded(true)}
                onError={handleImageError}
                key={`${photo.id}-${urlIndex}`}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface">
              <FileImage size={20} className="text-dim" strokeWidth={1.5} />
              <span className="text-[10px] text-dim">
                {urlIndex >= thumbnailUrls.length - 1 ? 'Gagal muat' : 'Preview tidak tersedia'}
              </span>
              {urlIndex >= thumbnailUrls.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setUrlIndex(0); setHasError(false); setIsLoaded(false); }}
                  className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-muted hover:text-ink border border-border transition-colors"
                >
                  <RefreshCw size={9} /> Coba lagi
                </button>
              )}
            </div>
          )}

          {/* Hover overlay — filename only, appears on hover */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
          >
            <p className="truncate px-2.5 pb-2 pt-6 text-[10px] font-medium text-white/80">
              {photo.name}
            </p>
          </div>

          {/* Selected tint — very subtle */}
          {selected && (
            <div className="pointer-events-none absolute inset-0 bg-primary/8" />
          )}
        </div>
      </button>

      {/* Select toggle — top-right, 44×44 touch target */}
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={selected}
        aria-label={selected ? `Batal pilih ${photo.name}` : `Pilih ${photo.name}`}
        className="absolute right-0 top-0 z-10 flex h-11 w-11 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary touch-manipulation"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {selected ? (
            <motion.span
              key="on"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-primary"
              style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.12) inset' }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {typeof selectionIndex === 'number' ? (
                <span className="text-[10px] font-bold leading-none text-white">
                  {selectionIndex + 1}
                </span>
              ) : (
                <Check size={12} strokeWidth={3} className="text-white" />
              )}
            </motion.span>
          ) : (
            <motion.span
              key="off"
              className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-white/40 bg-black/40 opacity-0 group-hover:opacity-100 shadow-sm"
              style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.12 }}
            />
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

export const PhotoCard = memo(
  PhotoCardComponent,
  (prev, next) =>
    prev.photo.id === next.photo.id &&
    prev.selected === next.selected &&
    prev.selectionIndex === next.selectionIndex
);
