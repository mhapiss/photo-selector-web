import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageOff, RefreshCw, Search } from 'lucide-react';
import { PhotoCard } from './PhotoCard';
import { SearchBar } from './SearchBar';
import { SkeletonGrid } from './SkeletonGrid';
import {
  useVirtualGrid,
  useResponsiveColumns,
  naturalSort,
} from '../lib/useVirtualGrid';
import type { LoadError, LoadState, PhotoFile } from '../types';

const GAP = 8;
const ASPECT_RATIO = 1;
const MAX_AUTO_RETRIES = 3;
const AUTO_RETRY_DELAY = 3000; // 3 detik

type GalleryProps = {
  photos: PhotoFile[];
  loadState: LoadState;
  loadError: LoadError | null;
  selectedIds: Set<string>;
  selectionOrder: string[];
  onToggle: (id: string) => void;
  onRetry: () => void;
  onManualPaste: () => void;
  onOpenPhoto: (index: number) => void;
};

export function Gallery({
  photos,
  loadState,
  loadError,
  selectedIds,
  selectionOrder,
  onToggle,
  onRetry,
  onManualPaste,
  onOpenPhoto,
}: GalleryProps) {
  const [query, setQuery] = useState('');
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sortedPhotos = useMemo(
    () => [...photos].sort((a, b) => naturalSort(a.name, b.name)),
    [photos]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return sortedPhotos;
    const q = query.toLowerCase().trim();
    return sortedPhotos.filter((p) => p.name.toLowerCase().includes(q));
  }, [sortedPhotos, query]);

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    selectionOrder.forEach((id, i) => map.set(id, i));
    return map;
  }, [selectionOrder]);

  const photoIndexById = useMemo(() => {
    const map = new Map<string, number>();
    photos.forEach((photo, index) => map.set(photo.id, index));
    return map;
  }, [photos]);

  const { containerRef: responsiveContainerRef, columnCount: responsiveColumnCount } = useResponsiveColumns();

  const {
    containerRef: virtualContainerRef,
    totalHeight,
    visibleRange,
    offsetY,
    columnCount,
  } = useVirtualGrid({
    itemCount: filtered.length,
    columnCount: responsiveColumnCount,
    gap: GAP,
    aspectRatio: ASPECT_RATIO,
    overscan: 8,
  });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      (
        virtualContainerRef as React.MutableRefObject<HTMLDivElement | null>
      ).current = node;
      (
        responsiveContainerRef as React.MutableRefObject<HTMLDivElement | null>
      ).current = node;
    },
    [virtualContainerRef, responsiveContainerRef]
  );

  const visibleItems = useMemo(() => {
    if (filtered.length === 0) return [];
    if (visibleRange.end > visibleRange.start) {
      return filtered.slice(visibleRange.start, visibleRange.end);
    }
    return filtered.slice(0, Math.min(filtered.length, columnCount * 20));
  }, [filtered, visibleRange.start, visibleRange.end, columnCount]);

  // ===== AUTO RETRY =====
  useEffect(() => {
    // Reset retry count saat photos berubah (berhasil load)
    setAutoRetryCount(0);
    // Bersihkan timeout jika ada
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, [photos]);

  useEffect(() => {
    // Hanya jalankan jika dalam state error dan belum mencapai batas maksimal
    if ((loadState === 'error' || loadError) && autoRetryCount < MAX_AUTO_RETRIES) {
      // Bersihkan timeout sebelumnya
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      // Set timeout untuk auto retry
      retryTimeoutRef.current = setTimeout(() => {
        setAutoRetryCount((prev) => prev + 1);
        onRetry();
      }, AUTO_RETRY_DELAY);

      return () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      };
    }
  }, [loadState, loadError, autoRetryCount, onRetry]);

  if (loadState === 'loading') {
    return (
      <div className="px-4 py-4">
        <div className="mb-4 h-11 w-full max-w-xs rounded-xl skeleton" />
        <SkeletonGrid count={12} />
      </div>
    );
  }

  if (loadState === 'error' || loadError) {
    const isAutoRetrying = autoRetryCount < MAX_AUTO_RETRIES;

    return (
      <motion.div
        className="flex min-h-[60dvh] flex-col items-center justify-center px-6 py-12 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.div
          className="mb-5 grid h-16 w-16 place-items-center rounded-2xl"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
        >
          <ImageOff size={28} className="text-red-400" strokeWidth={1.8} />
        </motion.div>

        <h3 className="text-base font-bold text-white/90 sm:text-lg">
          {isAutoRetrying ? 'Mencoba ulang...' : 'Album gagal dimuat'}
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/45">
          {isAutoRetrying
            ? `Percobaan ulang otomatis (${autoRetryCount + 1}/${MAX_AUTO_RETRIES})...`
            : loadError?.message ?? 'Terjadi kesalahan yang tidak terduga. Coba lagi.'}
        </p>

        {isAutoRetrying && (
          <motion.div
            className="mt-4 flex items-center gap-2 text-sm text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <RefreshCw size={14} className="animate-spin" />
            <span>Memuat ulang secara otomatis...</span>
          </motion.div>
        )}

        {!isAutoRetrying && (
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            {loadError?.code === 'api-key-missing' && (
              <motion.button
                onClick={onManualPaste}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(140,60,240,0.9) 0%, rgba(80,120,240,0.9) 100%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 0 16px rgba(120,40,200,0.3)',
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: '0 0 24px rgba(120,40,200,0.45)',
                }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                Tempel nama file manual
              </motion.button>
            )}

            <motion.button
              onClick={() => {
                setAutoRetryCount(0);
                onRetry();
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white/80"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.1)', scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              <RefreshCw size={15} strokeWidth={2} />
              Coba lagi
            </motion.button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="px-3 py-3 pb-28 sm:px-4 sm:py-4 sm:pb-32">
      <motion.div
        className="mb-4 max-w-md"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          resultCount={filtered.length}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            className="flex min-h-[40dvh] flex-col items-center justify-center text-center"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div
              className="mb-4 grid h-14 w-14 place-items-center rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Search size={22} className="text-white/30" strokeWidth={1.8} />
            </div>

            <p className="text-[15px] font-semibold text-white/70">
              Foto tidak ditemukan
            </p>
            <p className="mt-1.5 text-sm text-white/35">
              Coba kata kunci pencarian yang berbeda.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            ref={setRefs}
            className="relative rounded-xl"
          >
            <div
              className="relative"
              style={{
                height:
                  totalHeight > 0
                    ? totalHeight
                    : Math.ceil(filtered.length / columnCount) * 240,
              }}
            >
              <div
                className="absolute left-0 right-0"
                style={{ transform: `translateY(${offsetY}px)` }}
              >
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                    gap: `${GAP}px`,
                  }}
                >
                  {visibleItems.map((photo) => {
                    const actualIndex = photoIndexById.get(photo.id) ?? -1;

                    return (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        selected={selectedIds.has(photo.id)}
                        selectionIndex={indexById.get(photo.id) ?? null}
                        onToggle={onToggle}
                        onOpen={() => {
                          if (actualIndex >= 0) onOpenPhoto(actualIndex);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}