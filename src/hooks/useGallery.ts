import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { fetchDrivePhotosStream } from '../services/driveService';
import { getCachedPhotos, setCachedPhotos, appendCachedPhotos } from '../services/metadataCache';
import type { LoadError, LoadState, PhotoFile } from '../types';

/** Extended load state: 'streaming' means first batch arrived, still loading more */
export type GalleryLoadState = LoadState | 'streaming';

export function useGallery(
  folderId: string,
  onPhotosLoaded: (photos: PhotoFile[]) => void,
  selectionOrder: string[]
) {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [loadState, setLoadState] = useState<GalleryLoadState>('loading');
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const onPhotosLoadedRef = useRef(onPhotosLoaded);
  useEffect(() => {
    onPhotosLoadedRef.current = onPhotosLoaded;
  }, [onPhotosLoaded]);

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (cancelledRef?: { current: boolean }) => {
    // Cancel any in-flight stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadState('loading');
    setLoadError(null);

    // Check metadata cache first — instant display if available
    const cached = getCachedPhotos(folderId);
    if (cached && cached.length > 0) {
      setPhotos(cached);
      onPhotosLoadedRef.current(cached);
      setLoadState('success');
      // Still re-fetch in background to get fresh data, but don't show loading
      fetchDrivePhotosStream(
        folderId,
        (_batch, done) => {
          if (controller.signal.aborted || cancelledRef?.current) return;
          if (done) {
            // Background refresh complete — cache will be updated below
          }
        },
        controller.signal,
      ).then((result) => {
        if (controller.signal.aborted || cancelledRef?.current) return;
        if (result.ok && result.photos.length > 0) {
          setPhotos(result.photos);
          onPhotosLoadedRef.current(result.photos);
          setCachedPhotos(folderId, result.photos);
        }
      }).catch(() => {});
      return;
    }

    // No cache — use streaming fetch with progressive rendering
    let receivedAny = false;

    const result = await fetchDrivePhotosStream(
      folderId,
      (batchPhotos, done, totalCount) => {
        if (controller.signal.aborted || cancelledRef?.current) return;

        if (batchPhotos.length > 0) {
          receivedAny = true;
          setPhotos((prev) => {
            const next = [...prev, ...batchPhotos];
            onPhotosLoadedRef.current(next);
            return next;
          });
          // Switch from 'loading' to 'streaming' after first batch
          setLoadState('streaming');
          // Progressively cache
          appendCachedPhotos(folderId, batchPhotos);
        }

        if (done) {
          setLoadState('success');
          if (totalCount !== undefined) {
            // Final cache write with complete data
            setPhotos((current) => {
              setCachedPhotos(folderId, current);
              return current;
            });
          }
        }
      },
      controller.signal,
    );

    if (controller.signal.aborted || cancelledRef?.current) return;

    if (!result.ok) {
      // If we already showed some photos from streaming, keep them visible
      if (receivedAny) {
        setLoadState('success');
      } else {
        setLoadError(result.error);
        setLoadState('error');
      }
    }
  }, [folderId]);

  useEffect(() => {
    const cancelledRef = { current: false };
    // Reset photos when folder changes
    setPhotos([]);
    load(cancelledRef);
    return () => {
      cancelledRef.current = true;
      abortRef.current?.abort();
    };
  }, [load]);

  useEffect(() => {
    if (viewerIndex === null) return;
    if (viewerIndex < 0 || viewerIndex >= photos.length) {
      setViewerIndex(null);
    }
  }, [viewerIndex, photos.length]);

  const handleManualConfirm = useCallback((manualPhotos: PhotoFile[]) => {
    setPhotos(manualPhotos);
    onPhotosLoadedRef.current(manualPhotos);
    setManualMode(false);
    setLoadError(null);
    setLoadState('success');
    setViewerIndex(null);
  }, []);

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

  return {
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
  };
}
