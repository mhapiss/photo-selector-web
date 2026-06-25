import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
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
  RotateCw,
  Fullscreen,
  X,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';

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

// ===== MOCK DATA =====
export const MOCK_PHOTOS: PhotoFile[] = [
  {
    id: '1',
    name: 'DSCF7471.JPG',
    size: 12870000,
    mimeType: 'image/jpeg',
    directUrl: 'https://picsum.photos/seed/1/1600/1067',
    thumbnailUrl: 'https://picsum.photos/seed/1/400/267',
    width: 1600,
    height: 1067,
    exif: {
      make: 'FUJIFILM',
      model: 'X-T20',
      iso: 200,
      aperture: 'f/2.8',
      shutterSpeed: '1/500s',
      focalLength: '35mm',
    },
  },
];

// ===== UTILS (TIDAK BERUBAH) =====
function extractGoogleDriveId(url: string): string | null {
  const match = url.match(/[?&]id=([^&]+)/);
  return match ? match[1] : null;
}

// ===== CUSTOM HOOKS (TIDAK BERUBAH) =====
function useImageLoader(photo: PhotoFile | undefined, fullRes: boolean) {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const getPrioritizedUrls = useCallback(
    (p: PhotoFile, full: boolean): string[] => {
      if (!p) return [];
      const urls: string[] = [];
      const base = p.directUrl || '';
      const thumb = p.thumbnailUrl || '';

      // ================================================================
      // ✅ BAGIAN INI SUDAH DIPERBAIKI UNTUK VERCEL
      // ================================================================
      if (base.includes('drive.google.com')) {
        const fileId = extractGoogleDriveId(base);
        if (fileId) {
          if (import.meta.env.DEV) {
            // Mode Development (localhost): pakai proxy Vite
            const baseUrl = '/api/gdrive';
            if (full) {
              urls.push(`${baseUrl}/thumbnail?id=${fileId}&sz=s0`);
            } else {
              urls.push(`${baseUrl}/thumbnail?id=${fileId}&sz=w1600`);
            }
          } else {
            // Mode Production (Vercel): pakai wsrv.nl yang handle CORS
            const baseUrl = 'https://wsrv.nl/?url=https://drive.google.com';
            if (full) {
              urls.push(`${baseUrl}/thumbnail?id=${fileId}&sz=s0`);
            } else {
              urls.push(`${baseUrl}/thumbnail?id=${fileId}&sz=w1600`);
            }
          }
        }
      }
      // ================================================================

      // LOGIKA URL ASLI TETAP SAMA PERSIS (tidak diubah)
      if (full) {
        if (base) urls.push(base);
        if (thumb) urls.push(thumb);
      } else {
        if (base) {
          const small = base.includes('?') ? base + '&w=800' : base + '?w=800';
          urls.push(small);
          urls.push(base);
        }
        if (thumb) urls.push(thumb);
      }
      if (p.id) urls.push(`https://picsum.photos/seed/${p.id}/800/533`);

      return urls.filter(Boolean);
    },
    [],
  );

  const load = useCallback(() => {
    if (!photo) {
      setImageError(true);
      setIsLoading(false);
      return;
    }
    const urls = getPrioritizedUrls(photo, fullRes);
    if (!urls.length) {
      setImageError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setImageError(false);

    let attempt = 0;
    let cancelled = false;

    const tryNext = () => {
      if (cancelled || attempt >= urls.length) {
        if (!cancelled) {
          setImageError(true);
          setIsLoading(false);
        }
        return;
      }
      const url = urls[attempt++];
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';

      img.onload = () => {
        if (!cancelled) {
          setImageUrl(url);
          setIsLoading(false);
          setImageError(false);
        }
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
      }, 5000);
    };

    tryNext();
    return () => {
      cancelled = true;
    };
  }, [photo, fullRes, getPrioritizedUrls]);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  const prefetch = useCallback(
    (target: PhotoFile) => {
      const urls = getPrioritizedUrls(target, false);
      if (urls.length) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.referrerPolicy = 'no-referrer';
        img.src = urls[0];
      }
    },
    [getPrioritizedUrls],
  );

  return { imageUrl, isLoading, imageError, load, prefetch };
}

