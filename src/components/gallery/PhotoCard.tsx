import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileImage, Check, RefreshCw } from 'lucide-react';
import type { PhotoFile } from '../../types';

type PhotoCardProps = {
  photo: PhotoFile;
  selected: boolean;
  selectionIndex: number | null;
  onToggle: (id: string) => void;
  onOpen: () => void;
};

const PHASES = [
  'from-slate-100 to-slate-200',
  'from-blue-50 to-slate-200',
  'from-slate-100 to-blue-50',
] as const;

function PhotoCardComponent({
  photo,
  selected,
  selectionIndex,
  onToggle,
  onOpen,
}: PhotoCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);

  // Generate daftar URL prioritas (thumbnail, direct, fallback)
  const thumbnailUrls = useMemo(() => {
    const urls: string[] = [];
    if (photo.thumbnailUrl) urls.push(photo.thumbnailUrl);
    if (photo.directUrl) urls.push(photo.directUrl);
    if (photo.webContentLink) urls.push(photo.webContentLink);
    // Fallback dengan berbagai format Google Drive
    urls.push(
      `https://drive.google.com/thumbnail?id=${photo.id}&sz=w400`,
      `https://drive.google.com/uc?id=${photo.id}&export=download`,
      `https://lh3.googleusercontent.com/d/${photo.id}=s400`,
    );
    // Filter duplikat dan kosong
    return [...new Set(urls.filter(url => url && url.length > 0))];
  }, [photo]);

  // Reset state ketika photo berubah
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setUrlIndex(0);
  }, [photo.id]);

  const phase = useMemo(
    () => PHASES[photo.id.length % PHASES.length],
    [photo.id]
  );

  const handleToggle = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onToggle(photo.id);
    },
    [onToggle, photo.id]
  );

  // Fungsi ini dipanggil saat gambar gagal dimuat
  const handleImageError = useCallback(() => {
    if (urlIndex < thumbnailUrls.length - 1) {
      setUrlIndex(prev => prev + 1);
      setIsLoaded(false);
      setHasError(false);
    } else {
      setHasError(true);
      setIsLoaded(false);
    }
  }, [urlIndex, thumbnailUrls.length]);

  const currentUrl = thumbnailUrls[urlIndex] || photo.thumbnailUrl;
  const showFallback = !currentUrl || hasError;

  return (
    <motion.div
      layout
      whileHover="hover"
      initial="initial"
      className="group relative block w-full overflow-hidden rounded-xl bg-[#09090d] border border-white/5"
      style={{
        boxShadow: selected
          ? '0 0 0 2px rgba(139,92,246,0.9), 0 0 0 4px rgba(139,92,246,0.15), 0 8px 24px rgba(0,0,0,0.5)'
          : '0 4px 12px rgba(0,0,0,0.15)',
      }}
      animate={{
        boxShadow: selected
          ? '0 0 0 2px rgba(139,92,246,0.9), 0 0 0 4px rgba(139,92,246,0.15), 0 8px 24px rgba(0,0,0,0.5)'
          : '0 4px 12px rgba(0,0,0,0.15)',
        scale: 1,
      }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
      transition={{ layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
      variants={{
        hover: {
          scale: 1.015,
          boxShadow: selected
            ? '0 0 0 2px rgba(139,92,246,0.9), 0 0 0 4px rgba(139,92,246,0.22), 0 16px 40px rgba(0,0,0,0.6)'
            : '0 12px 32px rgba(0,0,0,0.3)',
          transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
        }
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Buka foto ${photo.name}`}
        className="block w-full text-left focus:outline-none"
      >
        <div className="relative aspect-square overflow-hidden bg-[#0a0a0f]">
          {!showFallback ? (
            <>
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${phase} transition-opacity duration-300 ${
                  isLoaded ? 'opacity-0' : 'opacity-100'
                }`}
              />

              <img
                src={currentUrl}
                alt={photo.name}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover will-change-[opacity,transform] transition-opacity duration-300 no-drag"
                onLoad={() => setIsLoaded(true)}
                onError={handleImageError}
                key={`${photo.id}-${urlIndex}`}
              />

              {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
                </div>
              )}
            </>
          ) : (
            <div
              className={`relative grid aspect-square place-items-center bg-gradient-to-br ${phase}`}
            >
              <div className="flex flex-col items-center gap-2 text-center p-3">
                <FileImage
                  size={24}
                  className="text-white/20"
                  strokeWidth={1.5}
                />
                <span className="px-2 text-[10px] font-medium text-white/30">
                  {urlIndex >= thumbnailUrls.length - 1 ? 'Gagal muat' : 'Preview tidak tersedia'}
                </span>
                {urlIndex >= thumbnailUrls.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUrlIndex(0);
                      setHasError(false);
                      setIsLoaded(false);
                    }}
                    className="mt-1 rounded-full bg-white/5 p-1.5 hover:bg-white/10 transition-colors"
                  >
                    <RefreshCw size={10} className="text-white/50" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </button>

      <motion.span
        className="pointer-events-none absolute inset-0"
        animate={{
          background: selected ? 'rgba(139,92,246,0.08)' : 'rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.25 }}
      />

      <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/5" />

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 truncate px-3 pb-2 pt-6 text-left text-[10px] font-medium text-white/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        }}
      >
        {photo.name}
      </div>

      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={selected}
        aria-label={selected ? `Batal pilih ${photo.name}` : `Pilih ${photo.name}`}
        className="absolute right-1 top-1 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-black/50 touch-manipulation"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {selected ? (
            <motion.span
              key="selected"
              className="grid place-items-center rounded-full"
              style={{
                width: 28,
                height: 28,
                background:
                  'linear-gradient(135deg, rgba(147,51,234,0.95) 0%, rgba(79,70,229,0.95) 100%)',
                boxShadow:
                  '0 2px 12px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
              initial={{ scale: 0, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {typeof selectionIndex === 'number' ? (
                <span className="text-[11px] font-bold leading-none text-white">
                  {selectionIndex + 1}
                </span>
              ) : (
                <Check size={14} strokeWidth={3} className="text-white" />
              )}
            </motion.span>
          ) : (
            <motion.span
              key="unselected"
              className="grid place-items-center rounded-full opacity-0 sm:opacity-0"
              style={{
                width: 28,
                height: 28,
                border: '1.5px solid rgba(255,255,255,0.4)',
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              variants={{
                initial: { scale: 0.8, opacity: 0 },
                hover: { scale: 1, opacity: 1 },
              }}
              transition={{ duration: 0.15 }}
            >
              <Check size={14} strokeWidth={3} className="text-white/70" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {selected && (
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(99,102,241,0.04) 50%, rgba(6,182,212,0.06) 100%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export const PhotoCard = memo(
  PhotoCardComponent,
  (prev, next) =>
    prev.photo.id === next.photo.id &&
    prev.selected === next.selected &&
    prev.selectionIndex === next.selectionIndex
);