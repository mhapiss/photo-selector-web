import { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import type { PortfolioSlot } from '../../config/constants';

export function PortfolioCard({ slot, index }: { slot: PortfolioSlot; index: number }) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`${slot.span} relative overflow-hidden rounded-2xl`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className={`relative w-full ${slot.aspectClass} overflow-hidden`}>
        {slot.src ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 skeleton" aria-hidden="true" />
            )}
            <motion.img
              src={slot.src}
              alt={slot.label}
              className="h-full w-full object-cover"
              style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease' }}
              onLoad={() => setLoaded(true)}
              animate={{ scale: hovered ? 1.04 : 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, rgba(${(index * 30) % 200},${50 + (index * 20) % 100},${200 - (index * 15) % 100},0.08) 0%, rgba(10,10,20,0.5) 100%)`,
              }}
            />
            <div className="relative z-10 flex flex-col items-center gap-2 opacity-30">
              <ImageIcon size={24} strokeWidth={1.5} className="text-white" aria-hidden="true" />
              <span className="text-[11px] font-medium uppercase tracking-widest text-white/60">
                {slot.label}
              </span>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 flex items-end p-4"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <span className="text-[12px] font-semibold tracking-wide text-white/80">
            {slot.label}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
