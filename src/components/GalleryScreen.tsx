import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryHeader } from './GalleryHeader';
import { Gallery } from './Gallery';
import { PhotoViewer } from './PhotoViewer';
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

  const load = useCallback(async () => {
    setLoadState('loading');
    setLoadError(null);

    const result = await fetchDrivePhotos(meta.folderId);

    if (result.ok) {
      setPhotos(result.photos);
      onPhotosLoaded(result.photos);
      setLoadState('success');
    } else {
      setLoadError(result.error);
      setLoadState('error');
    }
  }, [meta.folderId, onPhotosLoaded]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (viewerIndex === null) return;

    if (viewerIndex < 0 || viewerIndex >= photos.length) {
      setViewerIndex(null);
    }
  }, [viewerIndex, photos.length]);

  function handleManualConfirm(manualPhotos: PhotoFile[]) {
    setPhotos(manualPhotos);
    onPhotosLoaded(manualPhotos);
    setManualMode(false);
    setLoadError(null);
    setLoadState('success');
    setViewerIndex(null);
  }

  function handleSend() {
    if (selectedIds.size === 0) return;

    const selected = photos.filter((p) => selectedIds.has(p.id));
    void recordSelection(meta, selected);
    onReview();
  }

  function handleClearAll() {
    selectionOrder.forEach((id) => onToggle(id));
  }

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

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-x-hidden"
      style={{
        background:
          'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 30%, #0a0f1a 60%, #060a10 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 30% at 50% 0%, rgba(80,30,160,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 0% 50%, rgba(30,60,160,0.07) 0%, transparent 60%)',
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        }}
      />

      <GalleryHeader
        eventName={meta.eventName}
        photoCount={photos.length}
        selectedCount={selectedIds.size}
        onBack={onBack}
        onSend={handleSend}
      />

      <motion.main
        className="relative z-10 mx-auto w-full max-w-7xl pb-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
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
      </motion.main>

      <SelectionBar
        count={selectedIds.size}
        onReview={handleSend}
        onClear={handleClearAll}
      />

      <AnimatePresence>
        {viewerIndex !== null && currentPhoto && (
          <PhotoViewer
            photos={photos}
            index={viewerIndex}
            selected={selectedIds.has(currentPhoto.id)}
            selectionIndex={currentSelectionIndex}
            onClose={() => setViewerIndex(null)}
            onNavigate={setViewerIndex}
            onToggle={onToggle}
          />
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