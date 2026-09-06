import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { fetchDrivePhotos } from '../services/driveService';
import { getCachedPhotos, setCachedPhotos } from '../services/metadataCache';
import type { LoadError, LoadState, PhotoFile } from '../types';

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

  const load = useCallback(async (cancelledRef?: { current: boolean }) => {
    setLoadState('loading');
    setLoadError(null);

    // Check metadata cache first — instant display if available
    const cached = getCachedPhotos(folderId);
    if (cached && cached.length > 0) {
      setPhotos(cached);
      onPhotosLoadedRef.current(cached);
      setLoadState('success');
      return;
    }

    const result = await fetchDrivePhotos(folderId);

    if (cancelledRef?.current) return;

    if (result.ok) {
      setPhotos(result.photos);
      onPhotosLoadedRef.current(result.photos);
      setLoadState('success');
      setCachedPhotos(folderId, result.photos);
    } else {
      setLoadError(result.error);
      setLoadState('error');
    }
  }, [folderId]);

  useEffect(() => {
    const cancelledRef = { current: false };
    setPhotos([]);
    load(cancelledRef);
    return () => {
      cancelledRef.current = true;
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
