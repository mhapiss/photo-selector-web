import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Phone, ChevronDown } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { BRAND } from '../../config/constants';
import { containerVariants, itemVariants } from '../../utils/animations';

type HeroSectionProps = {
  onScrollToForm: () => void;
  isMounted: boolean;
};

export function HeroSection({ onScrollToForm, isMounted }: HeroSectionProps) {
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 600], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section
      className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 text-center sm:px-6 lg:px-8"
      aria-label="Hero"
    >
      {isMounted && (
        <motion.div
          className="flex flex-col items-center gap-6"
          style={{ y: heroParallaxY, opacity: heroOpacity }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo badge */}
          <motion.div variants={itemVariants} className="mb-2 flex flex-col items-center gap-3">
            <motion.div
              className="group relative flex h-16 w-16 items-center justify-center rounded-[20px]"
              style={{
                background: 'linear-gradient(135deg, rgba(140,60,240,0.35) 0%, rgba(60,100,240,0.22) 100%)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 8px 32px rgba(100,40,200,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              aria-hidden="true"
            >
              <Logo size={36} />
              <div
                className="absolute inset-0 rounded-[20px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'radial-gradient(circle at center, rgba(140,60,240,0.2), transparent)' }}
              />
            </motion.div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
              {BRAND.name} Photography
            </p>
          </motion.div>

          {/* Hero headline */}
          <motion.div variants={itemVariants}>
            <h1
              className="mx-auto max-w-4xl bg-clip-text text-transparent"
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 6rem)',
                fontWeight: 800,
                lineHeight: 1.06,
                letterSpacing: '-0.04em',
                backgroundImage:
                  'linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(210,190,255,0.92) 35%, rgba(140,180,255,0.88) 70%, rgba(80,210,240,0.85) 100%)',
              }}
            >
              Setiap momen
              <br />
              <span
                style={{
                  backgroundImage:
                    'linear-gradient(145deg, rgba(180,150,255,0.95) 0%, rgba(120,165,255,0.9) 50%, rgba(80,215,245,0.95) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                layak diabadikan.
              </span>
            </h1>
          </motion.div>

          {/* Hero subtitle */}
          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-xl leading-relaxed text-white/45"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}
          >
            Fotografer profesional di Medan — spesialis wedding, prewedding, couple session &amp;
            engagement. Kami ceritakan kisahmu melalui bingkai yang tak terlupakan.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-2 flex flex-wrap items-center justify-center gap-3"
          >
            <motion.button
              onClick={onScrollToForm}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-semibold text-black transition-all duration-200 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                boxShadow: '0 4px 24px rgba(139,92,246,0.45)',
              }}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 36px rgba(139,92,246,0.55)' }}
              whileTap={{ scale: 0.97 }}
              aria-label="Buka Photo Selector"
            >
              <Sparkles size={15} aria-hidden="true" />
              Buka Photo Selector
            </motion.button>

            <a
              href={`https://wa.me/${BRAND.whatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-7 py-3.5 text-[14px] font-semibold text-white/75 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-[0.97]"
            >
              <Phone size={14} aria-hidden="true" />
              Hubungi Kami
            </a>
          </motion.div>

          {/* Trust signal */}
          <motion.div variants={itemVariants} className="mt-3 flex items-center gap-5">
            {[
              { label: '5+ Tahun', sub: 'Pengalaman' },
              { label: '500+', sub: 'Klien Puas' },
              { label: 'Medan', sub: 'Sumatera Utara' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5">
                <span className="text-[15px] font-bold text-white/80">{stat.label}</span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-white/25">
                  {stat.sub}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Scroll indicator */}
      {isMounted && (
        <motion.button
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/20 transition-colors hover:text-white/40"
          onClick={onScrollToForm}
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          aria-label="Scroll ke bawah"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">Scroll</span>
          <ChevronDown size={16} aria-hidden="true" />
        </motion.button>
      )}
    </section>
  );
}
