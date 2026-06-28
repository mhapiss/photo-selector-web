import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { fetchDrivePhotos } from '../services/driveService';
import type { LoadError, LoadState, PhotoFile } from '../types';

export function useGallery(
  folderId: string,
  onPhotosLoaded: (photos: PhotoFile[]) => void,
  selectionOrder: string[]
) {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const onPhotosLoadedRef = useRef(onPhotosLoaded);
  useEffect(() => {
    onPhotosLoadedRef.current = onPhotosLoaded;
  }, [onPhotosLoaded]);

  const load = useCallback(async () => {
    setLoadState('loading');
    setLoadError(null);

    const result = await fetchDrivePhotos(folderId);

    if (result.ok) {
      setPhotos(result.photos);
      onPhotosLoadedRef.current(result.photos);
      setLoadState('success');
    } else {
      setLoadError(result.error);
      setLoadState('error');
    }
  }, [folderId]);

  useEffect(() => {
    load();
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
