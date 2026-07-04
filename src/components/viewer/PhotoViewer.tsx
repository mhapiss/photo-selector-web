import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AlbumMeta, PhotoFile } from '../../types';

import { useImageLoader } from './hooks/useImageLoader';
import { useAutoHideControls } from './hooks/useAutoHideControls';
import { usePhotoViewerGestures } from './hooks/usePhotoViewerGestures';
import { usePhotoViewerKeyboard } from './hooks/usePhotoViewerKeyboard';

import { TopBar } from './ui/TopBar';
import { MobileBottomBar } from './ui/MobileBottomBar';
import { InfoSheet } from './ui/InfoSheet';
import { FilmStrip } from './ui/FilmStrip';
import { FloatingSelectButton } from './ui/FloatingSelectButton';
import {
  BackgroundLayer,
  LoadingState,
  ErrorState,
  NavArrow,
  FullResBadge,
} from './ui/States';

export type PhotoViewerProps = {
  photos: PhotoFile[];
  index: number;
  selected?: boolean;
  selectionIndex?: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
  onToggle?: (id: string) => void;
  meta?: AlbumMeta;
};

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  photos,
  index,
  selected = false,
  selectionIndex = null,
  onClose,
  onNavigate,
  onToggle,
  meta,
}) => {
  const [rotation, setRotation] = useState(0);
  const [fullResMode, setFullResMode] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  const photo = useMemo(() => photos[index], [photos, index]);
  const selectedIds = useMemo(() => {
    const ids = new Set<string>();
    if (selected && photo) ids.add(photo.id);
    return ids;
  }, [selected, photo]);

  const { imageUrl, naturalSize, isLoading, imageError, load, prefetch } = useImageLoader(photo, fullResMode);
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
    swipeX,
  } = usePhotoViewerGestures({
    isLocked,
    goPrev,
    goNext,
    canPrev,
    canNext,
    containerRef,
    wrapperRef: imageWrapperRef,
    showCtrl,
    toggleCtrl,
    index,
    naturalSize,
  });

  const handleRotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
    showCtrl();
  }, [showCtrl]);

  const handleToggleFullRes = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFullResMode((v) => !v);
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
    setIsLocked((prev) => !prev);
    showCtrl();
  }, [showCtrl]);

  const handleToggleSelect = useCallback(() => {
    if (!photo || !onToggle) return;
    onToggle(photo.id);
    showCtrl();
  }, [onToggle, photo, showCtrl]);

  usePhotoViewerKeyboard({
    onClose,
    goPrev,
    goNext,
    onNavigate,
    onToggle: onToggle || (() => {}),
    onRotate: handleRotate,
    onToggleFullscreen: toggleFullscreen,
    onToggleLock: handleToggleLock,
    onZoomIn: () => applyZoom(zoom + 0.5),
    onZoomOut: () => applyZoom(zoom - 0.5),
    onResetZoom: () => applyZoom(1),
    photosLength: photos.length,
    currentIndex: index,
    activePhotoId: photo?.id,
    isImageReady: !isLoading && !imageError && !!imageUrl,
  });

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

  useEffect(() => {
    setRotation(0);
    setFullResMode(false);
    setShowInfo(false);
  }, [index]);

  useEffect(() => {
    if (!photo) return;
    if (index > 0) prefetch(photos[index - 1]);
    if (index < photos.length - 1) prefetch(photos[index + 1]);
  }, [index, photo, photos, prefetch]);

  if (!photo) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#040406]">
        <p className="text-sm text-white/30">Foto tidak tersedia</p>
      </div>
    );
  }

  const isImageReady = !isLoading && !imageError && !!imageUrl;

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[100] overflow-hidden select-none"
      style={{
        height: '100dvh',
        minHeight: '100svh',
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
      <BackgroundLayer darken={!showControls} />

      <TopBar
        photo={photo}
        showControls={showControls}
        onClose={onClose}
        onRotate={handleRotate}
        onDownload={handleDownload}
        onToggleInfo={() => setShowInfo((v) => !v)}
        onToggleFullscreen={toggleFullscreen}
        isImageReady={isImageReady}
        isMobile={isMobile}
        isLocked={isLocked}
        onToggleLock={handleToggleLock}
        currentIndex={index}
        totalCount={photos.length}
        meta={meta}
        selected={selected}
        onToggleSelect={onToggle ? handleToggleSelect : undefined}
        zoom={zoom}
        onZoom={applyZoom}
      />

      <FullResBadge
        show={showControls}
        active={fullResMode}
        onToggle={handleToggleFullRes}
        isImageReady={isImageReady}
      />

      <InfoSheet
        photo={photo}
        fullResMode={fullResMode}
        show={showInfo}
        onClose={() => setShowInfo(false)}
        isMobile={isMobile}
      />

      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {isLoading && <LoadingState thumbnailUrl={photo.thumbnailUrl} />}
        {imageError && !isLoading && <ErrorState onRetry={load} />}

        <motion.div
          ref={imageWrapperRef}
          className="absolute left-0 right-0 flex items-center justify-center"
          animate={{
            top: showControls ? 56 : 0,
            bottom: showControls && !isMobile ? 72 : 0,
          }}
          style={{ 
            x: swipeX,
            paddingBottom: showControls && !isMobile ? 'env(safe-area-inset-bottom, 0px)' : 0
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
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
                  padding: 0,
                  boxSizing: 'border-box',
                  x: pan.x,
                  y: pan.y,
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                }}
                initial={{ opacity: 0, filter: 'blur(12px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: zoom, rotate: rotation }}
                exit={{ opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <FilmStrip
        photos={photos}
        currentIndex={index}
        selectedIds={selectedIds}
        onNavigate={onNavigate}
        show={showControls && isImageReady}
      />

      <NavArrow
        direction="prev"
        show={showControls && isImageReady && canPrev}
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
      />
      <NavArrow
        direction="next"
        show={showControls && isImageReady && canNext}
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
      />

      {isMobile && (
        <MobileBottomBar
          show={showControls}
          canPrev={canPrev}
          canNext={canNext}
          onPrev={goPrev}
          onNext={goNext}
          selected={selected}
          selectionIndex={selectionIndex}
          isImageReady={isImageReady}
          onToggleSelect={onToggle ? handleToggleSelect : undefined}
        />
      )}
    </motion.div>
  );
};

export default React.memo(PhotoViewer);
