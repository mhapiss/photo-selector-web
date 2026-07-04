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

const panelStyle = {
  background: 'rgba(22,22,24,0.97)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
};

export const InfoSheet: React.FC<InfoSheetProps> = React.memo(({
  photo, fullResMode, show, onClose, isMobile,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {isMobile ? (
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[18px] border-t border-white/08 overflow-hidden"
              style={{ ...panelStyle, maxHeight: '72vh', overflowY: 'auto', paddingBottom: 'max(env(safe-area-inset-bottom,0px),16px)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => { if (info.offset.y > 80) onClose(); }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-white/15" />
              </div>
              <InfoContent photo={photo} fullResMode={fullResMode} onClose={onClose} />
            </motion.div>
          ) : (
            <motion.div
              className="absolute right-0 top-0 bottom-0 z-50 w-72 border-l border-white/06 overflow-y-auto"
              style={panelStyle}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            >
              <InfoContent photo={photo} fullResMode={fullResMode} onClose={onClose} />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
});

const InfoContent: React.FC<{ photo: PhotoFile; fullResMode: boolean; onClose: () => void }> = ({
  photo, fullResMode, onClose,
}) => {
  const sizeStr = photo.size ? `${(photo.size / 1024 / 1024).toFixed(2)} MB` : '—';
  return (
    <div className="p-5 text-white">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-white/70">
          <Info size={14} className="text-white/40" />
          <span className="text-[13px] font-medium">Detail File</span>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/08 transition-colors focus:outline-none" aria-label="Tutup">
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      <div className="space-y-0 divide-y divide-white/06">
        {[
          { label: 'Nama File', value: photo.name, mono: true },
          { label: 'Ukuran', value: sizeStr },
          { label: 'Tipe', value: photo.mimeType || 'image/jpeg' },
          { label: 'Kualitas', value: fullResMode ? 'Resolusi Penuh' : 'Optimal' },
        ].map(({ label, value, mono }) => (
          <div key={label} className="py-3">
            <p className="text-[11px] text-white/35 uppercase tracking-[0.12em] mb-1">{label}</p>
            <p className={`text-[13px] text-white/80 break-all leading-snug ${mono ? 'font-mono text-[12px]' : ''}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

InfoSheet.displayName = 'InfoSheet';
export default InfoSheet;
