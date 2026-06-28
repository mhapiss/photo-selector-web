import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhotoFile } from '../../types';

// Hooks
import { useImageLoader } from './hooks/useImageLoader';
import { useAutoHideControls } from './hooks/useAutoHideControls';
import { usePhotoViewerGestures } from './hooks/usePhotoViewerGestures';
import { usePhotoViewerKeyboard } from './hooks/usePhotoViewerKeyboard';

// UI Components
import { TopBar } from './ui/TopBar';
import { MobileBottomBar } from './ui/MobileBottomBar';
import { DesktopZoomBar } from './ui/DesktopZoomBar';
import { InfoSheet } from './ui/InfoSheet';
import { FilmStrip } from './ui/FilmStrip';
import {
  BackgroundLayer,
  LoadingState,
  ErrorState,
  NavArrow,
  FullResBadge
} from './ui/States';

export type PhotoViewerProps = {
  photos: PhotoFile[];
  index: number;
  selected: boolean;
  selectionIndex?: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
  onToggle: (id: string) => void;
};

const springTransition = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 30,
  mass: 0.8,
};

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  photos,
  index,
  selected,
  selectionIndex = null,
  onClose,
  onNavigate,
  onToggle,
}) => {
  // ── States ──
  const [rotation, setRotation] = useState(0);
  const [fullResMode, setFullResMode] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // ── Responsive detection ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const photo = useMemo(() => photos[index], [photos, index]);
  const selectedIds = useMemo(() => {
    const ids = new Set<string>();
    if (selected && photo) ids.add(photo.id);
    return ids;
  }, [selected, photo]);

  // ── Hooks Integration ──
  const { imageUrl, isLoading, imageError, load, prefetch } = useImageLoader(photo, fullResMode);
  const { showControls, show: showCtrl, toggle: toggleCtrl } = useAutoHideControls(containerRef);

  const canPrev = index > 0;
  const canNext = index < photos.length - 1;

  const goPrev = useCallback(() => {
    if (canPrev) {
      onNavigate(index - 1);
      showCtrl();
    }
  }, [canPrev, index, onNavigate, showCtrl]);

  const goNext = useCallback(() => {
    if (canNext) {
      onNavigate(index + 1);
      showCtrl();
    }
  }, [canNext, index, onNavigate, showCtrl]);

  const {
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
    swipeX
  } = usePhotoViewerGestures({
    isLocked,
    goPrev,
    goNext,
    canPrev,
    canNext,
    containerRef,
    showCtrl,
    toggleCtrl,
    index
  });

  const handleRotate = useCallback(() => {
    setRotation(r => (r + 90) % 360);
    showCtrl();
  }, [showCtrl]);

  const handleToggleFullRes = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFullResMode(v => !v);
    showCtrl();
  }, [showCtrl]);

  const handleDownload = useCallback(() => {
    if (!photo) return;
    const url = photo.directUrl || photo.thumbnailUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = photo.name ?? 'foto';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [photo]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const handleToggleLock = useCallback(() => {
    setIsLocked(prev => !prev);
    showCtrl();
  }, [showCtrl]);

  // Keyboard Navigation & Shortcuts
  usePhotoViewerKeyboard({
    onClose,
    goPrev,
    goNext,
    onNavigate,
    onToggle,
    onRotate: handleRotate,
    onToggleFullscreen: toggleFullscreen,
    onToggleLock: handleToggleLock,
    onZoomIn: () => applyZoom(zoom + 0.5),
    onZoomOut: () => applyZoom(zoom - 0.5),
    onResetZoom: () => applyZoom(1),
    photosLength: photos.length,
    currentIndex: index,
    activePhotoId: photo?.id,
    isImageReady: !isLoading && !imageError && !!imageUrl
  });

  // iOS Body Scroll Lock
  useEffect(() => {
    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Reset rotation and details when index changes
  useEffect(() => {
    setRotation(0);
    setFullResMode(false);
    setShowInfo(false);
  }, [index]);

  // Prefetch neighboring images for seamless performance
  useEffect(() => {
    if (!photo) return;
    if (index > 0) prefetch(photos[index - 1]);
    if (index < photos.length - 1) prefetch(photos[index + 1]);
  }, [index, photo, photos, prefetch]);

  if (!photo) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#040406]">
        <p className="text-white/30 text-sm">Foto tidak tersedia</p>
      </div>
    );
  }

  const isImageReady = !isLoading && !imageError && !!imageUrl;

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[100] overflow-hidden select-none"
      style={{
        touchAction: 'none',
        background: '#040406',
        cursor: isDragging ? 'grabbing' : zoom > 1 && !isLocked ? 'grab' : 'default',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onPointerDown={onMouseDown}
      onPointerMove={onMouseMove}
      onPointerUp={onMouseUp}
      onPointerCancel={onMouseUp}
    >
      {/* Background layer */}
      <BackgroundLayer darken={!showControls} />

      {/* Top Bar with Center Counter */}
      <TopBar
        photo={photo}
        showControls={showControls}
        onClose={onClose}
        selected={selected}
        selectionIndex={selectionIndex}
        onToggleSelect={() => onToggle(photo.id)}
        onRotate={handleRotate}
        onDownload={handleDownload}
        onToggleInfo={() => setShowInfo(v => !v)}
        onToggleFullscreen={toggleFullscreen}
        isImageReady={isImageReady}
        isMobile={isMobile}
        isLocked={isLocked}
        onToggleLock={handleToggleLock}
        currentIndex={index}
        totalCount={photos.length}
      />

      {/* Full-res Toggle Badge */}
      <FullResBadge
        show={showControls}
        active={fullResMode}
        onToggle={handleToggleFullRes}
        isImageReady={isImageReady}
      />

      {/* Info details sidebar/bottom-sheet */}
      <InfoSheet
        photo={photo}
        fullResMode={fullResMode}
        show={showInfo}
        onClose={() => setShowInfo(false)}
        isMobile={isMobile}
      />

      {/* Main viewport area */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Loading Spinner */}
        {isLoading && <LoadingState thumbnailUrl={photo.thumbnailUrl} />}

        {/* Loading Error */}
        {imageError && !isLoading && (
          <ErrorState onRetry={load} />
        )}

        {/* Image element with transforms */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ x: swipeX }}
        >
          <AnimatePresence mode="wait">
            {isImageReady && (
              <motion.img
                key={photo.id + String(fullResMode) + imageUrl}
                src={imageUrl}
                alt={photo.name || 'Foto'}
                draggable={false}
                className="pointer-events-none select-none"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  padding: isMobile
                    ? 'max(env(safe-area-inset-top),56px) 8px max(env(safe-area-inset-bottom),110px) 8px'
                    : '72px 80px 140px 80px', // padding accounts for topbar and filmstrip
                  boxSizing: 'border-box',
                  x: pan.x,
                  y: pan.y,
                  scale: zoom,
                  rotate: rotation,
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                }}
                initial={{ opacity: 0, filter: 'blur(12px)', scale: 0.98 }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* FilmStrip component */}
      <FilmStrip
        photos={photos}
        currentIndex={index}
        selectedIds={selectedIds}
        onNavigate={onNavigate}
        show={showControls && isImageReady}
      />

      {/* Navigation arrows (Desktop only) */}
      <NavArrow
        direction="prev"
        show={showControls && isImageReady && canPrev}
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
      />
      <NavArrow
        direction="next"
        show={showControls && isImageReady && canNext}
        onClick={(e) => { e.stopPropagation(); goNext(); }}
      />

      {/* Bottom Dock Zoom Bar (Mobile vs Desktop) */}
      {isMobile ? (
        <MobileBottomBar
          show={showControls}
          selected={selected}
          selectionIndex={selectionIndex}
          onToggleSelect={() => onToggle(photo.id)}
          zoom={zoom}
          isImageReady={isImageReady}
          onZoomOut={() => applyZoom(zoom - 0.5)}
          onZoomIn={() => applyZoom(zoom + 0.5)}
          onResetZoom={() => applyZoom(1)}
          canPrev={canPrev}
          canNext={canNext}
          onPrev={goPrev}
          onNext={goNext}
        />
      ) : (
        <DesktopZoomBar
          show={showControls}
          zoom={zoom}
          isImageReady={isImageReady}
          onZoomOut={() => applyZoom(zoom - 0.5)}
          onZoomIn={() => applyZoom(zoom + 0.5)}
          onResetZoom={() => applyZoom(1)}
          canPrev={canPrev}
          canNext={canNext}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}

      {/* ALWAYS VISIBLE PRIMARY SELECT PHOTO CTA (INSERTED BELOW ZOOM BAR) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-40 pointer-events-auto w-[90%] sm:w-[340px]"
        style={{
          bottom: 'max(env(safe-area-inset-bottom), 12px)',
        }}
      >
        <motion.button
          onClick={() => onToggle(photo.id)}
          className={`w-full h-12 flex items-center justify-center gap-2 rounded-full font-semibold text-sm transition-colors duration-200 border shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-black ${
            selected
              ? 'bg-emerald-500 border-emerald-400/50 text-white shadow-emerald-500/20'
              : 'border-white/10 text-white hover:bg-white/10'
          }`}
          style={selected ? {} : {
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            background: 'rgba(255, 255, 255, 0.12)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={springTransition}
          aria-label={selected ? 'Batalkan pilihan' : 'Pilih foto'}
        >
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key="checked"
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={springTransition}
              >
                <motion.svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={springTransition}
                >
                  <path d="M20 6 9 17l-5-5" />
                </motion.svg>
                <span>✓ Selected</span>
                {typeof selectionIndex === 'number' && (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-[10px] font-bold font-mono">
                    #{selectionIndex + 1}
                  </span>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="unchecked"
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={springTransition}
              >
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/60" />
                <span>Select Photo</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default React.memo(PhotoViewer);