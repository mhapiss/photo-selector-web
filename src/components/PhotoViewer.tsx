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
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { driveThumbUrl, driveMediumUrl, driveLargeUrl } from '../lib/drive';

// ===== TYPES =====
export type PhotoFile = {
  id: string;
  name: string;
  size?: number;
  mimeType?: string;
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

// ===== CONSTANTS =====
const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const SWIPE_THRESHOLD = 70;
const DOUBLE_TAP_MS = 280;

// ===== UTILS =====
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

// ===== HOOKS =====
function useImageLoader(photo: PhotoFile | undefined, fullRes: boolean) {
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
      img.crossOrigin = 'anonymous';
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
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.src = urls[0];
    }
  }, []);

  return { imageUrl, isLoading, imageError, load, prefetch };
}

function useAutoHideControls(containerRef: React.RefObject<HTMLDivElement>, timeoutMs = 3500) {
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

// ===== REUSABLE UI COMPONENTS =====
const BackgroundLayer: React.FC<{ darken: boolean }> = React.memo(({ darken }) => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[#050505]" />
    <div
      className="absolute inset-0 transition-opacity duration-500"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)',
      }}
    />
    <div
      className="absolute inset-0 opacity-30 mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        backgroundSize: '256px 256px',
      }}
    />
    <motion.div
      className="absolute inset-0 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: darken ? 0.3 : 0 }}
      transition={{ duration: 0.8 }}
    />
  </div>
));

