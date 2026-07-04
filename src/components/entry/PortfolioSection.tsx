import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PORTFOLIO_SLOTS } from '../../config/constants';
import { SectionLabel } from './SectionLabel';
import { containerVariants, itemVariants } from '../../utils/animations';

const SLOTS_WITH_SRC = PORTFOLIO_SLOTS.filter((s) => s.src);

export function PortfolioSection() {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const isOpen = viewerIndex !== null;

  const canPrev = isOpen && viewerIndex > 0;
  const canNext = isOpen && viewerIndex < SLOTS_WITH_SRC.length - 1;

  const goPrev = useCallback(() => {
    if (canPrev) setViewerIndex((i) => (i !== null ? i - 1 : null));
  }, [canPrev]);

  const goNext = useCallback(() => {
    if (canNext) setViewerIndex((i) => (i !== null ? i + 1 : null));
  }, [canNext]);

  const close = useCallback(() => setViewerIndex(null), []);

  // Keyboard nav
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close, goPrev, goNext]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  const currentSlot = isOpen ? SLOTS_WITH_SRC[viewerIndex] : null;
  const carouselItems = [...SLOTS_WITH_SRC, ...SLOTS_WITH_SRC];

  return (
    <>
      {/* Header */}
      <section className="relative z-10 mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="mb-6 text-center">
            <SectionLabel>Portfolio</SectionLabel>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">
              Hasil Karya Kami
            </h2>
            <p className="mt-3 text-[15px] text-muted">
              Kualitas visual premium yang kami dedikasikan untuk momen spesialmu.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Carousel */}
      <div className="relative w-full overflow-hidden pb-20 pt-2">
        <div className="portfolio-marquee" style={{ gap: '16px' }}>
          {carouselItems.map((slot, index) => (
            <div
              key={`${slot.id}-${index}`}
              onClick={() => {
                const realIdx = SLOTS_WITH_SRC.findIndex((s) => s.id === slot.id);
                if (realIdx !== -1) setViewerIndex(realIdx);
              }}
              className="group relative overflow-hidden rounded-2xl bg-surface shadow-md cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:-translate-y-1"
              style={{ flexShrink: 0, width: 'clamp(160px, 22vw, 260px)' }}
            >
              <div style={{ position: 'relative', paddingBottom: '150%', overflow: 'hidden' }}>
                <img
                  src={slot.thumb || slot.src}
                  alt={slot.label}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute bottom-3 left-3 right-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="text-xs sm:text-[13px] font-bold text-white drop-shadow-md">
                  {slot.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox — rendered via Portal to bypass parent transforms */}
      {isOpen && currentSlot && createPortal(
        <div className="lightbox-overlay" onClick={close}>
          {/* Close */}
          <button
            onClick={close}
            className="lightbox-btn"
            style={{ position: 'absolute', top: 16, right: 16 }}
            aria-label="Tutup"
          >
            <X size={20} />
          </button>

          {/* Counter */}
          <div style={{
            position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500,
          }}>
            {viewerIndex + 1} / {SLOTS_WITH_SRC.length}
          </div>

          {/* Prev */}
          {canPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="lightbox-btn"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              aria-label="Sebelumnya"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Next */}
          {canNext && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="lightbox-btn"
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
              aria-label="Berikutnya"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Image */}
          <img
            key={currentSlot.id}
            src={currentSlot.src}
            alt={currentSlot.label}
            onClick={(e) => e.stopPropagation()}
            className="lightbox-image"
            draggable={false}
          />

          {/* Label */}
          <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            {currentSlot.label}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
