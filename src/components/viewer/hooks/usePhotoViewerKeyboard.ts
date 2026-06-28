import { useEffect } from 'react';

type KeyboardHookProps = {
  onClose: () => void;
  goPrev: () => void;
  goNext: () => void;
  onNavigate: (index: number) => void;
  onToggle: (id: string) => void;
  onRotate: () => void;
  onToggleFullscreen: () => void;
  onToggleLock: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  photosLength: number;
  currentIndex: number;
  activePhotoId?: string;
  isImageReady: boolean;
};

export function usePhotoViewerKeyboard({
  onClose,
  goPrev,
  goNext,
  onNavigate,
  onToggle,
  onRotate,
  onToggleFullscreen,
  onToggleLock,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  photosLength,
  currentIndex,
  activePhotoId,
  isImageReady,
}: KeyboardHookProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keys when typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          } else {
            onClose();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        case 'Home':
          e.preventDefault();
          if (currentIndex > 0) onNavigate(0);
          break;
        case 'End':
          e.preventDefault();
          if (currentIndex < photosLength - 1) onNavigate(photosLength - 1);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          if (isImageReady) onRotate();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          onToggleLock();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          onToggleFullscreen();
          break;
        case '+':
        case '=':
          e.preventDefault();
          if (isImageReady) onZoomIn();
          break;
        case '-':
          e.preventDefault();
          if (isImageReady) onZoomOut();
          break;
        case '0':
          e.preventDefault();
          if (isImageReady) onResetZoom();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (activePhotoId) {
            onToggle(activePhotoId);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onClose,
    goPrev,
    goNext,
    onNavigate,
    onToggle,
    onRotate,
    onToggleFullscreen,
    onToggleLock,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    photosLength,
    currentIndex,
    activePhotoId,
    isImageReady,
  ]);
}
export default usePhotoViewerKeyboard;
