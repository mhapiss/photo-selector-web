import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../utils/animations';
import { useMouseParallax } from '../hooks/useMouseParallax';
import type { AlbumMeta } from '../types';

import { HeroSection } from '../components/entry/HeroSection';
import { PortfolioSection } from '../components/entry/PortfolioSection';
import { HowItWorksSection } from '../components/entry/HowItWorksSection';
import { EntryForm } from '../components/entry/EntryForm';
import { FooterSection } from '../components/entry/FooterSection';
import { SectionLabel } from '../components/entry/SectionLabel';

type EntryPageProps = { onSubmit: (meta: AlbumMeta) => void };

export function EntryPage({ onSubmit }: EntryPageProps) {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const formSectionRef = useRef<HTMLElement>(null);

  const { parallaxX1, parallaxY1, parallaxX2, parallaxY2 } = useMouseParallax(containerRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function scrollToForm() {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full overflow-x-hidden bg-background"
      >
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40 dark:opacity-100" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(115deg, rgba(229,169,61,0.12) 0%, transparent 30%),' +
                'linear-gradient(245deg, rgba(242,186,84,0.08) 0%, transparent 36%),' +
                'linear-gradient(15deg, rgba(229,169,61,0.06) 0%, transparent 35%)',
            }}
          />
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.42, 0.7, 0.42] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background:
                'conic-gradient(from 160deg at 50% 20%, rgba(229,169,61,0.10), rgba(242,186,84,0.08), rgba(229,169,61,0.06), rgba(204,148,49,0.08), rgba(229,169,61,0.10))',
              x: parallaxX1,
              y: parallaxY1,
            }}
          />
          <motion.div
            className="absolute inset-x-[-12%] top-[10%] h-[46%] rotate-[-5deg]"
            style={{
              background:
                'linear-gradient(100deg, rgba(229,169,61,0.06), rgba(242,186,84,0.04) 35%, rgba(204,148,49,0.04) 70%, rgba(229,169,61,0.05))',
              filter: 'blur(34px)',
              x: parallaxX2,
              y: parallaxY2,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(229,169,61,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(229,169,61,0.04) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 88%)',
            }}
          />
        </div>

        <HeroSection onScrollToForm={scrollToForm} isMounted={isMounted} />

        <PortfolioSection />

        <section
          ref={formSectionRef}
          id="photo-selector"
          className="relative z-10 mx-auto w-full max-w-[1100px] px-4 pb-24 pt-2 sm:px-6 sm:pt-4 lg:px-8"
          aria-label="Photo Selector - buat galeri klien"
        >
          {isMounted && (
            <motion.div
              className="w-full"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              <motion.div variants={itemVariants} className="mb-10 flex flex-col items-center gap-3 text-center">
                <SectionLabel>Sat set tanpa perlu nulis satu persatu nama file </SectionLabel>
                <h2
                  className="mx-auto max-w-2xl text-ink"
                  style={{
                    fontSize: 'clamp(1.6rem, 4vw, 3rem)',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: '0',
                  }}
                >
                  Cukup pilih foto
                  <br />
                  <span className="text-primary">Editan cepat di proses.</span>
                </h2>
                <p
                  className="mx-auto max-w-lg leading-relaxed text-muted"
                  style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)' }}
                >
                  Biarkan Tamu memilih foto favorit mereka dengan nyaman. Setelah selesai, kamu langsung menerima daftar nama file yang siap digunakan untuk proses editing tanpa perlu memilah atau mencocokkan foto secara manual.
                </p>
              </motion.div>

              <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_520px] lg:gap-10">
                <HowItWorksSection />
                <EntryForm onSubmit={onSubmit} />
              </div>
            </motion.div>
          )}
        </section>

        <FooterSection />
      </div>
    </>
  );
}
