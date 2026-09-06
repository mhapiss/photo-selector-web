import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { fetchDrivePhotosStream } from '../services/driveService';
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
    
    setLoadState('streaming');

    const result = await fetchDrivePhotosStream(folderId, (batch, isDone) => {
      if (cancelledRef?.current) return;
      
      setPhotos(prev => {
        if (batch.length === 0 && !isDone) return prev;
        
        const newPhotos = [...prev, ...batch];
        // Deduplicate
        const uniqueMap = new Map();
        for (const p of newPhotos) {
          uniqueMap.set(p.id, p);
        }
        const unique = Array.from(uniqueMap.values());
        
        onPhotosLoadedRef.current(unique);
        
        if (isDone) {
          setCachedPhotos(folderId, unique);
        }
        return unique;
      });

      if (isDone) {
        setLoadState('success');
      }
    });

    if (cancelledRef?.current) return;

    if (!result.ok) {
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
