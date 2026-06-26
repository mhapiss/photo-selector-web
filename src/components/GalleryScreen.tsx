import React from 'react';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryHeader } from './GalleryHeader';
import { Gallery } from './Gallery';
import PhotoViewer from './PhotoViewer';
import { ManualPasteModal } from './ManualPasteModal';
import { SelectionBar } from './SelectionBar';
import { fetchDrivePhotos } from '../lib/fetchDrive';
import { recordSelection } from '../lib/recordSelection';
import type { AlbumMeta, LoadError, LoadState, PhotoFile } from '../types';


type GalleryScreenProps = {
  meta: AlbumMeta;
  selectedIds: Set<string>;
  selectionOrder: string[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onReview: () => void;
  onPhotosLoaded: (photos: PhotoFile[]) => void;
};

// ==========================================
// UI LAYER COMPONENTS (Struktur Baru)
// ==========================================

// 1. BackgroundLayer: Animated Aurora + Depth + Noise + Vignette
const BackgroundLayer = React.memo(() => {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#050508]">
      {/* Aurora Mesh / Blob Gradient */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] rounded-full bg-[#3b1d6e] blur-[120px] mix-blend-screen"
        animate={{
          x: prefersReducedMotion ? 0 : [0, 150, -100, 0],
          y: prefersReducedMotion ? 0 : [0, -100, 150, 0],
          scale: prefersReducedMotion ? 1 : [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{ opacity: 0.6 }}
      />
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 w-[150%] h-[150%] rounded-full bg-[#1d4b6e] blur-[100px] mix-blend-screen"
        animate={{
          x: prefersReducedMotion ? 0 : [0, -120, 80, 0],
          y: prefersReducedMotion ? 0 : [0, 120, -80, 0],
          scale: prefersReducedMotion ? 1 : [1, 0.8, 1.3, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{ opacity: 0.4 }}
      />
      
      {/* Depth Fog / Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_#050508_90%)]" />
      
      {/* Soft Noise Texture (Data URI) */}
      <div 
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />
    </div>
  );
});

// 2. FloatingHeader: Arc Browser / Apple Photos Style
const FloatingHeaderWrapper = React.memo(({ 
  children, 
  showHeader 
}: { 
  children: React.ReactNode; 
  showHeader: boolean; 
}) => {
  return (
    <AnimatePresence>
      {showHeader && (
        <motion.div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-32px)] sm:w-auto max-w-4xl pointer-events-auto"
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          style={{ paddingTop: 'env(safe-area-inset-top, 8px)' }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#ffffff]/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-full">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// 3. OverlayManager: Darken, Blur, Scale Gallery saat Viewer terbuka
const GallerySurface = React.memo(({ 
  children, 
  isViewerOpen 
}: { 
  children: React.ReactNode; 
  isViewerOpen: boolean;
}) => {
  return (
    <motion.main
      className="relative z-10 mx-auto w-full px-4 sm:px-8 lg:px-12 xl:px-16 pb-32 pt-24 max-w-[1600px]"
      animate={{
        scale: isViewerOpen ? 0.96 : 1,
        filter: isViewerOpen ? 'brightness(0.7) blur(12px)' : 'brightness(1) blur(0px)',
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.main>
  );
});

// ==========================================
// MAIN COMPONENT
// ==========================================

export function GalleryScreen({
  meta,
  selectedIds,
  selectionOrder,
  onToggle,
  onBack,
  onReview,
  onPhotosLoaded,
}: GalleryScreenProps) {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [showHeader, setShowHeader] = useState(true);
  
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  // Stabilkan referensi onPhotosLoaded
  const onPhotosLoadedRef = useRef(onPhotosLoaded);
  useEffect(() => {
    onPhotosLoadedRef.current = onPhotosLoaded;
  }, [onPhotosLoaded]);

  const load = useCallback(async () => {
    setLoadState('loading');
    setLoadError(null);

    const result = await fetchDrivePhotos(meta.folderId);

    if (result.ok) {
      setPhotos(result.photos);
      onPhotosLoadedRef.current(result.photos);
      setLoadState('success');
    } else {
      setLoadError(result.error);
      setLoadState('error');
    }
  }, [meta.folderId]);

  useEffect(() => {
    load();
  }, [load]);

  // Validasi viewerIndex
  useEffect(() => {
    if (viewerIndex === null) return;
    if (viewerIndex < 0 || viewerIndex >= photos.length) {
      setViewerIndex(null);
    }
  }, [viewerIndex, photos.length]);

  // === Logic Kustom: Header Auto Hide (Sama seperti Viewer, tapi diterapkan ke Header) ===
  const resetHeaderTimeout = useCallback(() => {
    setShowHeader(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      setShowHeader(false);
    }, 3500);
  }, []);

  useEffect(() => {
    resetHeaderTimeout();
    window.addEventListener('mousemove', resetHeaderTimeout);
    window.addEventListener('touchstart', resetHeaderTimeout);
    return () => {
      window.removeEventListener('mousemove', resetHeaderTimeout);
      window.removeEventListener('touchstart', resetHeaderTimeout);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [resetHeaderTimeout]);

  // === Logic yang TIDAK BERUBAH ===
  const handleManualConfirm = useCallback(
    (manualPhotos: PhotoFile[]) => {
      setPhotos(manualPhotos);
      onPhotosLoadedRef.current(manualPhotos);
      setManualMode(false);
      setLoadError(null);
      setLoadState('success');
      setViewerIndex(null);
    },
    [],
  );

  const handleSend = useCallback(() => {
    if (selectedIds.size === 0) return;
    const selected = photos.filter((p) => selectedIds.has(p.id));
    void recordSelection(meta, selected);
    onReview();
  }, [selectedIds, photos, meta, onReview]);

  const handleClearAll = useCallback(() => {
    selectionOrder.forEach((id) => onToggle(id));
  }, [selectionOrder, onToggle]);

  const currentPhoto = useMemo(() => {
    if (viewerIndex === null) return null;
    if (viewerIndex < 0 || viewerIndex >= photos.length) return null;
    return photos[viewerIndex] ?? null;
  }, [viewerIndex, photos]);

  const currentSelectionIndex = useMemo(() => {
    if (!currentPhoto) return null;
    const idx = selectionOrder.indexOf(currentPhoto.id);
    return idx >= 0 ? idx : null;
  }, [currentPhoto, selectionOrder]);

  const isViewerOpen = viewerIndex !== null && currentPhoto !== null;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#050508]">
      
      {/* 1. Layer Animasi Background */}
      <BackgroundLayer />

      {/* 2. Floating Header (Glassmorphism, Arc Browser Style) */}
      <FloatingHeaderWrapper showHeader={showHeader}>
        <GalleryHeader
          eventName={meta.eventName}
          photoCount={photos.length}
          selectedCount={selectedIds.size}
          onBack={onBack}
          onSend={handleSend}
        />
      </FloatingHeaderWrapper>

      {/* 3. Gallery Surface (Dengan Scale + Blur effect saat Viewer terbuka) */}
      <GallerySurface isViewerOpen={isViewerOpen}>
        <Gallery
          photos={photos}
          loadState={loadState}
          loadError={loadError}
          selectedIds={selectedIds}
          selectionOrder={selectionOrder}
          onToggle={onToggle}
          onRetry={load}
          onManualPaste={() => setManualMode(true)}
          onOpenPhoto={setViewerIndex}
        />
      </GallerySurface>

      {/* 4. Floating Selection Bar (Dengan Layout Animation Spring) */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            layout
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-[90vw] sm:max-w-md pointer-events-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
          >
            <SelectionBar
              count={selectedIds.size}
              onReview={handleSend}
              onClear={handleClearAll}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Photo Viewer Overlay Manager */}
      <AnimatePresence mode="wait">
        {isViewerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-[#050508]/80 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            {/* Viewer Logic Tetap Identik */}
            <PhotoViewer
              photos={photos}
              index={viewerIndex!}
              selected={selectedIds.has(currentPhoto!.id)}
              selectionIndex={currentSelectionIndex}
              onClose={() => setViewerIndex(null)}
              onNavigate={setViewerIndex}
              onToggle={onToggle}
            />
          </>
        )}
      </AnimatePresence>

      {/* 6. Modal Layer */}
      <ManualPasteModal
        open={manualMode}
        onClose={() => setManualMode(false)}
        onConfirm={handleManualConfirm}
      />
    </div>
  );
}