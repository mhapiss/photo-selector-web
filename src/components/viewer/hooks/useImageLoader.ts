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
  const id =
    photo.id ||
    extractDriveFileId(photo.directUrl || '') ||
    extractDriveFileId(photo.thumbnailUrl || '');
  if (id) {
    if (fullRes) {
      urls.push(`https://drive.google.com/thumbnail?id=${id}&sz=s0`);
      urls.push(driveLargeUrl(id));
      urls.push(driveMediumUrl(id));
    } else {
      urls.push(driveLargeUrl(id));
      urls.push(driveMediumUrl(id));
      urls.push(driveThumbUrl(id, 800));
    }
    urls.push(`https://lh3.googleusercontent.com/d/${id}=s1600`);
    urls.push(`https://lh3.googleusercontent.com/d/${id}=s0`);
  }
  if (photo.thumbnailUrl && !photo.thumbnailUrl.includes('/file/d/')) {
    urls.push(photo.thumbnailUrl);
  }
  if (photo.webContentLink) {
    urls.push(photo.webContentLink);
  }
  if (photo.directUrl && !photo.directUrl.includes('/file/d/')) {
    urls.push(photo.directUrl);
  }
  return [...new Set(urls.filter(Boolean))];
}

export function useImageLoader(photo: PhotoFile | undefined, fullRes: boolean) {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const load = useCallback(() => {
    if (!photo) { setImageError(true); setIsLoading(false); return; }
    const urls = buildImageUrls(photo, fullRes);
    if (!urls.length) { setImageError(true); setIsLoading(false); return; }

    setIsLoading(true);
    setImageError(false);
    setImageUrl('');

    let attempt = 0;
    let cancelled = false;

    const tryNext = () => {
      if (cancelled || attempt >= urls.length) {
        if (!cancelled) { setImageError(true); setIsLoading(false); }
        return;
      }
      const url = urls[attempt++];
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        if (!cancelled) { setImageUrl(url); setIsLoading(false); setImageError(false); }
      };
      img.onerror = () => {
        if (!cancelled) tryNext();
      };
      img.src = url;
      setTimeout(() => {
        if (!cancelled && !img.complete) {
          img.onload = null;
          img.onerror = null;
          tryNext();
        }
      }, 8000);
    };

    tryNext();
    return () => { cancelled = true; };
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

  return { imageUrl, isLoading, imageError, load, prefetch };
}
