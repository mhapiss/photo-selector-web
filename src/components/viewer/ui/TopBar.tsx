import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, Download, Info, Expand, Lock, Unlock, Check, Minus, Plus } from 'lucide-react';
import type { PhotoFile, AlbumMeta } from '../../../types';

type TopBarProps = {
  photo: PhotoFile;
  showControls: boolean;
  onClose: () => void;
  onRotate: () => void;
  onDownload: () => void;
  onToggleInfo: () => void;
  onToggleFullscreen: () => void;
  isImageReady: boolean;
  isMobile: boolean;
  isLocked: boolean;
  onToggleLock: () => void;
  currentIndex: number;
  totalCount: number;
  meta?: AlbumMeta;
  selected?: boolean;
  onToggleSelect?: () => void;
  zoom: number;
  onZoom: (z: number) => void;
};

const btn = 'flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors duration-150 hover:text-white hover:bg-white/10 active:scale-90 focus:outline-none touch-manipulation shrink-0';

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d).replace('.', ':') + ' WIB';
  } catch (e) {
    return '';
  }
}

export const TopBar: React.FC<TopBarProps> = React.memo(({
  photo, showControls, onClose, onRotate, onDownload, onToggleInfo,
  onToggleFullscreen, isImageReady, isMobile, isLocked, onToggleLock,
  currentIndex, totalCount, meta, selected, onToggleSelect,
  zoom, onZoom,
}) => {
  const createdTime = (photo._raw as any)?.createdTime;
  const formattedDate = createdTime ? formatDate(createdTime) : '';
  const locationText = meta?.eventName ? `${meta.eventName} - ${currentIndex + 1} dari ${totalCount}` : `${currentIndex + 1} dari ${totalCount}`;

  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          className="absolute top-0 left-0 right-0 z-40 pointer-events-auto"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.20) 70%, transparent 100%)',
            paddingTop: 'env(safe-area-inset-top, 0px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-3 h-14">
            {/* Left: close + filename */}
            <div className="flex items-center min-w-0 z-10">
              <button onClick={onClose} className={`${btn} h-10 w-10`} aria-label="Tutup">
                <X size={18} strokeWidth={2} />
              </button>
              
              {/* Zoom Slider (Desktop Only) */}
              {!isMobile && (
                <div className="hidden md:flex items-center ml-1 text-white/60">
                  <button onClick={() => onZoom(zoom - 0.25)} className="p-1 hover:text-white transition-colors touch-manipulation" aria-label="Zoom Out">
                    <Minus size={15} strokeWidth={2.5} />
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => onZoom(parseFloat(e.target.value))}
                    className="w-24 mx-1.5 h-1 bg-white/20 rounded-full appearance-none outline-none accent-white cursor-pointer"
                  />
                  <button onClick={() => onZoom(zoom + 0.25)} className="p-1 hover:text-white transition-colors touch-manipulation" aria-label="Zoom In">
                    <Plus size={15} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>

            {/* Center: info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
              <span className="text-[13px] font-semibold text-white tracking-wide truncate px-4" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                {formattedDate || photo.name}
              </span>
              <span className="text-[11px] font-medium text-white/75 mt-0.5 truncate px-4" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                {locationText}
              </span>
            </div>

            {/* Right: actions */}
            <div className="flex items-center justify-end gap-0.5 z-10">
              {/* Select Button (Desktop Only) */}
              {!isMobile && onToggleSelect && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold transition-colors mr-2 ${
                    selected 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : 'bg-white/10 text-white/90 hover:bg-white/20'
                  }`}
                >
                  {selected ? <Check size={14} strokeWidth={2.5} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-white/50" />}
                  {selected ? 'Terpilih' : 'Pilih'}
                </button>
              )}
              
              <button
                onClick={onToggleLock}
                className={`${btn} ${isLocked ? 'text-warning bg-warning/10' : ''}`}
                aria-label={isLocked ? 'Buka kunci' : 'Kunci tampilan'}
                title={isLocked ? 'Buka Kunci' : 'Kunci'}
              >
                {isLocked ? <Lock size={15} strokeWidth={2} /> : <Unlock size={15} strokeWidth={1.8} />}
              </button>
              <button onClick={onRotate} disabled={!isImageReady} className={`${btn} disabled:opacity-25`} aria-label="Putar" title="Putar (R)">
                <RotateCw size={15} strokeWidth={2} />
              </button>
              <button onClick={onDownload} disabled={!isImageReady} className={`${btn} disabled:opacity-25`} aria-label="Unduh" title="Unduh">
                <Download size={15} strokeWidth={1.8} />
              </button>
              <button onClick={onToggleInfo} className={btn} aria-label="Info" title="Info">
                <Info size={15} strokeWidth={1.8} />
              </button>
              {!isMobile && (
                <button onClick={onToggleFullscreen} className={btn} aria-label="Layar penuh" title="Fullscreen (F)">
                  <Expand size={15} strokeWidth={1.8} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

TopBar.displayName = 'TopBar';
export default TopBar;
