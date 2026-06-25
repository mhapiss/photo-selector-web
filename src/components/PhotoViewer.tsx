import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ImageOff,
  RefreshCw,
  Download,
  Info,
  FileImage,
  CheckSquare,
  Square,
  X,
  Maximize,
  ChevronsLeft,
  ChevronsRight,
  RotateCw,
  Fullscreen,
} from 'lucide-react';

// ===== TYPES =====
export type PhotoFile = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
  directUrl?: string;
  webContentLink?: string;
  width?: number;
  height?: number;
  exif?: {
    make?: string;
    model?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    focalLength?: string;
  };
};

// ===== MOCK DATA (dengan URL yang dijamin bisa di-load) =====
const MOCK_PHOTOS: PhotoFile[] = [
  {
    id: '1',
    name: 'DSCF7471.JPG',
    size: 12870000,
    mimeType: 'image/jpeg',
    directUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=60',
    width: 6000,
    height: 4000,
    exif: { make: 'FUJIFILM', model: 'X-T20', iso: 200, aperture: 'f/2.8', shutterSpeed: '1/500s', focalLength: '35mm' },
  },
  {
    id: '2',
    name: 'DSCF7482.JPG',
    size: 12950000,
    mimeType: 'image/jpeg',
    directUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=60',
    width: 4000,
    height: 6000,
    exif: { make: 'FUJIFILM', model: 'X-T20', iso: 400, aperture: 'f/4.0', shutterSpeed: '1/1000s', focalLength: '50mm' },
  },
  {
    id: '3',
    name: 'DSCF7483.JPG',
    size: 13010000,
    mimeType: 'image/jpeg',
    directUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=60',
    width: 6000,
    height: 4000,
    exif: { make: 'FUJIFILM', model: 'X-T20', iso: 800, aperture: 'f/5.6', shutterSpeed: '1/250s', focalLength: '23mm' },
  },
  {
    id: '4',
    name: 'DSCF7484.JPG',
    size: 12990000,
    mimeType: 'image/jpeg',
    directUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=60',
    width: 4000,
    height: 6000,
    exif: { make: 'FUJIFILM', model: 'X-T20', iso: 1600, aperture: 'f/2.0', shutterSpeed: '1/125s', focalLength: '56mm' },
  },
];

