import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import type { PhotoFile } from '../../../types';

type InfoSheetProps = {
  photo: PhotoFile;
  fullResMode: boolean;
  show: boolean;
  onClose: () => void;
  isMobile: boolean;
};

const iconBtnBase =
  'flex items-center justify-center rounded-full transition-all duration-150 touch-manipulation shrink-0 focus-visible:ring-2 focus-visible:ring-white/40 focus:outline-none';
const iconBtnSm = `${iconBtnBase} w-9 h-9 text-white/70 hover:text-white hover:bg-white/10 active:scale-90`;

export const InfoSheet: React.FC<InfoSheetProps> = React.memo(({
  photo,
  fullResMode,
  show,
  onClose,
  isMobile,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Semi-transparent Backdrop overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Details Panel */}
          {isMobile ? (
            // Mobile: slide up bottom sheet
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-[2rem] border-t border-white/10 shadow-2xl pb-safe"
              style={{
                background: 'rgba(15, 15, 22, 0.96)',
                backdropFilter: 'blur(35px)',
                WebkitBackdropFilter: 'blur(35px)',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring' as const, stiffness: 320, damping: 34 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) onClose();
              }}
            >
              <div className="flex justify-center pt-3.5 pb-1 pointer-events-none">
                <div className="w-11 h-1 rounded-full bg-white/20" />
              </div>
              <InfoContent photo={photo} fullResMode={fullResMode} onClose={onClose} />
            </motion.div>
          ) : (
            // Desktop: slide in side panel
            <motion.div
              className="absolute right-0 top-0 bottom-0 z-50 w-80 lg:w-96 overflow-y-auto border-l border-white/10 shadow-2xl"
              style={{
                background: 'rgba(15, 15, 22, 0.94)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
              }}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 360, damping: 38 }}
            >
              <InfoContent photo={photo} fullResMode={fullResMode} onClose={onClose} />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
});

type InfoContentProps = {
  photo: PhotoFile;
  fullResMode: boolean;
  onClose: () => void;
};

const InfoContent: React.FC<InfoContentProps> = ({ photo, fullResMode, onClose }) => {
  const formattedSize = photo.size
    ? `${(photo.size / 1024 / 1024).toFixed(2)} MB`
    : '-';

  return (
    <div className="p-6 pt-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 text-white/90">
          <Info size={16} className="text-violet-400" />
          <h3 className="text-sm font-semibold tracking-wide">Detail File</h3>
        </div>
        <button
          onClick={onClose}
          className={iconBtnSm}
          aria-label="Tutup detail"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Info List */}
      <div className="space-y-1">
        <div className="flex flex-col py-3 border-b border-white/5 gap-0.5">
          <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">Nama File</span>
          <span className="text-sm text-white/90 break-all font-medium leading-relaxed">{photo.name}</span>
        </div>

        <div className="flex justify-between py-3 border-b border-white/5 items-center">
          <span className="text-xs text-white/40">Ukuran File</span>
          <span className="text-sm text-white/85 font-medium">{formattedSize}</span>
        </div>

        <div className="flex justify-between py-3 border-b border-white/5 items-center">
          <span className="text-xs text-white/40">Tipe Berkas</span>
          <span className="text-sm text-white/85 font-medium">{photo.mimeType || 'image/jpeg'}</span>
        </div>

        <div className="flex justify-between py-3 border-b border-white/5 items-center">
          <span className="text-xs text-white/40">Kualitas Tampilan</span>
          <span className="text-sm text-white/85 font-medium">
            {fullResMode ? 'Resolusi Penuh' : 'Optimal (Lancar)'}
          </span>
        </div>
      </div>
    </div>
  );
};

InfoSheet.displayName = 'InfoSheet';
export default InfoSheet;
