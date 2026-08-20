import { useState, useCallback } from 'react';

export function useAutoHideControls(containerRef: React.RefObject<HTMLDivElement>, timeoutMs = 3500) {
  const [showControls, setShowControls] = useState(true);

  const show = useCallback(() => {
    setShowControls(true);
  }, []);

  const toggle = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  return { showControls, show, toggle };
}
