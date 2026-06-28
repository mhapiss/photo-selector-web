import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, Download, Info, Expand, CheckCircle2, Lock, Unlock } from 'lucide-react';
import type { PhotoFile } from '../../../types';

type TopBarProps = {
  photo: PhotoFile;
  showControls: boolean;
  onClose: () => void;
  selected: boolean;
  selectionIndex: number | null;
  onToggleSelect: () => void;
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
};

const glassStyle = {
  background: 'rgba(10, 10, 15, 0.65)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
};

const iconBtnBase =
  'flex items-center justify-center rounded-full transition-all duration-150 touch-manipulation shrink-0 focus-visible:ring-2 focus-visible:ring-white/40 focus:outline-none';
const iconBtnSm = `${iconBtnBase} w-9 h-9 text-white/70 hover:text-white hover:bg-white/10 active:scale-90`;
const iconBtnMd = `${iconBtnBase} w-11 h-11 text-white/80 hover:text-white hover:bg-white/10 active:scale-90`;

export const TopBar: React.FC<TopBarProps> = React.memo(({
  photo,
  showControls,
  onClose,
  selected,
  selectionIndex,
  onToggleSelect,
  onRotate,
  onDownload,
  onToggleInfo,
  onToggleFullscreen,
  isImageReady,
  isMobile,
  isLocked,
  onToggleLock,
  currentIndex,
  totalCount,
}) => {
  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          className="absolute top-0 left-0 right-0 z-40 pointer-events-auto"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
            paddingTop: 'max(env(safe-area-inset-top), 0px)',
          }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 38 }}
        >
          <div className="relative flex items-center justify-between px-3 h-14 sm:h-16">
            
            {/* LEFT: Close button + Filename */}
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 z-10">
              <button
                onClick={onClose}
                className={iconBtnMd}
                aria-label="Tutup viewer"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
              {!isMobile && (
                <span
                  className="text-white/80 text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]"
                  style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
                  title={photo.name}
                >
                  {photo.name}
                </span>
              )}
            </div>

            {/* CENTERED: Photo Counter */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white/90 border border-white/10 shadow-lg pointer-events-auto select-none"
                style={glassStyle}
              >
                {currentIndex + 1} / {totalCount}
              </div>
            </div>

            {/* RIGHT: Action Buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 z-10">
              {/* Lock Mode Button */}
              <button
                onClick={onToggleLock}
                className={`${iconBtnSm} ${isLocked ? 'text-amber-400 bg-amber-500/10' : 'text-white/70'}`}
                aria-label={isLocked ? 'Buka kunci gerakan' : 'Kunci gerakan gambar'}
                title={isLocked ? 'Buka Kunci' : 'Kunci Tampilan'}
              >
                {isLocked ? <Lock size={16} strokeWidth={2.5} /> : <Unlock size={16} strokeWidth={2} />}
              </button>

              {/* Rotate Button */}
              <button
                onClick={onRotate}
                disabled={!isImageReady}
                className={`${iconBtnSm} disabled:opacity-30`}
                aria-label="Putar 90 derajat"
                title="Putar"
              >
                <RotateCw size={17} strokeWidth={2} />
              </button>

              {/* Download Button */}
              <button
                onClick={onDownload}
                disabled={!isImageReady}
                className={`${iconBtnSm} disabled:opacity-30`}
                aria-label="Unduh foto"
                title="Unduh"
              >
                <Download size={17} strokeWidth={2} />
              </button>

              {/* Info Button */}
              <button
                onClick={onToggleInfo}
                className={iconBtnSm}
                aria-label="Detail info foto"
                title="Info Detail"
              >
                <Info size={17} strokeWidth={2} />
              </button>

              {/* Fullscreen Button (Desktop Only) */}
              {!isMobile && (
                <button
                  onClick={onToggleFullscreen}
                  className={iconBtnSm}
                  aria-label="Layar penuh"
                  title="Fullscreen"
                >
                  <Expand size={16} strokeWidth={2} />
                </button>
              )}

              {/* Divider */}
              <div className="w-px h-5 bg-white/15 mx-1.5 sm:mx-2 shrink-0" />

              {/* Select Button */}
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
                  className={`flex items-center gap-2 h-9 px-4 rounded-full font-medium text-sm transition-colors duration-200 border ${
                    selected
                      ? 'bg-emerald-500/90 border-emerald-400/60 text-white hover:bg-emerald-400/90'
                      : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
                  aria-label={selected ? 'Batalkan pilihan' : 'Pilih foto'}
                >
                  {selected ? (
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-white/60" />
                  )}
                  <span>{selected ? 'Terpilih' : 'Pilih Foto'}</span>
                  {selected && selectionIndex !== null && (
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
  );
});

TopBar.displayName = 'TopBar';
export default TopBar;
