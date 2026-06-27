import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ImageOff,
  RefreshCw,
  Download,
  Info,
  RotateCw,
  X,
  CheckCircle2,
  Expand,
  ScanLine,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { driveThumbUrl, driveMediumUrl, driveLargeUrl } from '../lib/drive';

// ===== TYPES =====
export type PhotoFile = {
  id: string;
  name?: string;
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

// ===== SHARED STYLES =====
const glassStyle = {
  background: 'rgba(10, 10, 15, 0.6)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
};

const toolbarGlassStyle = {
  background: 'rgba(18, 18, 24, 0.75)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
};

// Icon button base classes
const iconBtnBase =
  'flex items-center justify-center rounded-full transition-all duration-150 touch-manipulation shrink-0 focus-visible:ring-2 focus-visible:ring-white/40';
const iconBtnSm = `${iconBtnBase} w-9 h-9 text-white/70 hover:text-white hover:bg-white/10 active:scale-90`;
const iconBtnMd = `${iconBtnBase} w-11 h-11 text-white/80 hover:text-white hover:bg-white/10 active:scale-90`;

// ===== SUB-COMPONENTS =====

// Background: subtle dark with vignette + noise
const BackgroundLayer: React.FC<{ darken: boolean }> = React.memo(({ darken }) => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[#060608]" />
    <motion.div
      className="absolute inset-0"
      animate={{ opacity: darken ? 0.5 : 0.3 }}
      transition={{ duration: 0.6 }}
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
      }}
    />
  </div>
));
BackgroundLayer.displayName = 'BackgroundLayer';

