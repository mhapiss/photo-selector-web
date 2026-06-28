import { useState, useEffect, useRef } from 'react';
import type { LoadError, LoadState, PhotoFile } from '../types';

const MAX_AUTO_RETRIES = 3;
const AUTO_RETRY_DELAY = 3000;

export function useGalleryAutoRetry(
  photos: PhotoFile[],
  loadState: LoadState,
  loadError: LoadError | null,
  onRetry: () => void
) {
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset retry count when photos load successfully
    setAutoRetryCount(0);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, [photos]);

  useEffect(() => {
    if ((loadState === 'error' || loadError) && autoRetryCount < MAX_AUTO_RETRIES) {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

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

  const isAutoRetrying = autoRetryCount < MAX_AUTO_RETRIES;

  return {
    autoRetryCount,
    isAutoRetrying,
  };
}
export default useGalleryAutoRetry;