// ── NEW: Close button (top‑left, always visible) ──
const CloseButton: React.FC<{ onClose: () => void }> = React.memo(({ onClose }) => (
  <motion.button
    className="absolute top-0 left-0 z-40 p-4"
    style={{
      paddingTop: 'max(env(safe-area-inset-top), 16px)',
      paddingLeft: 'max(env(safe-area-inset-left), 16px)',
    }}
    onClick={onClose}
    aria-label="Close viewer"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  >
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center border border-white/20 shadow-lg"
      style={{
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <X size={22} strokeWidth={2.5} className="text-white" />
    </div>
  </motion.button>
));

// ── NEW: Glass button for top‑right actions ──
const GlassButton: React.FC<{
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
}> = React.memo(({ onClick, icon, label, active, disabled }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/20 transition-colors ${
      active ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
    } disabled:opacity-30`}
    style={{
      background: active ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.3)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    aria-label={label}
  >
    {icon}
  </motion.button>
));

// ── NEW: Top‑right actions (full‑res & fullscreen), auto‑hide with controls ──
const TopRightActions: React.FC<{
  showControls: boolean;
  fullResMode: boolean;
  isImageReady: boolean;
  onToggleFullRes: (e: React.MouseEvent) => void;
  onToggleFullscreen: (e: React.MouseEvent) => void;
}> = React.memo(({ showControls, fullResMode, isImageReady, onToggleFullRes, onToggleFullscreen }) => (
  <AnimatePresence>
    {showControls && (
      <motion.div
        className="absolute top-0 right-0 z-30 flex items-center gap-1 p-4"
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 16px)',
          paddingRight: 'max(env(safe-area-inset-right), 16px)',
        }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      >
        <GlassButton
          onClick={onToggleFullRes}
          active={fullResMode}
          icon={<Maximize2 size={17} strokeWidth={2} />}
          label="Toggle full resolution"
          disabled={!isImageReady}
        />
        <GlassButton
          onClick={onToggleFullscreen}
          icon={<Fullscreen size={17} strokeWidth={2} />}
          label="Toggle fullscreen"
        />
      </motion.div>
    )}
  </AnimatePresence>
));

// ── Info Sheet (unchanged) ──
const InfoSheet: React.FC<{
  photo: PhotoFile;
  fullResMode: boolean;
  show: boolean;
  onClose: () => void;
}> = React.memo(({ photo, fullResMode, show, onClose }) => (
  <AnimatePresence>
    {show && (
      <>
        <motion.div
          className="fixed inset-0 z-30"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-3xl border-t border-white/10 shadow-2xl"
          style={{ background: 'rgba(15,15,15,0.97)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          <div className="p-6 pt-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white tracking-wide">Detail Foto</h3>
              <button onClick={onClose} className="p-2 rounded-full text-white/50 hover:bg-white/10 active:scale-90 transition-all">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-0 text-sm">
              {[
                ['Nama File', photo.name],
                ['Ukuran', photo.size ? `${(photo.size / 1024 / 1024).toFixed(2)} MB` : '-'],
                photo.width ? ['Dimensi', `${photo.width}×${photo.height}`] : null,
                ['Mode Tampilan', fullResMode ? 'Resolusi penuh' : 'Optimal'],
              ].filter((item): item is [string, string] => item !== null).map(([label, value]) => (
                <div key={label} className="flex justify-between py-2.5 border-b border-white/5">
                  <span className="text-white/40">{label}</span>
                  <span className="text-white/90 truncate max-w-[200px] text-right">{value}</span>
                </div>
              ))}
              {photo.exif && (
                <div className="pt-3 mt-1">
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

// ── Bottom toolbar (now includes EXIF) ──
const FloatingToolbar: React.FC<{
  zoom: number;
  isImageReady: boolean;
  showControls: boolean;
  onZoomOut: (e: React.MouseEvent) => void;
  onZoomIn: (e: React.MouseEvent) => void;
  onResetZoom: (e: React.MouseEvent) => void;
  onRotate: (e: React.MouseEvent) => void;
  onDownload: (e: React.MouseEvent) => void;
  onToggleInfo: (e: React.MouseEvent) => void;
}> = React.memo(({ zoom, isImageReady, showControls, onZoomOut, onZoomIn, onResetZoom, onRotate, onDownload, onToggleInfo }) => (
  <AnimatePresence>
    {showControls && (
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-30"
        style={{
          bottom: 'calc(max(env(safe-area-inset-bottom, 20px), 20px) + 80px)',
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      >
        <div
          className="flex items-center gap-1 px-3 py-1.5 border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
        >
          <button onClick={onZoomOut} disabled={!isImageReady || zoom <= MIN_ZOOM} className="p-2.5 rounded-full text-white/70 hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30">
            <ZoomOut size={18} strokeWidth={2} />
          </button>
          <button onClick={onResetZoom} disabled={!isImageReady} className="min-w-[52px] p-2 rounded-full text-center text-xs font-medium text-white/90 hover:bg-white/10 transition-all tabular-nums" title="Reset zoom">
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={onZoomIn} disabled={!isImageReady || zoom >= MAX_ZOOM} className="p-2.5 rounded-full text-white/70 hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30">
            <ZoomIn size={18} strokeWidth={2} />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button onClick={onRotate} disabled={!isImageReady} className="p-2.5 rounded-full text-white/70 hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30">
            <RotateCw size={17} strokeWidth={2} />
          </button>
          <button onClick={onDownload} disabled={!isImageReady} className="p-2.5 rounded-full text-white/70 hover:bg-white/10 active:scale-90 transition-all disabled:opacity-30">
            <Download size={17} strokeWidth={2} />
          </button>
          <button onClick={onToggleInfo} className="p-2.5 rounded-full text-white/70 hover:bg-white/10 active:scale-90 transition-all" aria-label="EXIF info">
            <Info size={17} strokeWidth={2} />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
));

// ── NEW: Select Photo CTA (always visible, centered above safe area) ──
const SelectButton: React.FC<{
  selected: boolean;
  selectionIndex?: number | null;
  onToggle: () => void;
}> = React.memo(({ selected, selectionIndex, onToggle }) => (
  <motion.button
    className="absolute left-1/2 -translate-x-1/2 z-30"
    style={{
      bottom: 'calc(max(env(safe-area-inset-bottom, 20px), 20px) + 16px)',
    }}
    onClick={onToggle}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.96 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    aria-label={selected ? 'Deselect photo' : 'Select photo'}
  >
    <div
      className={`flex items-center gap-2 px-6 py-3 rounded-full border text-white font-semibold shadow-lg transition-colors duration-300 ${
        selected
          ? 'bg-blue-500 border-blue-400'
          : 'bg-white/10 border-white/20 hover:bg-white/20'
      }`}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        minWidth: '180px',
        justifyContent: 'center',
      }}
    >
      {selected ? (
        <motion.span
          key="check"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Check size={20} strokeWidth={3} />
        </motion.span>
      ) : (
        <span>Select Photo</span>
      )}
      {selected && <span>Selected</span>}
      {selectionIndex != null && (
        <span className="text-xs opacity-80 ml-1">#{selectionIndex + 1}</span>
      )}
    </div>
  </motion.button>
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

const PhotoViewer: React.FC<PhotoViewerProps> = ({
  photos,
  index,
  selected,
  selectionIndex = null,
  onClose,
  onNavigate,
  onToggle,
}) => {
  // ── State ──
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [fullResMode, setFullResMode] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // ── Refs ──
  const containerRef = useRef<HTMLDivElement>(null);
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

  // ── Derived ──
  const photo = useMemo(() => photos[index], [photos, index]);
  const { imageUrl, isLoading, imageError, load, prefetch } = useImageLoader(photo, fullResMode);
  const { showControls, show: showCtrl, toggle: toggleCtrl } = useAutoHideControls(containerRef);
  const isImageReady = !isLoading && !imageError && !!imageUrl;
  const canPrev = index > 0;
  const canNext = index < photos.length - 1;

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  // ── Helpers ──
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
    } else {
      const clamped = clampPan(panRef.current.x, panRef.current.y, safe);
      panRef.current = clamped;
      setPan(clamped);
    }
  }, [clampPan]);

  const applyPan = useCallback((x: number, y: number) => {
    const clamped = clampPan(x, y, zoomRef.current);
    panRef.current = clamped;
    setPan(clamped);
  }, [clampPan]);

  const goPrev = useCallback(() => {
    if (index > 0) { animate(swipeX, 0, { duration: 0 }); onNavigate(index - 1); showCtrl(); }
  }, [index, onNavigate, showCtrl, swipeX]);

  const goNext = useCallback(() => {
    if (index < photos.length - 1) { animate(swipeX, 0, { duration: 0 }); onNavigate(index + 1); showCtrl(); }
  }, [index, onNavigate, photos.length, showCtrl, swipeX]);

  // ── Non‑passive wheel for zoom ──
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
  }, [applyZoom, showCtrl]);

  // ── iOS body scroll lock ──
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

  // ── Prevent native touchmove ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, []);

  // ── Desktop pointer events ──
  const onMouseDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (zoomRef.current <= 1) return;
    e.preventDefault();
    dragRef.current = { x: e.clientX, y: e.clientY, px: panRef.current.x, py: panRef.current.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    showCtrl();
  }, [showCtrl]);

  const onMouseMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !dragRef.current) return;
    applyPan(
      dragRef.current.px + (e.clientX - dragRef.current.x),
      dragRef.current.py + (e.clientY - dragRef.current.y),
    );
  }, [applyPan]);

  const onMouseUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    dragRef.current = null;
    setTimeout(() => setIsDragging(false), 50);
  }, []);

  // ── Touch events ──
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
      if (zoomRef.current > 1) {
        isSwiping.current = false;
        dragRef.current = { x: t.clientX, y: t.clientY, px: panRef.current.x, py: panRef.current.y };
      } else {
        isSwiping.current = true;
        swipeStartRef.current = t.clientX;
        swipeX.stop();
      }
    }
  }, [showCtrl, swipeX]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const t1 = e.touches[0], t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchRef.current.zoom * (dist / pinchRef.current.dist)));
      const mx = (t1.clientX + t2.clientX) / 2;
      const my = (t1.clientY + t2.clientY) / 2;
      zoomRef.current = newZoom;
      setZoom(newZoom);
      if (newZoom > 1) {
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
      } else if (dragRef.current && zoomRef.current > 1) {
        applyPan(
          dragRef.current.px + (t.clientX - dragRef.current.x),
          dragRef.current.py + (t.clientY - dragRef.current.y),
        );
      }
    }
  }, [clampPan, applyPan, canPrev, canNext, swipeX]);

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

  // ── Reset on photo change ──
  useEffect(() => {
    zoomRef.current = 1;
    setZoom(1);
    panRef.current = { x: 0, y: 0 };
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFullResMode(false);
    setShowInfo(false);
    setIsDragging(false);
    animate(swipeX, 0, { duration: 0 });
  }, [index, swipeX]);

  // ── Prefetch adjacent ──
  useEffect(() => {
    if (!photo) return;
    if (index > 0) prefetch(photos[index - 1]);
    if (index < photos.length - 1) prefetch(photos[index + 1]);
  }, [index, photo, photos, prefetch]);

  // ── Keyboard ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'Escape':
          if (document.fullscreenElement) document.exitFullscreen?.();
          else onClose();
          break;
        case 'ArrowLeft': goPrev(); break;
        case 'ArrowRight': goNext(); break;
        case 'Home': if (index > 0) onNavigate(0); break;
        case 'End': if (index < photos.length - 1) onNavigate(photos.length - 1); break;
        case 'r': case 'R': setRotation(r => (r + 90) % 360); break;
        case 'f': case 'F':
          if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
          else document.exitFullscreen?.().catch(() => {});
          break;
        case '+': case '=': applyZoom(zoomRef.current + 0.4); break;
        case '-': applyZoom(zoomRef.current - 0.4); break;
        case '0': applyZoom(1); break;
        case ' ': case 'Enter':
          e.preventDefault();
          if (photo) onToggle(photo.id);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext, onClose, onToggle, photo, index, photos.length, onNavigate, applyZoom]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }, []);

  const handleDownload = useCallback(() => {
    if (!photo) return;
    const url = photo.directUrl || photo.thumbnailUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url; a.download = photo.name; a.target = '_blank';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }, [photo]);

  const handleToggleInfo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInfo(v => !v);
  }, []);

  if (!photo) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <p className="text-white/40 text-sm">Foto tidak tersedia</p>
    </div>
  );

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[100] overflow-hidden select-none"
      style={{
        touchAction: 'none',
        background: '#050505',
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onPointerDown={onMouseDown}
      onPointerMove={onMouseMove}
      onPointerUp={onMouseUp}
      onPointerCancel={onMouseUp}
    >
      {/* ── Background ── */}
      <BackgroundLayer darken={!showControls} />

      {/* ── Close button (top‑left, always visible) ── */}
      <CloseButton onClose={onClose} />

      {/* ── Top‑right actions (full‑res & fullscreen) ── */}
      <TopRightActions
        showControls={showControls}
        fullResMode={fullResMode}
        isImageReady={isImageReady}
        onToggleFullRes={(e) => { e.stopPropagation(); setFullResMode(v => !v); showCtrl(); }}
        onToggleFullscreen={(e) => { e.stopPropagation(); toggleFullscreen(); }}
      />

      {/* ── Info sheet ── */}
      <InfoSheet photo={photo} fullResMode={fullResMode} show={showInfo} onClose={() => setShowInfo(false)} />

      {/* Photo area */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            {photo.thumbnailUrl && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${photo.thumbnailUrl})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'blur(24px)',
                  opacity: 0.2,
                }}
              />
            )}
            <div className="relative flex flex-col items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
              <span className="text-[10px] text-white/30 tracking-widest uppercase">Memuat</span>
            </div>
          </div>
        )}

        {/* Error */}
        {imageError && !isLoading && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-4 rounded-full bg-white/5 mb-4 border border-white/10">
              <ImageOff size={32} className="text-white/40" />
            </div>
            <p className="text-sm text-white/50 mb-4">Gagal memuat gambar</p>
            <button
              onClick={(e) => { e.stopPropagation(); load(); }}
              className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-xs text-white/80 hover:bg-white/20 active:scale-95 transition-all"
            >
              <RefreshCw size={14} /> Coba lagi
            </button>
          </motion.div>
        )}

        {/* Image container — swipeX on wrapper, transforms on image */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ x: swipeX }}
        >
          <AnimatePresence mode="wait">
            {isImageReady && (
              <motion.img
                key={photo.id + String(fullResMode) + imageUrl}
                src={imageUrl}
                alt={photo.name}
                draggable={false}
                className="pointer-events-none select-none"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  x: pan.x,
                  y: pan.y,
                  scale: zoom,
                  rotate: rotation,
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                }}
                initial={{ opacity: 0, filter: 'blur(12px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Navigation buttons ── */}
      <AnimatePresence>
        {showControls && isImageReady && canPrev && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            whileHover={{ scale: 1.08 }}
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white transition-all active:scale-90"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && isImageReady && canNext && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            whileHover={{ scale: 1.08 }}
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white transition-all active:scale-90"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            aria-label="Foto berikutnya"
          >
            <ChevronRight size={22} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Bottom toolbar (now includes EXIF) ── */}
      <FloatingToolbar
        zoom={zoom}
        isImageReady={isImageReady}
        showControls={showControls}
        onZoomOut={(e) => { e.stopPropagation(); applyZoom(zoom - 0.4); }}
        onZoomIn={(e) => { e.stopPropagation(); applyZoom(zoom + 0.4); }}
        onResetZoom={(e) => { e.stopPropagation(); applyZoom(1); }}
        onRotate={(e) => { e.stopPropagation(); setRotation(r => (r + 90) % 360); showCtrl(); }}
        onDownload={(e) => { e.stopPropagation(); handleDownload(); }}
        onToggleInfo={handleToggleInfo}
      />

      {/* ── Select Photo CTA (always visible, centered above safe area) ── */}
      <SelectButton
        selected={selected}
        selectionIndex={selectionIndex}
        onToggle={() => photo && onToggle(photo.id)}
      />
    </motion.div>
  );
};

export default React.memo(PhotoViewer);