// Top bar — Google Photos / Apple Photos style
const TopBar: React.FC<{
  photo: PhotoFile;
  showControls: boolean;
  onClose: () => void;
  selected: boolean;
  selectionIndex?: number | null;
  onToggleSelect: () => void;
  onRotate: (e: React.MouseEvent) => void;
  onDownload: (e: React.MouseEvent) => void;
  onToggleInfo: (e: React.MouseEvent) => void;
  onToggleFullscreen: (e: React.MouseEvent) => void;
  isImageReady: boolean;
  isMobile: boolean;
}> = React.memo(({
  photo, showControls, onClose, selected, selectionIndex,
  onToggleSelect, onRotate, onDownload, onToggleInfo,
  onToggleFullscreen, isImageReady, isMobile,
}) => (
  <AnimatePresence>
    {showControls && (
      <motion.div
        className="absolute top-0 left-0 right-0 z-40 pointer-events-auto"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
          paddingTop: 'max(env(safe-area-inset-top), 0px)',
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 38 }}
      >
        <div className="flex items-center justify-between px-2 sm:px-3 h-14 sm:h-16">
          {/* LEFT: Close + Filename */}
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 mr-2">
            <button
              onClick={onClose}
              className={`${iconBtnMd} shrink-0`}
              aria-label="Tutup viewer"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            {!isMobile && (
              <span
                className="text-white/80 text-sm font-medium truncate leading-tight"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
                title={photo.name}
              >
                {photo.name ?? ''}
              </span>
            )}
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* Rotate — always visible */}
            <button
              onClick={onRotate}
              disabled={!isImageReady}
              className={`${iconBtnSm} disabled:opacity-30`}
              aria-label="Putar gambar"
            >
              <RotateCw size={17} strokeWidth={2} />
            </button>

            {/* Download — always visible */}
            <button
              onClick={onDownload}
              disabled={!isImageReady}
              className={`${iconBtnSm} disabled:opacity-30`}
              aria-label="Unduh foto"
            >
              <Download size={17} strokeWidth={2} />
            </button>

            {/* Info — always visible */}
            <button
              onClick={onToggleInfo}
              className={iconBtnSm}
              aria-label="Info foto"
            >
              <Info size={17} strokeWidth={2} />
            </button>

            {/* Fullscreen — desktop only */}
            {!isMobile && (
              <button
                onClick={onToggleFullscreen}
                className={iconBtnSm}
                aria-label="Layar penuh"
              >
                <Expand size={16} strokeWidth={2} />
              </button>
            )}

            {/* Divider */}
            <div className="w-px h-5 bg-white/15 mx-1 sm:mx-2 shrink-0" />

            {/* Select button — desktop: full pill, mobile: icon only */}
            {isMobile ? (
              <button
                onClick={onToggleSelect}
                className={`${iconBtnMd} ${selected ? 'text-emerald-400' : 'text-white/70'}`}
                aria-label={selected ? 'Batalkan pilihan' : 'Pilih foto'}
              >
                <CheckCircle2 size={20} strokeWidth={selected ? 2.5 : 1.5} />
              </button>
            ) : (
              <motion.button
                onClick={onToggleSelect}
                className={`flex items-center gap-2 h-9 px-4 rounded-full font-medium text-sm transition-colors duration-200 touch-manipulation border ${
                  selected
                    ? 'bg-emerald-500/90 border-emerald-400/60 text-white hover:bg-emerald-400/90'
                    : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                aria-label={selected ? 'Batalkan pilihan' : 'Pilih foto'}
              >
                {selected ? (
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-white/60" />
                )}
                <span>{selected ? 'Terpilih' : 'Pilih Foto'}</span>
                {selected && selectionIndex != null && (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                    {selectionIndex + 1}
                  </span>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
));
TopBar.displayName = 'TopBar';

// Bottom bar — mobile only: Select pill + secondary actions
const MobileBottomBar: React.FC<{
  show: boolean;
  selected: boolean;
  selectionIndex?: number | null;
  onToggleSelect: () => void;
  zoom: number;
  isImageReady: boolean;
  onZoomOut: (e: React.MouseEvent) => void;
  onZoomIn: (e: React.MouseEvent) => void;
  onResetZoom: (e: React.MouseEvent) => void;
}> = React.memo(({
  show, selected, selectionIndex, onToggleSelect,
  zoom, isImageReady, onZoomOut, onZoomIn, onResetZoom,
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="absolute left-0 right-0 z-30 pointer-events-auto"
        style={{
          bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        <div className="flex flex-col items-center gap-3 px-4 pt-4 pb-2">
          {/* Primary: Select Pill */}
          <motion.button
            onClick={onToggleSelect}
            className={`w-full max-w-[280px] flex items-center justify-center gap-2.5 h-12 rounded-2xl font-semibold text-sm transition-colors duration-200 touch-manipulation border shadow-xl ${
              selected
                ? 'bg-emerald-500 border-emerald-400/50 text-white'
                : 'bg-white/12 border-white/20 text-white backdrop-blur-sm'
            }`}
            style={selected ? {} : toolbarGlassStyle}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            aria-label={selected ? 'Batalkan pilihan' : 'Pilih foto'}
          >
            {selected ? (
              <CheckCircle2 size={20} strokeWidth={2.5} />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-white/60" />
            )}
            <span>{selected ? 'Terpilih' : 'Pilih Foto'}</span>
            {selected && selectionIndex != null && (
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">
                {selectionIndex + 1}
              </span>
            )}
          </motion.button>

          {/* Secondary: Zoom controls pill */}
          <div
            className="flex items-center rounded-full border border-white/10 px-1"
            style={toolbarGlassStyle}
          >
            <button
              onClick={onZoomOut}
              disabled={!isImageReady || zoom <= MIN_ZOOM}
              className={`${iconBtnSm} disabled:opacity-30`}
              aria-label="Perkecil"
            >
              <ZoomOut size={16} strokeWidth={2} />
            </button>
            <button
              onClick={onResetZoom}
              disabled={!isImageReady}
              className="h-9 px-3 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all tabular-nums min-w-[52px] text-center touch-manipulation"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={onZoomIn}
              disabled={!isImageReady || zoom >= MAX_ZOOM}
              className={`${iconBtnSm} disabled:opacity-30`}
              aria-label="Perbesar"
            >
              <ZoomIn size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
));
MobileBottomBar.displayName = 'MobileBottomBar';

// Desktop floating zoom toolbar
const DesktopZoomBar: React.FC<{
  show: boolean;
  zoom: number;
  isImageReady: boolean;
  onZoomOut: (e: React.MouseEvent) => void;
  onZoomIn: (e: React.MouseEvent) => void;
  onResetZoom: (e: React.MouseEvent) => void;
}> = React.memo(({ show, zoom, isImageReady, onZoomOut, onZoomIn, onResetZoom }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
        style={{ bottom: 'calc(max(env(safe-area-inset-bottom, 16px), 16px) + 16px)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        <div
          className="flex items-center rounded-full border border-white/10 shadow-2xl px-1"
          style={toolbarGlassStyle}
        >
          <button
            onClick={onZoomOut}
            disabled={!isImageReady || zoom <= MIN_ZOOM}
            className={`${iconBtnSm} disabled:opacity-30`}
            aria-label="Perkecil"
          >
            <ZoomOut size={16} strokeWidth={2} />
          </button>
          <button
            onClick={onResetZoom}
            disabled={!isImageReady}
            className="h-9 px-3 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all tabular-nums min-w-[52px] text-center touch-manipulation"
            title="Reset zoom (0)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            disabled={!isImageReady || zoom >= MAX_ZOOM}
            className={`${iconBtnSm} disabled:opacity-30`}
            aria-label="Perbesar"
          >
            <ZoomIn size={16} strokeWidth={2} />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
));
DesktopZoomBar.displayName = 'DesktopZoomBar';

// Navigation arrow — desktop only
const NavArrow: React.FC<{
  direction: 'prev' | 'next';
  show: boolean;
  onClick: (e: React.MouseEvent) => void;
}> = React.memo(({ direction, show, onClick }) => {
  const isPrev = direction === 'prev';
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          className={`absolute top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center ${
            isPrev ? 'left-4 lg:left-6' : 'right-4 lg:right-6'
          }`}
          initial={{ opacity: 0, x: isPrev ? -12 : 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isPrev ? -12 : 12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 36 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={onClick}
          aria-label={isPrev ? 'Foto sebelumnya' : 'Foto berikutnya'}
        >
          <div
            className="w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border border-white/15 text-white/70 hover:text-white transition-colors"
            style={glassStyle}
          >
            {isPrev ? (
              <ChevronLeft size={22} strokeWidth={2} />
            ) : (
              <ChevronRight size={22} strokeWidth={2} />
            )}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
});
NavArrow.displayName = 'NavArrow';

// Info sheet — bottom sheet on mobile, side panel on desktop
const InfoSheet: React.FC<{
  photo: PhotoFile;
  fullResMode: boolean;
  show: boolean;
  onClose: () => void;
  isMobile: boolean;
}> = React.memo(({ photo, fullResMode, show, onClose, isMobile }) => (
  <AnimatePresence>
    {show && (
      <>
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Panel */}
        {isMobile ? (
          // Mobile: bottom drag sheet
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-3xl border-t border-white/10 shadow-2xl"
            style={{ background: 'rgba(12,12,18,0.97)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <InfoContent photo={photo} fullResMode={fullResMode} onClose={onClose} />
          </motion.div>
        ) : (
          // Desktop: right side panel
          <motion.div
            className="absolute right-0 top-0 bottom-0 z-50 w-72 lg:w-80 overflow-y-auto border-l border-white/10 shadow-2xl"
            style={{ background: 'rgba(12,12,18,0.97)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 38 }}
          >
            <InfoContent photo={photo} fullResMode={fullResMode} onClose={onClose} />
          </motion.div>
        )}
      </>
    )}
  </AnimatePresence>
));
InfoSheet.displayName = 'InfoSheet';

const InfoContent: React.FC<{
  photo: PhotoFile;
  fullResMode: boolean;
  onClose: () => void;
}> = ({ photo, fullResMode, onClose }) => (
  <div className="p-5 pt-4">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-sm font-semibold text-white/90 tracking-wide">Detail Foto</h3>
      <button
        onClick={onClose}
        className={`${iconBtnSm}`}
        aria-label="Tutup info"
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
    <div className="space-y-0 text-sm">
      {[
        ['Nama File', photo.name ?? '-'],
        ['Ukuran', photo.size ? `${(photo.size / 1024 / 1024).toFixed(2)} MB` : '-'],
        photo.width ? ['Dimensi', `${photo.width} × ${photo.height}`] : null,
        ['Mode Tampilan', fullResMode ? 'Resolusi penuh' : 'Optimal'],
      ].filter((item): item is [string, string] => item !== null).map(([label, value]) => (
        <div key={label} className="flex justify-between py-3 border-b border-white/5">
          <span className="text-white/40 shrink-0">{label}</span>
          <span className="text-white/85 truncate max-w-[180px] text-right ml-3">{value}</span>
        </div>
      ))}
      {photo.exif && (
        <div className="pt-4 mt-1">
          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">EXIF Data</p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs text-white/70">
            {photo.exif.make && <p className="col-span-2 text-white/85">{photo.exif.make} {photo.exif.model}</p>}
            {photo.exif.iso && <p>ISO {photo.exif.iso}</p>}
            {photo.exif.aperture && <p>{photo.exif.aperture}</p>}
            {photo.exif.shutterSpeed && <p>{photo.exif.shutterSpeed}</p>}
            {photo.exif.focalLength && <p>{photo.exif.focalLength}</p>}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Full-res toggle floating badge
const FullResBadge: React.FC<{
  show: boolean;
  active: boolean;
  onToggle: (e: React.MouseEvent) => void;
  isImageReady: boolean;
}> = React.memo(({ show, active, onToggle, isImageReady }) => (
  <AnimatePresence>
    {show && (
      <motion.button
        className="absolute top-16 sm:top-[72px] right-3 sm:right-4 z-30 pointer-events-auto"
        onClick={onToggle}
        disabled={!isImageReady}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={active ? 'Mode resolusi penuh aktif' : 'Aktifkan resolusi penuh'}
      >
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-medium transition-colors duration-200 ${
            active
              ? 'text-blue-300 border-blue-500/50 bg-blue-500/20'
              : 'text-white/50 border-white/10 bg-white/5 hover:text-white/70'
          }`}
        >
          <ScanLine size={12} strokeWidth={2} />
          <span>Resolusi Penuh</span>
        </div>
      </motion.button>
    )}
  </AnimatePresence>
));
FullResBadge.displayName = 'FullResBadge';

