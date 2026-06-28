import { useState, useCallback, useEffect, useRef } from 'react';
import { animate, useMotionValue } from 'framer-motion';

type GestureHookProps = {
  isLocked: boolean;
  goPrev: () => void;
  goNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  showCtrl: () => void;
  toggleCtrl: () => void;
  index: number; // Reset gestures when index changes
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const SWIPE_THRESHOLD = 70;
const DOUBLE_TAP_MS = 280;

export function usePhotoViewerGestures({
  isLocked,
  goPrev,
  goNext,
  canPrev,
  canNext,
  containerRef,
  showCtrl,
  toggleCtrl,
  index,
}: GestureHookProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number; mx: number; my: number; px: number; py: number } | null>(null);
  const lastTapRef = useRef(0);
  const swipeStartRef = useRef(0);
  const isSwiping = useRef(false);
  const isPinching = useRef(false);

  const swipeX = useMotionValue(0);

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  // Reset gestures when photo changes
  useEffect(() => {
    zoomRef.current = 1;
    setZoom(1);
    panRef.current = { x: 0, y: 0 };
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
    animate(swipeX, 0, { duration: 0 });
  }, [index, swipeX]);

  const clampPan = useCallback((x: number, y: number, z: number) => {
    if (z <= 1) return { x: 0, y: 0 };
    const limitX = (window.innerWidth * (z - 1)) / 2;
    const limitY = (window.innerHeight * (z - 1)) / 2;
    return {
      x: Math.min(limitX, Math.max(-limitX, x)),
      y: Math.min(limitY, Math.max(-limitY, y)),
    };
  }, []);

  const applyZoom = useCallback((z: number) => {
    const safe = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
    zoomRef.current = safe;
    setZoom(safe);
    if (safe <= 1) {
      panRef.current = { x: 0, y: 0 };
      setPan({ x: 0, y: 0 });
    } else if (!isLocked) {
      const clamped = clampPan(panRef.current.x, panRef.current.y, safe);
      panRef.current = clamped;
      setPan(clamped);
    }
  }, [clampPan, isLocked]);

  const applyPan = useCallback((x: number, y: number) => {
    if (isLocked) return;
    const clamped = clampPan(x, y, zoomRef.current);
    panRef.current = clamped;
    setPan(clamped);
  }, [clampPan, isLocked]);

  // Non-passive wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      applyZoom(zoomRef.current + delta);
      showCtrl();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyZoom, showCtrl, containerRef]);

  // Touch Move prevention (passive: false)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, [containerRef]);

  // Mouse drag handler
  const onMouseDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (zoomRef.current <= 1 || isLocked) return;
    e.preventDefault();
    dragRef.current = { x: e.clientX, y: e.clientY, px: panRef.current.x, py: panRef.current.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    showCtrl();
  }, [showCtrl, isLocked]);

  const onMouseMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !dragRef.current || isLocked) return;
    applyPan(
      dragRef.current.px + (e.clientX - dragRef.current.x),
      dragRef.current.py + (e.clientY - dragRef.current.y),
    );
  }, [applyPan, isLocked]);

  const onMouseUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    dragRef.current = null;
    setTimeout(() => setIsDragging(false), 50);
  }, []);

  // Touch events (multi-touch zoom, swipe, single-touch drag)
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    showCtrl();
    if (e.touches.length === 2) {
      isPinching.current = true;
      isSwiping.current = false;
      dragRef.current = null;
      const t1 = e.touches[0], t2 = e.touches[1];
      pinchRef.current = {
        dist: Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY),
        zoom: zoomRef.current,
        mx: (t1.clientX + t2.clientX) / 2,
        my: (t1.clientY + t2.clientY) / 2,
        px: panRef.current.x,
        py: panRef.current.y,
      };
    } else if (e.touches.length === 1) {
      isPinching.current = false;
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
      if (zoomRef.current > 1 && !isLocked) {
        isSwiping.current = false;
        dragRef.current = { x: t.clientX, y: t.clientY, px: panRef.current.x, py: panRef.current.y };
      } else {
        isSwiping.current = true;
        swipeStartRef.current = t.clientX;
        swipeX.stop();
      }
    }
  }, [showCtrl, swipeX, isLocked]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const t1 = e.touches[0], t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchRef.current.zoom * (dist / pinchRef.current.dist)));
      const mx = (t1.clientX + t2.clientX) / 2;
      const my = (t1.clientY + t2.clientY) / 2;
      zoomRef.current = newZoom;
      setZoom(newZoom);
      if (newZoom > 1 && !isLocked) {
        const clamped = clampPan(
          pinchRef.current.px + (mx - pinchRef.current.mx),
          pinchRef.current.py + (my - pinchRef.current.my),
          newZoom,
        );
        panRef.current = clamped;
        setPan(clamped);
      } else {
        panRef.current = { x: 0, y: 0 };
        setPan({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      if (isSwiping.current) {
        const dx = t.clientX - swipeStartRef.current;
        const resistance = (dx > 0 && !canPrev) || (dx < 0 && !canNext) ? 0.25 : 0.85;
        swipeX.set(dx * resistance);
      } else if (dragRef.current && zoomRef.current > 1 && !isLocked) {
        applyPan(
          dragRef.current.px + (t.clientX - dragRef.current.x),
          dragRef.current.py + (t.clientY - dragRef.current.y),
        );
      }
    }
  }, [clampPan, applyPan, canPrev, canNext, swipeX, isLocked]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) return;
    if (isSwiping.current) {
      const dx = swipeX.get();
      if (dx > SWIPE_THRESHOLD && canPrev) {
        goPrev();
      } else if (dx < -SWIPE_THRESHOLD && canNext) {
        goNext();
      } else {
        animate(swipeX, 0, { type: 'spring', stiffness: 480, damping: 38 });
      }
    }
    if (touchStartRef.current && e.changedTouches.length > 0 && !isPinching.current) {
      const t = e.changedTouches[0];
      const dx = Math.abs(t.clientX - touchStartRef.current.x);
      const dy = Math.abs(t.clientY - touchStartRef.current.y);
      const dt = Date.now() - touchStartRef.current.time;
      if (dx < 14 && dy < 14 && dt < 250) {
        const now = Date.now();
        if (now - lastTapRef.current < DOUBLE_TAP_MS) {
          lastTapRef.current = 0;
          if (zoomRef.current > 1) applyZoom(1);
          else applyZoom(2.5);
        } else {
          lastTapRef.current = now;
          setTimeout(() => {
            if (lastTapRef.current !== 0) {
              toggleCtrl();
              lastTapRef.current = 0;
            }
          }, DOUBLE_TAP_MS);
        }
      }
    }
    isPinching.current = false;
    isSwiping.current = false;
    touchStartRef.current = null;
    dragRef.current = null;
    pinchRef.current = null;
  }, [swipeX, canPrev, canNext, goPrev, goNext, applyZoom, toggleCtrl]);

  return {
    zoom,
    pan,
    isDragging,
    applyZoom,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    swipeX,
  };
}
export default usePhotoViewerGestures;
