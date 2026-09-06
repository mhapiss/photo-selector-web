import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryHeader } from '../components/gallery/GalleryHeader';
import { Gallery } from '../components/gallery/Gallery';
import PhotoViewer from '../components/viewer/PhotoViewer';
import { ManualPasteModal } from '../components/gallery/ManualPasteModal';
import { SelectionBar } from '../components/gallery/SelectionBar';
import { recordSelection } from '../services/trackingService';
import type { AlbumMeta, PhotoFile } from '../types';
import { useGallery } from '../hooks/useGallery';
import { BackgroundLayer } from '../components/gallery/BackgroundLayer';
import { GallerySurface } from '../components/gallery/GallerySurface';

type GalleryPageProps = {
  meta: AlbumMeta;
  selectedIds: Set<string>;
  selectionOrder: string[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onReview: () => void;
  onPhotosLoaded: (photos: PhotoFile[]) => void;
};

export function GalleryPage({
  meta,
  selectedIds,
  selectionOrder,
  onToggle,
  onBack,
  onReview,
  onPhotosLoaded,
}: GalleryPageProps) {
  const {
    photos,
    loadState,
    loadError,
    manualMode,
    setManualMode,
    viewerIndex,
    setViewerIndex,
    load,
    handleManualConfirm,
    currentPhoto,
    currentSelectionIndex,
    isViewerOpen,
  } = useGallery(meta.folderId, onPhotosLoaded, selectionOrder);

  const handleSend = useCallback(() => {
    if (selectedIds.size === 0) return;
    const selected = photos.filter((p) => selectedIds.has(p.id));
    void recordSelection(meta, selected);
    onReview();
  }, [selectedIds, photos, meta, onReview]);

  const handleClearAll = useCallback(() => {
    selectionOrder.forEach((id) => onToggle(id));
  }, [selectionOrder, onToggle]);

  return (
    <div className="relative min-h-[100dvh] w-full bg-background">
      <BackgroundLayer />

      <GalleryHeader
        meta={meta}
        eventName={meta.eventName}
        photoCount={photos.length}
        selectedCount={selectedIds.size}
        onBack={onBack}
        onSend={handleSend}
      />

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
            <PhotoViewer
              photos={photos}
              index={viewerIndex ?? 0}
              selected={selectedIds.has(currentPhoto?.id ?? '')}
              selectionIndex={currentSelectionIndex}
              onClose={() => setViewerIndex(null)}
              onNavigate={setViewerIndex}
              onToggle={onToggle}
              meta={meta}
            />
          </>
        )}
      </AnimatePresence>

      <ManualPasteModal
        open={manualMode}
        onClose={() => setManualMode(false)}
        onConfirm={handleManualConfirm}
      />
    </div>
  );
}