// ===== PHOTO VIEWER =====
type PhotoViewerProps = {
  photos: PhotoFile[];
  index: number;
  selected: boolean;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
  onToggle: (id: string) => void;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

function getResizedUrl(url: string, width: number): string {
  if (!url) return url;
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=80`;
  }
  return url;
}

export function PhotoViewer({
  photos,
  index,
  selected,
  onClose,
  onNavigate,
  onToggle,
}: PhotoViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [fullResMode, setFullResMode] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [direction, setDirection] = useState(0);

  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const offsetStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const touchStartDist = useRef<number>(0);
  const touchStartZoom = useRef<number>(1);

  const photo = photos[index];

  // ===== Fullscreen =====
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ===== Dapatkan daftar URL prioritas =====
  const getPrioritizedUrls = useCallback((photo: PhotoFile, fullRes: boolean): string[] => {
    if (!photo) return [];
    const candidates: string[] = [];

    if (fullRes) {
      if (photo.directUrl) candidates.push(photo.directUrl);
      if (photo.webContentLink) candidates.push(photo.webContentLink);
    } else {
      if (photo.directUrl) {
        candidates.push(getResizedUrl(photo.directUrl, 800));
        candidates.push(photo.directUrl);
      }
      if (photo.webContentLink) candidates.push(photo.webContentLink);
    }

    if (photo.thumbnailUrl) candidates.push(photo.thumbnailUrl);

    if (photo.id) {
      candidates.push(`https://drive.google.com/thumbnail?id=${photo.id}&sz=w800`);
      candidates.push(`https://drive.google.com/uc?id=${photo.id}&export=download`);
    }

    return [...new Set(candidates.filter(url => url && url.trim().length > 0))];
  }, []);

  // ===== Muat gambar dengan mencoba semua URL =====
  const loadImage = useCallback((fullRes: boolean = false) => {
    if (!photo) {
      setImageError(true);
      setIsLoading(false);
      return;
    }

    const urls = getPrioritizedUrls(photo, fullRes);
    if (urls.length === 0) {
      setImageError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setImageError(false);

    let attemptIndex = 0;
    let loaded = false;

    const tryNext = () => {
      if (attemptIndex >= urls.length || loaded) {
        if (!loaded) {
          setImageError(true);
          setIsLoading(false);
        }
        return;
      }

      const url = urls[attemptIndex];
      attemptIndex++;

      const img = new Image();
      img.crossOrigin = 'anonymous'; // CORS
      img.onload = () => {
        setImageUrl(url);
        setIsLoading(false);
        loaded = true;
      };
      img.onerror = () => {
        tryNext();
      };
      img.src = url;
    };

    tryNext();
  }, [photo, getPrioritizedUrls]);

  // ===== Preload neighbors =====
  useEffect(() => {
    if (!photo) return;
    const preloadOne = (p: PhotoFile) => {
      if (!p) return;
      const urls = getPrioritizedUrls(p, false);
      if (urls.length > 0) {
        const img = new Image();
        img.src = urls[0];
      }
    };
    if (index > 0) preloadOne(photos[index - 1]);
    if (index < photos.length - 1) preloadOne(photos[index + 1]);
  }, [index, photo, photos, getPrioritizedUrls]);

  // ===== Reset saat ganti foto =====
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setFullResMode(false);
    setRotation(0);
    setImageUrl('');
    loadImage(false);
  }, [index, loadImage]);

  // ===== Navigasi =====
  const goPrev = useCallback(() => {
    if (index > 0) {
      setDirection(-1);
      onNavigate(index - 1);
    }
  }, [index, onNavigate]);

  const goNext = useCallback(() => {
    if (index < photos.length - 1) {
      setDirection(1);
      onNavigate(index + 1);
    }
  }, [index, onNavigate, photos.length]);

  const goFirst = useCallback(() => {
    if (index > 0) {
      setDirection(-1);
      onNavigate(0);
    }
  }, [index, onNavigate]);

  const goLast = useCallback(() => {
    if (index < photos.length - 1) {
      setDirection(1);
      onNavigate(photos.length - 1);
    }
  }, [index, onNavigate, photos.length]);

  // ===== Keyboard =====
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Home') goFirst();
      else if (e.key === 'End') goLast();
      else if (e.key === 'r' || e.key === 'R') rotateImage();
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (photo) onToggle(photo.id);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext, goFirst, goLast, onClose, onToggle, photo]);

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullRes = () => {
    const newMode = !fullResMode;
    setFullResMode(newMode);
    loadImage(newMode);
  };

  // ===== Zoom & Pan =====
  function clampOffset(nextX: number, nextY: number, nextZoom: number) {
    if (nextZoom <= 1) return { x: 0, y: 0 };
    const limitX = Math.max(0, (window.innerWidth * (nextZoom - 1)) / 2);
    const limitY = Math.max(0, (window.innerHeight * (nextZoom - 1)) / 2);
    return {
      x: Math.min(limitX, Math.max(-limitX, nextX)),
      y: Math.min(limitY, Math.max(-limitY, nextY)),
    };
  }

  function updateZoom(nextZoom: number) {
    const safeZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    setZoom(safeZoom);
    if (safeZoom <= 1) {
      setOffset({ x: 0, y: 0 });
      return;
    }
    setOffset((prev) => clampOffset(prev.x, prev.y, safeZoom));
  }

  function onWheel(e: React.WheelEvent) {
    if (!photo || isLoading || imageError) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    updateZoom(zoom + delta);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (zoom <= 1 || isLoading || imageError) return;
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragStart.current || zoom <= 1) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const next = clampOffset(offsetStart.current.x + dx, offsetStart.current.y + dy, zoom);
    setOffset(next);
  }

  function onPointerUp() {
    dragStart.current = null;
  }

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartDist.current = dist;
      touchStartZoom.current = zoom;
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && touchStartDist.current > 0) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const scale = dist / touchStartDist.current;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, touchStartZoom.current * scale));
      updateZoom(newZoom);
    }
  }

  function onTouchEnd() {
    touchStartDist.current = 0;
  }

  function toggleZoom() {
    if (zoom > 1) updateZoom(1);
    else updateZoom(2.5);
  }

  const handleDownload = () => {
    if (!photo) return;
    const url = photo.directUrl || photo.webContentLink || photo.thumbnailUrl;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = photo.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!photo) return null;

  const canPrev = index > 0;
  const canNext = index < photos.length - 1;
  const isImageReady = !isLoading && !imageError && imageUrl;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      ref={containerRef}
    >
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            title="Kembali (Esc)"
          >
            <ArrowLeft size={24} strokeWidth={2} />
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded bg-blue-500/20 text-blue-400">
              <FileImage size={16} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-base font-medium text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
                {photo.name}
              </h1>
              <span className="text-[11px] text-white/50">
                {fullResMode ? 'Resolusi penuh' : 'Medium (800px)'} • {(photo.size / 1024 / 1024).toFixed(2)} MB
                {photo.width && photo.height && ` • ${photo.width}×${photo.height}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <p className="hidden sm:block text-xs font-medium text-white/50 mr-2">
            {index + 1} dari {photos.length}
          </p>

          <button onClick={goFirst} disabled={!canPrev} className="p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30">
            <ChevronsLeft size={20} strokeWidth={2} />
          </button>
          <button onClick={goLast} disabled={!canNext} className="p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30">
            <ChevronsRight size={20} strokeWidth={2} />
          </button>

          <button onClick={() => updateZoom(Math.min(MAX_ZOOM, zoom + 0.5))} disabled={!isImageReady} className="p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30">
            <ZoomIn size={20} strokeWidth={2} />
          </button>
          <button onClick={() => updateZoom(Math.max(MIN_ZOOM, zoom - 0.5))} disabled={!isImageReady || zoom <= MIN_ZOOM} className="p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30">
            <ZoomOut size={20} strokeWidth={2} />
          </button>

          <button onClick={rotateImage} disabled={!isImageReady} className="p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30">
            <RotateCw size={20} strokeWidth={2} />
          </button>

          <button onClick={toggleFullscreen} className="p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors" title={isFullscreen ? "Keluar fullscreen (Esc)" : "Fullscreen (F)"}>
            <Fullscreen size={20} strokeWidth={2} />
          </button>

          <button onClick={toggleFullRes} disabled={!isImageReady} className={`p-2 rounded-full transition-colors ${fullResMode ? 'text-yellow-400 bg-yellow-500/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`} title={fullResMode ? "Kembali ke resolusi medium" : "Muat resolusi penuh"}>
            <Maximize size={20} strokeWidth={2} />
          </button>

          <button onClick={() => onToggle(photo.id)} className={`p-2 rounded-full transition-colors ${selected ? 'text-blue-400 bg-blue-500/20' : 'text-white/80 hover:bg-white/10 hover:text-white'}`} title={selected ? "Batalkan pilihan" : "Pilih foto"}>
            <Check size={20} strokeWidth={selected ? 3 : 2} />
          </button>

          <button onClick={() => setShowInfo(!showInfo)} className={`p-2 rounded-full transition-colors ${showInfo ? 'text-blue-400 bg-white/10' : 'text-white/80 hover:bg-white/10 hover:text-white'}`} title="Info & EXIF">
            <Info size={20} strokeWidth={2} />
          </button>

          <button onClick={handleDownload} className="p-2 rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors" title="Download">
            <Download size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* INFO PANEL */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-16 right-4 z-30 w-72 max-h-[80vh] overflow-y-auto rounded-xl bg-[#202124] border border-white/10 shadow-2xl"
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-medium text-white">Detail File</h3>
            </div>
            <div className="p-4 space-y-3">
              <div><p className="text-xs text-white/50 mb-1">Nama</p><p className="text-sm text-white/90 break-all">{photo.name}</p></div>
              <div><p className="text-xs text-white/50 mb-1">Ukuran</p><p className="text-sm text-white/90">{(photo.size / 1024 / 1024).toFixed(2)} MB</p></div>
              {photo.width && photo.height && <div><p className="text-xs text-white/50 mb-1">Dimensi</p><p className="text-sm text-white/90">{photo.width} × {photo.height} px</p></div>}
              <div><p className="text-xs text-white/50 mb-1">Tipe</p><p className="text-sm text-white/90">{photo.mimeType}</p></div>
              <div><p className="text-xs text-white/50 mb-1">Mode tampilan</p><p className="text-sm text-white/90">{fullResMode ? 'Resolusi penuh' : 'Medium (800px)'}</p></div>
              {photo.exif && (
                <div className="pt-2 border-t border-white/10">
                  <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">EXIF</h4>
                  <div className="space-y-1 text-sm">
                    {photo.exif.make && <p><span className="text-white/50">Kamera:</span> {photo.exif.make} {photo.exif.model}</p>}
                    {photo.exif.iso && <p><span className="text-white/50">ISO:</span> {photo.exif.iso}</p>}
                    {photo.exif.aperture && <p><span className="text-white/50">Aperture:</span> {photo.exif.aperture}</p>}
                    {photo.exif.shutterSpeed && <p><span className="text-white/50">Shutter:</span> {photo.exif.shutterSpeed}</p>}
                    {photo.exif.focalLength && <p><span className="text-white/50">Focal:</span> {photo.exif.focalLength}</p>}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IMAGE CONTAINER */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute inset-0 bg-gray-900/50" />

        <AnimatePresence>
          {isLoading && !imageError && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />
              <p className="mt-4 text-sm text-white/50">Memuat gambar...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {imageError && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-red-500/10 border border-red-500/20">
                <ImageOff size={28} className="text-red-400" />
              </div>
              <p className="text-sm font-medium text-white/70">Gagal memuat foto</p>
              <button
                onClick={() => loadImage(fullResMode)}
                className="mt-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/20 transition-colors"
              >
                <RefreshCw size={14} /> Coba lagi
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isImageReady && (
          <motion.img
            key={photo.id + fullResMode + imageUrl}
            custom={direction}
            initial={{ opacity: 0, x: direction * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -80 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            ref={imgRef}
            src={imageUrl}
            alt={photo.name}
            loading="eager"
            decoding="async"
            crossOrigin="anonymous"
            draggable={false}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onDoubleClick={toggleZoom}
            className={`select-none ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              touchAction: zoom > 1 ? 'none' : 'auto',
              willChange: 'transform',
            }}
          />
        )}

        <AnimatePresence>
          {canPrev && isImageReady && (
            <motion.button
              onClick={goPrev}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all hidden sm:block"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <ChevronLeft size={48} strokeWidth={1.5} />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {canNext && isImageReady && (
            <motion.button
              onClick={goNext}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all hidden sm:block"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <ChevronRight size={48} strokeWidth={1.5} />
            </motion.button>
          )}
        </AnimatePresence>

        <button onClick={goPrev} disabled={!canPrev} className="absolute left-0 top-0 z-10 h-full w-1/4 opacity-0 sm:hidden" />
        <button onClick={goNext} disabled={!canNext} className="absolute right-0 top-0 z-10 h-full w-1/4 opacity-0 sm:hidden" />
      </div>

      {/* ZOOM TOOLBAR */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-[#28292c]/90 backdrop-blur-md px-3 py-2 rounded-full border border-white/10 shadow-2xl">
        <button
          onClick={() => updateZoom(Math.max(MIN_ZOOM, zoom - 0.5))}
          disabled={!isImageReady || zoom <= MIN_ZOOM}
          className="p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ZoomOut size={18} strokeWidth={2} />
        </button>

        <span className="min-w-[60px] text-center text-xs font-medium text-white/90">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => updateZoom(Math.min(MAX_ZOOM, zoom + 0.5))}
          disabled={!isImageReady || zoom >= MAX_ZOOM}
          className="p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ZoomIn size={18} strokeWidth={2} />
        </button>

        <div className="w-px h-4 bg-white/20 mx-1" />

        <button
          onClick={toggleZoom}
          disabled={!isImageReady}
          className="p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Reset zoom / Fit to screen"
        >
          <Maximize2 size={16} strokeWidth={2} />
        </button>

        <div className="w-px h-4 bg-white/20 mx-1" />

        <button
          onClick={rotateImage}
          disabled={!isImageReady}
          className="p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Putar 90°"
        >
          <RotateCw size={16} strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
}

// ===== MAIN APP =====
export default function App() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedPhotos(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set(MOCK_PHOTOS.map(p => p.id));
    setSelectedPhotos(allIds);
  };

  const deselectAll = () => {
    setSelectedPhotos(new Set());
  };

  const downloadSelected = () => {
    const selected = MOCK_PHOTOS.filter(p => selectedPhotos.has(p.id));
    if (selected.length === 0) return;
    selected.forEach(photo => {
      const url = photo.directUrl || photo.webContentLink || photo.thumbnailUrl;
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = photo.name;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    if (selectMode) {
      setSelectedPhotos(new Set());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Galeri Foto</h1>
          <div className="flex items-center gap-2">
            {selectMode ? (
              <>
                <button
                  onClick={selectAll}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <CheckSquare size={16} /> Pilih Semua
                </button>
                <button
                  onClick={deselectAll}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Square size={16} /> Batalkan
                </button>
                <button
                  onClick={downloadSelected}
                  disabled={selectedPhotos.size === 0}
                  className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedPhotos.size > 0
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Download size={16} /> Unduh ({selectedPhotos.size})
                </button>
                <button
                  onClick={toggleSelectMode}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X size={16} /> Tutup
                </button>
              </>
            ) : (
              <button
                onClick={toggleSelectMode}
                className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <CheckSquare size={16} /> Pilih
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MOCK_PHOTOS.map((photo, idx) => {
            const isSelected = selectedPhotos.has(photo.id);
            return (
              <div
                key={photo.id}
                onClick={() => {
                  if (selectMode) {
                    toggleSelect(photo.id);
                  } else {
                    openViewer(idx);
                  }
                }}
                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all ${
                  selectMode && isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                <img
                  src={photo.thumbnailUrl || photo.directUrl}
                  alt={photo.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  decoding="async"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {selectMode && (
                  <div className="absolute top-2 left-2 z-10">
                    {isSelected ? (
                      <div className="bg-blue-500 text-white rounded-full p-1">
                        <Check size={16} />
                      </div>
                    ) : (
                      <div className="bg-white/30 backdrop-blur-sm rounded-full p-1 border border-white/50">
                        <Square size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                )}
                {!selectMode && isSelected && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1">
                    <Check size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {viewerOpen && (
          <PhotoViewer
            photos={MOCK_PHOTOS}
            index={currentIndex}
            selected={selectedPhotos.has(MOCK_PHOTOS[currentIndex].id)}
            onClose={() => setViewerOpen(false)}
            onNavigate={setCurrentIndex}
            onToggle={toggleSelect}
          />
        )}
      </AnimatePresence>
    </div>
  );
}