// Loading spinner
const LoadingState: React.FC<{ thumbnailUrl?: string }> = React.memo(({ thumbnailUrl }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
    {thumbnailUrl && (
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(32px)',
          opacity: 0.15,
          transform: 'scale(1.05)',
        }}
      />
    )}
    <div className="relative flex flex-col items-center gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
      </div>
      <span className="text-[11px] text-white/30 tracking-[0.2em] uppercase font-medium">Memuat</span>
    </div>
  </div>
));
LoadingState.displayName = 'LoadingState';

// Error state
const ErrorState: React.FC<{ onRetry: () => void }> = React.memo(({ onRetry }) => (
  <motion.div
    className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="p-5 rounded-2xl bg-white/5 border border-white/10"
      animate={{ x: [0, -6, 6, -4, 4, 0] }}
      transition={{ delay: 0.3, duration: 0.5, ease: 'easeInOut' }}
    >
      <ImageOff size={28} className="text-white/35" />
    </motion.div>
    <div className="flex flex-col items-center gap-1">
      <p className="text-sm text-white/50 font-medium">Gagal memuat gambar</p>
      <p className="text-xs text-white/25">Periksa koneksi internet Anda</p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-5 py-2.5 text-xs text-white/80 hover:bg-white/18 hover:text-white active:scale-95 transition-all touch-manipulation"
    >
      <RefreshCw size={13} strokeWidth={2} />
      Coba lagi
    </button>
  </motion.div>
));
ErrorState.displayName = 'ErrorState';

