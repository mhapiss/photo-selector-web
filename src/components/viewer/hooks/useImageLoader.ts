import { useState, useCallback, useEffect } from 'react';
import type { PhotoFile } from '../../../types';
import { driveThumbUrl, driveMediumUrl, driveLargeUrl } from '../../../services/driveService';

function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  let m = url.match(/\/(?:file\/)?d\/([A-Za-z0-9_-]{20,})/);
  if (m) return m[1];
  m = url.match(/[?&]id=([A-Za-z0-9_-]{20,})/);
  if (m) return m[1];
  return null;
}

function buildImageUrls(photo: PhotoFile, fullRes: boolean): string[] {
  const urls: string[] = [];
  
  if (fullRes && photo.directUrl) {
    urls.push(photo.directUrl); // 2000px via wsrv CDN
  }

  const id =
    photo.id ||
    extractDriveFileId(photo.directUrl || '') ||
    extractDriveFileId(photo.thumbnailUrl || '');
    
  if (id) {
    urls.push(driveLargeUrl(id)); // 1600px via wsrv CDN
    urls.push(driveMediumUrl(id)); // 1000px via wsrv CDN
    urls.push(driveThumbUrl(id, 800)); // 800px via wsrv CDN
  }
  
  if (photo.thumbnailUrl && !photo.thumbnailUrl.includes('/file/d/')) {
    urls.push(photo.thumbnailUrl);
  }
  
  return [...new Set(urls.filter(Boolean))];
}

export function useImageLoader(photo: PhotoFile | undefined, fullRes: boolean) {
  const [imageUrl, setImageUrl] = useState('');
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const load = useCallback(() => {
    if (!photo) { setImageError(true); setIsLoading(false); return; }
    const urls = buildImageUrls(photo, fullRes);
    if (!urls.length) { setImageError(true); setIsLoading(false); return; }

    setIsLoading(true);
    setImageError(false);
    setImageUrl('');
    setNaturalSize({ w: 0, h: 0 });

    let attempt = 0;
    let cancelled = false;
    let activeImg: HTMLImageElement | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanupActive = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (activeImg) {
        activeImg.onload = null;
        activeImg.onerror = null;
        activeImg.src = ''; // Cancel HTTP download immediately
        activeImg = null;
      }
    };

    const tryNext = () => {
      cleanupActive();
      
      if (cancelled) return;
      if (attempt >= urls.length) {
        setImageError(true);
        setIsLoading(false);
        return;
      }
      
      const url = urls[attempt++];
      const img = new Image();
      activeImg = img;
      img.referrerPolicy = 'no-referrer';
      
      img.onload = () => {
        if (!cancelled) {
          setImageUrl(url);
          setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
          setIsLoading(false);
          setImageError(false);
        }
      };
      
      img.onerror = () => {
        if (!cancelled) tryNext();
      };
      
      img.src = url;
      
      // Timeout fallback (wait 6s instead of 8s, then try next if stalled)
      timeoutId = setTimeout(() => {
        if (!cancelled && !img.complete) {
          tryNext();
        }
      }, 6000);
    };

    tryNext();
    
    return () => {
      cancelled = true;
      cleanupActive();
    };
  }, [photo, fullRes]);

  useEffect(() => { const cleanup = load(); return cleanup; }, [load]);

  const prefetch = useCallback((target: PhotoFile) => {
    const urls = buildImageUrls(target, false);
    if (urls.length) {
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.src = urls[0];
    }
  }, []);

  return { imageUrl, naturalSize, isLoading, imageError, load, prefetch };
}