function useAutoHideControls(
  containerRef: React.RefObject<HTMLDivElement>,
  initialShow = true,
  timeoutMs = 3500,
) {
  const [showControls, setShowControls] = useState(initialShow);
  const [showCursor, setShowCursor] = useState(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();
  const cursorTimeout = useRef<ReturnType<typeof setTimeout>>();

  const resetTimers = useCallback(() => {
    setShowControls(true);
    setShowCursor(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (cursorTimeout.current) clearTimeout(cursorTimeout.current);
    hideTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, timeoutMs);
    cursorTimeout.current = setTimeout(() => {
      setShowCursor(false);
    }, timeoutMs);
  }, [timeoutMs]);

  const toggleShowControls = useCallback(() => {
    setShowControls((prev) => {
      const next = !prev;
      if (next) {
        resetTimers();
      } else {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        if (cursorTimeout.current) clearTimeout(cursorTimeout.current);
        setShowCursor(false);
      }
      return next;
    });
  }, [resetTimers]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = () => resetTimers();
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', onMove);
    el.addEventListener('touchstart', onMove, { passive: true });
    el.addEventListener('click', onMove);
    el.addEventListener('wheel', onMove, { passive: true });

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onMove);
      el.removeEventListener('touchstart', onMove);
      el.removeEventListener('click', onMove);
      el.removeEventListener('wheel', onMove);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      if (cursorTimeout.current) clearTimeout(cursorTimeout.current);
    };
  }, [containerRef, resetTimers]);

  useEffect(() => {
    resetTimers();
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      if (cursorTimeout.current) clearTimeout(cursorTimeout.current);
    };
  }, [resetTimers]);

  return { showControls, showCursor, resetTimers, toggleShowControls };
}

function useSwipeNavigation(
  zoom: number,
  canPrev: boolean,
  canNext: boolean,
  goPrev: () => void,
  goNext: () => void,
  resetTimers: () => void,
) {
  const swipeX = useMotionValue(0);
  const startX = useRef(0);
  const currentX = useRef(0);

  const onSwipeStart = useCallback((clientX: number) => {
    if (zoom > 1) return;
    startX.current = clientX;
    currentX.current = clientX;
    swipeX.stop();
  }, [zoom, swipeX]);

  const onSwipeMove = useCallback((clientX: number) => {
    if (zoom > 1) return;
    const dx = clientX - startX.current;
    currentX.current = clientX;
    swipeX.set(dx * 0.8);
  }, [zoom, swipeX]);

  const onSwipeEnd = useCallback(() => {
    if (zoom > 1) return;
    const dx = currentX.current - startX.current;
    const threshold = 80;
    if (dx > threshold && canPrev) {
      swipeX.set(0);
      goPrev();
      resetTimers();
    } else if (dx < -threshold && canNext) {
      swipeX.set(0);
      goNext();
      resetTimers();
    } else {
      swipeX.set(0);
    }
  }, [zoom, canPrev, canNext, goPrev, goNext, resetTimers, swipeX]);

  return { swipeX, onSwipeStart, onSwipeMove, onSwipeEnd };
}

// ===== REUSABLE UI COMPONENTS (REFACTORED) =====

const BackgroundLayer: React.FC<{ darken: boolean }> = React.memo(({ darken }) => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    {/* Base Dark #050505 */}
    <div className="absolute inset-0 bg-[#050505]" />
    
    {/* Soft Vignette & Depth Lighting */}
    <div 
      className="absolute inset-0 transition-opacity duration-500"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)'
      }}
    />

    {/* Noise Texture (Data URI SVG) */}
    <div 
      className="absolute inset-0 opacity-30 mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        backgroundSize: '256px 256px',
      }}
    />

    {/* Dynamic Darkening saat Idle */}
    <motion.div
      className="absolute inset-0 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: darken ? 0.25 : 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
  </div>
));