// ===== MAIN COMPONENT =====
export type PhotoViewerProps = {
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
  const [isMobile, setIsMobile] = useState(false);

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

  // ── Responsive detection ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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

  const toggleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }, []);

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!photo) return;
    const url = photo.directUrl || photo.thumbnailUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url; a.download = photo.name ?? 'foto'; a.target = '_blank';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }, [photo]);

  const handleToggleInfo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInfo(v => !v);
  }, []);

  const handleRotate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation(r => (r + 90) % 360);
    showCtrl();
  }, [showCtrl]);

  const handleToggleFullRes = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFullResMode(v => !v);
    showCtrl();
  }, [showCtrl]);

  if (!photo) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060608]">
      <p className="text-white/30 text-sm">Foto tidak tersedia</p>
    </div>
  );

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[100] overflow-hidden select-none"
      style={{
        touchAction: 'none',
        background: '#060608',
        cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default',
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
      {/* ── Background ── */}
      <BackgroundLayer darken={!showControls} />

      {/* ── Top Bar ── */}
      <TopBar
        photo={photo}
        showControls={showControls}
        onClose={onClose}
        selected={selected}
        selectionIndex={selectionIndex}
        onToggleSelect={() => photo && onToggle(photo.id)}
        onRotate={handleRotate}
        onDownload={handleDownload}
        onToggleInfo={handleToggleInfo}
        onToggleFullscreen={toggleFullscreen}
        isImageReady={isImageReady}
        isMobile={isMobile}
      />

      {/* ── Full-res toggle badge ── */}
      <FullResBadge
        show={showControls}
        active={fullResMode}
        onToggle={handleToggleFullRes}
        isImageReady={isImageReady}
      />

      {/* ── Info sheet / panel ── */}
      <InfoSheet
        photo={photo}
        fullResMode={fullResMode}
        show={showInfo}
        onClose={() => setShowInfo(false)}
        isMobile={isMobile}
      />

      {/* ── Photo area ── */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Loading */}
        {isLoading && <LoadingState thumbnailUrl={photo.thumbnailUrl} />}

        {/* Error */}
        {imageError && !isLoading && (
          <ErrorState onRetry={() => { load(); }} />
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
                alt={photo.name ?? 'Foto'}
                draggable={false}
                className="pointer-events-none select-none"
                style={{
                  // Intelligently fit image to available space
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  // Padding accounts for top/bottom bars
                  padding: isMobile
                    ? 'max(env(safe-area-inset-top),56px) 8px max(env(safe-area-inset-bottom),130px) 8px'
                    : '72px 80px 72px 80px',
                  boxSizing: 'border-box',
                  x: pan.x,
                  y: pan.y,
                  scale: zoom,
                  rotate: rotation,
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                }}
                initial={{ opacity: 0, filter: 'blur(16px)', scale: 0.98 }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, filter: 'blur(8px)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Navigation arrows — desktop only ── */}
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

      {/* ── Mobile bottom bar ── */}
      {isMobile && (
        <MobileBottomBar
          show={showControls}
          selected={selected}
          selectionIndex={selectionIndex}
          onToggleSelect={() => photo && onToggle(photo.id)}
          zoom={zoom}
          isImageReady={isImageReady}
          onZoomOut={(e) => { e.stopPropagation(); applyZoom(zoom - 0.4); }}
          onZoomIn={(e) => { e.stopPropagation(); applyZoom(zoom + 0.4); }}
          onResetZoom={(e) => { e.stopPropagation(); applyZoom(1); }}
        />
      )}

      {/* ── Desktop zoom toolbar ── */}
      {!isMobile && (
        <DesktopZoomBar
          show={showControls}
          zoom={zoom}
          isImageReady={isImageReady}
          onZoomOut={(e) => { e.stopPropagation(); applyZoom(zoom - 0.4); }}
          onZoomIn={(e) => { e.stopPropagation(); applyZoom(zoom + 0.4); }}
          onResetZoom={(e) => { e.stopPropagation(); applyZoom(1); }}
        />
      )}

      {/* ── Photo counter ── */}
      <AnimatePresence>
        {showControls && photos.length > 1 && (
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            style={{
              bottom: isMobile
                ? 'calc(max(env(safe-area-inset-bottom, 16px), 16px) + 152px)'
                : 'calc(max(env(safe-area-inset-bottom, 16px), 16px) + 60px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-[11px] text-white/30 font-medium tabular-nums">
              {index + 1} / {photos.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default React.memo(PhotoViewer);