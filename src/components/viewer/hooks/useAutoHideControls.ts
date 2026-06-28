import { useState, useCallback, useEffect, useRef } from 'react';

export function useAutoHideControls(containerRef: React.RefObject<HTMLDivElement>, timeoutMs = 3500) {
  const [showControls, setShowControls] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback(() => {
    setShowControls(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShowControls(false), timeoutMs);
  }, [timeoutMs]);

  const toggle = useCallback(() => {
    setShowControls(prev => {
      const next = !prev;
      if (timer.current) clearTimeout(timer.current);
      if (next) timer.current = setTimeout(() => setShowControls(false), timeoutMs);
      return next;
    });
  }, [timeoutMs]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = () => show();
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', onMove);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onMove);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [containerRef, show]);

  useEffect(() => {
    show();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [show]);

  return { showControls, show, toggle };
}