const FloatingHeader: React.FC<{
  photo: PhotoFile;
  index: number;
  total: number;
  selected: boolean;
  selectionIndex?: number | null;
  fullResMode: boolean;
  isImageReady: boolean;
  showControls: boolean;
  onClose: (e: React.MouseEvent) => void;
  onToggleFullRes: (e: React.MouseEvent) => void;
  onToggleFullscreen: (e: React.MouseEvent) => void;
  onToggleInfo: (e: React.MouseEvent) => void;
  onToggleSelect: (e: React.MouseEvent) => void;
}> = React.memo(({
  photo, index, total, selected, selectionIndex, fullResMode, isImageReady, showControls,
  onClose, onToggleFullRes, onToggleFullscreen, onToggleInfo, onToggleSelect
}) => (
  <AnimatePresence>
    {showControls && (
      <motion.div
        className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-32px)] sm:w-auto max-w-2xl"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center gap-1.5 sm:gap-3 px-3 py-2 bg-white/[0.04] backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
          
          <button
            onClick={onClose}
            className="p-2.5 rounded-full text-white/80 hover:bg-white/10 active:scale-90 transition-all"
            aria-label="Tutup penampil"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial px-1">
            <span className="text-sm font-medium text-white/90 truncate max-w-[120px] sm:max-w-[220px] tracking-tight">
              {photo.name}
            </span>
            <span className="text-xs text-white/40 font-mono hidden sm:inline">
              {index + 1} / {total}
            </span>
            {selectionIndex != null && (
              <span className="text-[10px] text-blue-400/90 bg-blue-500/20 px-2 py-0.5 rounded-full font-mono">
                #{selectionIndex + 1}
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={onToggleFullRes}
              disabled={!isImageReady}
              className={`p-2.5 rounded-full transition-all active:scale-90 hidden sm:block ${
                fullResMode
                  ? 'text-yellow-400 bg-yellow-500/20'
                  : 'text-white/60 hover:bg-white/10'
              } disabled:opacity-30`}
              title={fullResMode ? 'Resolusi penuh' : 'Resolusi sedang'}
            >
              <Maximize2 size={17} strokeWidth={2} />
            </button>
            <button
              onClick={onToggleFullscreen}
              className="p-2.5 rounded-full text-white/60 hover:bg-white/10 active:scale-90 transition-all hidden sm:block"
              aria-label="Fullscreen"
            >
              <Fullscreen size={17} strokeWidth={2} />
            </button>
            <button
              onClick={onToggleInfo}
              className="p-2.5 rounded-full text-white/60 hover:bg-white/10 active:scale-90 transition-all"
              aria-label="Info foto"
            >
              <Info size={17} strokeWidth={2} />
            </button>
            <button
              onClick={onToggleSelect}
              className={`p-2.5 rounded-full transition-all active:scale-90 ${
                selected
                  ? 'text-blue-400 bg-blue-500/20'
                  : 'text-white/60 hover:bg-white/10'
              }`}
              aria-label={selected ? 'Batal pilih' : 'Pilih foto'}
            >
              <Check size={17} strokeWidth={selected ? 3 : 2} />
            </button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
));

const InfoSheet: React.FC<{ photo: PhotoFile; fullResMode: boolean; show: boolean; onClose: () => void; }> = React.memo(({ photo, fullResMode, show, onClose }) => (
  <AnimatePresence>
    {show && (
      <>
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-3xl bg-[#0f0f0f]/95 backdrop-blur-3xl border-t border-white/10 shadow-2xl"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100) onClose();
          }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          <div className="p-6 pt-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white tracking-wide">Detail Foto</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-white/50 hover:bg-white/10 active:scale-90 transition-all"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/40">Nama File</span>
                <p className="text-white/90 truncate max-w-[200px] text-right">{photo.name}</p>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/40">Ukuran</span>
                <p className="text-white/90">{(photo.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {photo.width && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40">Dimensi</span>
                  <p className="text-white/90">{photo.width}×{photo.height}</p>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/40">Mode Tampilan</span>
                <p className="text-white/90">{fullResMode ? 'Resolusi penuh' : 'Optimal'}</p>
              </div>
              {photo.exif && (
                <div className="pt-2 mt-2 border-t border-white/10">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">EXIF Data</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
                    {photo.exif.make && <p className="col-span-2">{photo.exif.make} {photo.exif.model}</p>}
                    {photo.exif.iso && <p>ISO {photo.exif.iso}</p>}
                    {photo.exif.aperture && <p>{photo.exif.aperture}</p>}
                    {photo.exif.shutterSpeed && <p>{photo.exif.shutterSpeed}</p>}
                    {photo.exif.focalLength && <p>{photo.exif.focalLength}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
));

const FloatingToolbar: React.FC<{
  zoom: number;
  isImageReady: boolean;
  showControls: boolean;
  onZoomOut: (e: React.MouseEvent) => void;
  onZoomIn: (e: React.MouseEvent) => void;
  onResetZoom: (e: React.MouseEvent) => void;
  onRotate: (e: React.MouseEvent) => void;
  onDownload: (e: React.MouseEvent) => void;
}> = React.memo(({
  zoom, isImageReady, showControls, onZoomOut, onZoomIn, onResetZoom, onRotate, onDownload
}) => (
  <AnimatePresence>
    {showControls && (
      <motion.div
        className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.04] backdrop-blur-3xl rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
          <button
            onClick={onZoomOut}
            disabled={!isImageReady || zoom <= 1}
            className="p-2.5 rounded-full text-white/70 hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} strokeWidth={2} />
          </button>

          <button
            onClick={onResetZoom}
            disabled={!isImageReady}
            className="min-w-[52px] p-2 rounded-full text-center text-xs font-medium text-white/90 hover:bg-white/10 transition-all tabular-nums"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={onZoomIn}
            disabled={!isImageReady || zoom >= 6}
            className="p-2.5 rounded-full text-white/70 hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} strokeWidth={2} />
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <button
            onClick={onRotate}
            disabled={!isImageReady}
            className="p-2.5 rounded-full text-white/70 hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30"
            aria-label="Rotate"
          >
            <RotateCw size={17} strokeWidth={2} />
          </button>

          <button
            onClick={onDownload}
            disabled={!isImageReady}
            className="p-2.5 rounded-full text-white/70 hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30"
            aria-label="Download"
          >
            <Download size={17} strokeWidth={2} />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
));

const FloatingNavigation: React.FC<{
  showControls: boolean;
  isImageReady: boolean;
  canPrev: boolean;
  canNext: boolean;
  goPrev: () => void;
  goNext: () => void;
}> = React.memo(({ showControls, isImageReady, canPrev, canNext, goPrev, goNext }) => (
  <AnimatePresence>
    {showControls && isImageReady && (
      <>
        {canPrev && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            whileHover={{ scale: 1.08 }}
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white/60 hover:bg-white/20 hover:text-white hover:border-white/30 active:scale-90 transition-all"
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </motion.button>
        )}

        {canNext && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            whileHover={{ scale: 1.08 }}
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white/60 hover:bg-white/20 hover:text-white hover:border-white/30 active:scale-90 transition-all"
            aria-label="Foto selanjutnya"
          >
            <ChevronRight size={22} strokeWidth={2} />
          </motion.button>
        )}
      </>
    )}
  </AnimatePresence>
));

// ===== MAIN COMPONENT =====
type PhotoViewerProps = {
  photos: PhotoFile[];
  index: number;
  selected: boolean;
  selectionIndex?: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
  onToggle: (id: string) => void;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

const PhotoViewer: React.FC<PhotoViewerProps> = ({
  photos,
  index,
  selected,
  selectionIndex = null,
  onClose,
  onNavigate,
  onToggle,
}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [fullResMode, setFullResMode] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const offsetStart = useRef({ x: 0, y: 0 });
  const touchStartDist = useRef(0);
  const touchStartZoom = useRef(1);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchMoved = useRef(false);

  const photo = useMemo(() => photos[index], [photos, index]);

  const { imageUrl, isLoading, imageError, load, prefetch } = useImageLoader(
    photo,
    fullResMode,
  );
  const { showControls, showCursor, resetTimers, toggleShowControls } =
    useAutoHideControls(containerRef);

  const isImageReady = !isLoading && !imageError && !!imageUrl;

  // === Business Logic Navigation (TIDAK BERUBAH) ===
  const goPrev = useCallback(() => {
    if (index > 0) onNavigate(index - 1);
  }, [index, onNavigate]);
  const goNext = useCallback(() => {
    if (index < photos.length - 1) onNavigate(index + 1);
  }, [index, onNavigate, photos.length]);

  // === Swipe navigation (TIDAK BERUBAH) ===
  const { swipeX, onSwipeStart, onSwipeMove, onSwipeEnd } = useSwipeNavigation(
    zoom,
    index > 0,
    index < photos.length - 1,
    goPrev,
    goNext,
    resetTimers,
  );

  // === Zoom & Pan Logic (TIDAK BERUBAH) ===
  const clampOffset = useCallback(
    (nx: number, ny: number, nz: number) => {
      if (nz <= 1) return { x: 0, y: 0 };
      const w = window.innerWidth;
      const h = window.innerHeight;
      const limitX = Math.max(0, (w * (nz - 1)) / 2);
      const limitY = Math.max(0, (h * (nz - 1)) / 2);
      return {
        x: Math.min(limitX, Math.max(-limitX, nx)),
        y: Math.min(limitY, Math.max(-limitY, ny)),
      };
    },
    [],
  );

  const updateZoom = useCallback(
    (nextZoom: number) => {
      const safe = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
      setZoom(safe);
      if (safe <= 1) {
        setOffset({ x: 0, y: 0 });
      } else {
        setOffset((prev) => clampOffset(prev.x, prev.y, safe));
      }
    },
    [clampOffset],
  );

  // === Events (TIDAK BERUBAH) ===
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (!photo || isLoading || imageError) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      updateZoom(zoom + delta);
      resetTimers();
    },
    [photo, isLoading, imageError, zoom, updateZoom, resetTimers],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (zoom <= 1 || isLoading || imageError) return;
      dragStart.current = { x: e.clientX, y: e.clientY };
      offsetStart.current = { ...offset };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      resetTimers();
    },
    [zoom, isLoading, imageError, offset, resetTimers],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current || zoom <= 1) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const next = clampOffset(
        offsetStart.current.x + dx,
        offsetStart.current.y + dy,
        zoom,
      );
      setOffset(next);
    },
    [zoom, clampOffset],
  );

  const onPointerUp = useCallback(() => {
    dragStart.current = null;
    setTimeout(() => setIsDragging(false), 50);
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        touchStartDist.current = dist;
        touchStartZoom.current = zoom;
        touchMoved.current = false;
        setIsDragging(true);
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
        touchMoved.current = false;
        onSwipeStart(touch.clientX);
      }
      resetTimers();
    },
    [zoom, resetTimers, onSwipeStart],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && touchStartDist.current > 0) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const scale = dist / touchStartDist.current;
        const newZoom = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, touchStartZoom.current * scale),
        );
        updateZoom(newZoom);
        touchMoved.current = true;
      } else if (e.touches.length === 1 && touchStart.current && zoom <= 1) {
        onSwipeMove(e.touches[0].clientX);
        const dx = e.touches[0].clientX - touchStart.current.x;
        if (Math.abs(dx) > 10) touchMoved.current = true;
      }
    },
    [zoom, updateZoom, onSwipeMove],
  );

  const onTouchEnd = useCallback(
    (_e: React.TouchEvent) => {
      setIsDragging(false);

      if (
        !touchMoved.current &&
        touchStart.current &&
        zoom <= 1 &&
        !imageError &&
        !isLoading
      ) {
        toggleShowControls();
      }

      onSwipeEnd();

      touchStartDist.current = 0;
      touchStart.current = null;
      touchMoved.current = false;
    },
    [
      zoom,
      imageError,
      isLoading,
      toggleShowControls,
      onSwipeEnd,
    ],
  );

  // === Action Logic (TIDAK BERUBAH) ===
  const rotateImage = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
    resetTimers();
  }, [resetTimers]);

  const toggleFullRes = useCallback(() => {
    setFullResMode((prev) => !prev);
    resetTimers();
  }, [resetTimers]);

  const handleDownload = useCallback(() => {
    if (!photo) return;
    const url = photo.directUrl || photo.thumbnailUrl;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = photo.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    resetTimers();
  }, [photo, resetTimers]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // === Reset Logic (TIDAK BERUBAH) ===
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setFullResMode(false);
    setRotation(0);
    setShowInfo(false);
    setIsDragging(false);
  }, [index]);

  // === Prefetch Logic (TIDAK BERUBAH) ===
  useEffect(() => {
    if (!photo) return;
    if (index > 0) prefetch(photos[index - 1]);
    if (index < photos.length - 1) prefetch(photos[index + 1]);
  }, [index, photo, photos, prefetch]);

  // === Keyboard Logic (TIDAK BERUBAH) ===
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape') {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else onClose();
      } else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Home' && index > 0) onNavigate(0);
      else if (e.key === 'End' && index < photos.length - 1) onNavigate(photos.length - 1);
      else if (e.key === 'r' || e.key === 'R') rotateImage();
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (photo) onToggle(photo.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext, onClose, onToggle, photo, toggleFullscreen, index, photos.length, onNavigate, rotateImage]);

  const canPrev = index > 0;
  const canNext = index < photos.length - 1;

  if (!photo) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]">
        <p className="text-white/40 text-sm tracking-wider">Foto tidak tersedia</p>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col select-none"
      style={{
        padding: 'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
        touchAction: 'none',
        cursor: showCursor ? 'default' : 'none',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* 1. Premium Layered Background */}
      <BackgroundLayer darken={!showControls} />

      {/* 2. Floating Header */}
      <FloatingHeader
        photo={photo}
        index={index}
        total={photos.length}
        selected={selected}
        selectionIndex={selectionIndex}
        fullResMode={fullResMode}
        isImageReady={isImageReady}
        showControls={showControls}
        onClose={(e) => { e.stopPropagation(); onClose(); }}
        onToggleFullRes={(e) => { e.stopPropagation(); toggleFullRes(); }}
        onToggleFullscreen={(e) => { e.stopPropagation(); toggleFullscreen(); }}
        onToggleInfo={(e) => { e.stopPropagation(); setShowInfo(v => !v); }}
        onToggleSelect={(e) => { e.stopPropagation(); if (photo) onToggle(photo.id); }}
      />

      {/* 3. Info Sheet */}
      <InfoSheet
        photo={photo}
        fullResMode={fullResMode}
        show={showInfo && !!photo}
        onClose={() => setShowInfo(false)}
      />

      {/* 4. Image Container (Tengah viewport, object-fit: contain, margin aman) */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4 sm:p-6 md:p-10">
        
        {/* Loading / Error States (Logika visual dimodifikasi) */}
        {isLoading && !imageError && photo.thumbnailUrl && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div
              className="absolute inset-0 bg-cover bg-center blur-3xl scale-110 opacity-60 transition-opacity"
              style={{ backgroundImage: `url(${photo.thumbnailUrl})` }}
            />
            <div className="relative flex flex-col items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/40" />
              <span className="text-[10px] text-white/30 tracking-widest uppercase">Memuat</span>
            </div>
          </div>
        )}
        {isLoading && !imageError && !photo.thumbnailUrl && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/40" />
              <p className="text-xs text-white/40 tracking-wider">Memuat…</p>
            </div>
          </div>
        )}

        {imageError && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-4 rounded-full bg-white/5 backdrop-blur mb-4 border border-white/10">
              <ImageOff size={32} className="text-white/40" />
            </div>
            <p className="text-sm text-white/50 tracking-wide">Gagal memuat gambar</p>
            <button
              onClick={(e) => { e.stopPropagation(); load(); }}
              className="mt-4 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-5 py-2 text-xs text-white/80 hover:bg-white/20 active:scale-95 transition-all"
            >
              <RefreshCw size={14} /> Coba lagi
            </button>
          </motion.div>
        )}

        {/* 5. The Core Image (Logic Transform tetap identik, UI dimodifikasi) */}
        <AnimatePresence mode="wait">
          {isImageReady && (
            <motion.img
              key={photo.id + fullResMode + imageUrl}
              src={imageUrl}
              alt={photo.name}
              loading="eager"
              decoding="async"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              draggable={false}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (zoom > 1) updateZoom(1);
                else updateZoom(2.5);
              }}
              className="select-none touch-none max-h-full max-w-full object-contain"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `translate(calc(${offset.x}px + ${swipeX.get()}px), ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                willChange: 'transform',
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              }}
              initial={{ opacity: 0, filter: 'blur(12px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* 6. Floating Navigation Arrows */}
        <FloatingNavigation
          showControls={showControls}
          isImageReady={isImageReady}
          canPrev={canPrev}
          canNext={canNext}
          goPrev={goPrev}
          goNext={goNext}
        />

      </div>

      {/* 7. Floating Bottom Toolbar */}
      <FloatingToolbar
        zoom={zoom}
        isImageReady={isImageReady}
        showControls={showControls}
        onZoomOut={(e) => { e.stopPropagation(); updateZoom(Math.max(MIN_ZOOM, zoom - 0.4)); }}
        onZoomIn={(e) => { e.stopPropagation(); updateZoom(Math.min(MAX_ZOOM, zoom + 0.4)); }}
        onResetZoom={(e) => { e.stopPropagation(); updateZoom(1); }}
        onRotate={(e) => { e.stopPropagation(); rotateImage(); }}
        onDownload={(e) => { e.stopPropagation(); handleDownload(); }}
      />

      {/* 8. Micro-Interaction Gesture Hint (Mobile) */}
      {isImageReady && (
        <motion.div 
          className="absolute bottom-24 left-1/2 -translate-x-1/2 text-[9px] text-white/10 font-mono pointer-events-none select-none hidden sm:hidden"
          animate={{ opacity: showControls ? 0.4 : 0 }}
          transition={{ duration: 0.5 }}
        >
          geser • pinch • tap
        </motion.div>
      )}
    </motion.div>
  );
};

export default React.memo(PhotoViewer);