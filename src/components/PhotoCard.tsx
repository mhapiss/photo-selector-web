import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileImage, Check, RefreshCw } from 'lucide-react';
import type { PhotoFile } from '../types';

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
      className="group relative block w-full overflow-hidden rounded-xl bg-slate-100"
      style={{
        boxShadow: selected
          ? '0 0 0 2px rgba(120,60,240,0.9), 0 0 0 4px rgba(120,60,240,0.15), 0 8px 24px rgba(0,0,0,0.18)'
          : '0 1px 3px rgba(0,0,0,0.08)',
      }}
      animate={{
        boxShadow: selected
          ? '0 0 0 2px rgba(120,60,240,0.9), 0 0 0 4px rgba(120,60,240,0.15), 0 8px 24px rgba(0,0,0,0.18)'
          : '0 1px 3px rgba(0,0,0,0.08)',
        scale: 1,
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: selected
          ? '0 0 0 2px rgba(120,60,240,0.9), 0 0 0 4px rgba(120,60,240,0.2), 0 16px 40px rgba(0,0,0,0.22)'
          : '0 4px 20px rgba(0,0,0,0.14)',
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
      transition={{ layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open photo ${photo.name}`}
        className="block w-full text-left"
      >
        <div className="relative aspect-square overflow-hidden bg-slate-100">
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
                className="h-full w-full object-cover"
                onLoad={() => setIsLoaded(true)}
                onError={handleImageError}
                key={`${photo.id}-${urlIndex}`}
              />

              {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
                </div>
              )}
            </>
          ) : (
            <div
              className={`relative grid aspect-square place-items-center bg-gradient-to-br ${phase}`}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <FileImage
                  size={28}
                  className="text-slate-400/70"
                  strokeWidth={1.5}
                />
                <span className="px-3 text-[10px] font-medium text-slate-500/80">
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
                    className="mt-1 rounded-full bg-slate-200/50 p-1.5 hover:bg-slate-200/70"
                  >
                    <RefreshCw size={12} className="text-slate-600" />
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
          background: selected ? 'rgba(100,40,200,0.12)' : 'rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.25 }}
      />

      <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 truncate px-2 pb-2 pt-6 text-left text-[10px] font-medium text-white/95 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
        }}
      >
        {photo.name}
      </div>

      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={selected}
        aria-label={selected ? `Deselect ${photo.name}` : `Select ${photo.name}`}
        className="absolute right-2 top-2 z-10"
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
                  'linear-gradient(135deg, rgba(140,60,240,0.95) 0%, rgba(80,120,240,0.95) 100%)',
                boxShadow:
                  '0 2px 12px rgba(120,40,200,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
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
              className="grid place-items-center rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                width: 28,
                height: 28,
                border: '1.5px solid rgba(255,255,255,0.6)',
                background: 'rgba(0,0,0,0.25)',
                backdropFilter: 'blur(8px)',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              whileHover={{ opacity: 1 }}
            >
              <Check size={14} strokeWidth={3} className="text-white/80" />
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
                'linear-gradient(135deg, rgba(160,100,255,0.08) 0%, rgba(80,120,255,0.05) 50%, rgba(60,180,220,0.08) 100%)',
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