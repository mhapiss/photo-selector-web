import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../../utils/animations';
import { ORBS, ORB_COLORS, BRAND } from '../../config/constants';
import { useMouseParallax } from '../../hooks/useMouseParallax';
import type { AlbumMeta } from '../../types';

import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { EntryForm } from './EntryForm';
import { PortfolioSection } from './PortfolioSection';
import { PricingSection } from './PricingSection';
import { FooterSection } from './FooterSection';
import { SectionLabel } from './SectionLabel';

type EntryScreenProps = { onSubmit: (meta: AlbumMeta) => void };

export function EntryScreen({ onSubmit }: EntryScreenProps) {
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
      {/* JSON-LD structured data */}
      {isMounted && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'RanahTepi Photography',
              description:
                'Fotografer profesional di Medan, Sumatera Utara. Spesialis wedding, prewedding, couple session, dan engagement.',
              url: 'https://ranahtepi.com',
              telephone: `+${BRAND.whatsApp}`,
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Medan',
                addressRegion: 'Sumatera Utara',
                addressCountry: 'ID',
              },
              sameAs: [BRAND.instagram],
              image: [],
              priceRange: 'IDR 1.500.000 – IDR 5.000.000',
              openingHours: 'Mo-Su 08:00-20:00',
            }),
          }}
        />
      )}

      <div
        ref={containerRef}
        className="relative w-full overflow-x-hidden"
        style={{
          background: 'linear-gradient(160deg, #080810 0%, #0d0820 30%, #080d18 65%, #050809 100%)',
        }}
      >
        {/* GLOBAL BACKGROUND LAYER */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(120,40,200,0.22) 0%, transparent 60%),' +
                'radial-gradient(ellipse 60% 40% at 80% 10%, rgba(30,80,200,0.15) 0%, transparent 55%),' +
                'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(10,100,160,0.12) 0%, transparent 60%)',
            }}
          />
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'radial-gradient(ellipse 100% 40% at 50% 0%, rgba(80,30,160,0.18) 0%, transparent 70%)',
            }}
          />
          {ORBS.map((orb, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: orb.size,
                height: orb.size,
                top: orb.top,
                left: (orb as { left?: string }).left,
                right: (orb as { right?: string }).right,
                bottom: (orb as { bottom?: string }).bottom,
                background: ORB_COLORS[orb.colorIdx],
                border: '1px solid rgba(255,255,255,0.03)',
                x: i % 2 === 0 ? parallaxX1 : parallaxX2,
                y: i % 2 === 0 ? parallaxY1 : parallaxY2,
              }}
              animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.05, 1] }}
              transition={{ duration: orb.duration, repeat: Infinity, repeatType: 'reverse', delay: orb.delay, ease: 'easeInOut' }}
            />
          ))}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
            }}
          />
        </div>

        <HeroSection onScrollToForm={scrollToForm} isMounted={isMounted} />

        {/* PHOTO SELECTOR SECTION */}
        <section
          ref={formSectionRef}
          id="photo-selector"
          className="relative z-10 mx-auto w-full max-w-[1100px] px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8"
          aria-label="Photo Selector — Buka Album Fotomu"
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
                <SectionLabel>Photo Selector</SectionLabel>
                <h2
                  className="mx-auto max-w-2xl bg-clip-text text-transparent"
                  style={{
                    fontSize: 'clamp(1.6rem, 4vw, 3rem)',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                    backgroundImage:
                      'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(200,180,255,0.9) 50%, rgba(130,175,255,0.85) 100%)',
                  }}
                >
                  Pilih foto favoritmu.
                  <br />
                  <span
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, rgba(180,150,255,0.9) 0%, rgba(120,160,255,0.85) 50%, rgba(80,210,240,0.9) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Sisanya biar kami yang urus.
                  </span>
                </h2>
                <p
                  className="mx-auto max-w-lg leading-relaxed text-white/45"
                  style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)' }}
                >
                  Buka album dari fotografermu, pilih foto yang kamu suka, lalu kirim pilihanmu
                  langsung ke WhatsApp — tanpa screenshot, tanpa repot ketik nama file satu per satu.
                </p>
              </motion.div>

              <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_440px] lg:gap-10">
                <HowItWorksSection />
                <EntryForm onSubmit={onSubmit} />
              </div>
            </motion.div>
          )}
        </section>

        <PortfolioSection />
        <PricingSection />
        <FooterSection />
      </div>
    </>
  );
}
