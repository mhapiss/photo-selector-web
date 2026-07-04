import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, FolderOpen } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { containerVariants, itemVariants } from '../../utils/animations';

type HeroSectionProps = {
  onScrollToForm: () => void;
  isMounted: boolean;
};

export function HeroSection({ onScrollToForm, isMounted }: HeroSectionProps) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 60]);
  const heroOpacity = useTransform(scrollY, [0, 380], [1, 0]);

  return (
    <section
      className="relative z-10 flex min-h-[85dvh] flex-col items-center justify-center px-5 pb-10 pt-12 text-center sm:px-8"
      aria-label="Photo Selector"
    >
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {isMounted && (
        <motion.div
          className="flex flex-col items-center gap-5"
          style={{ y: heroY, opacity: heroOpacity }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo + label */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-border bg-card">
              <Logo size={32} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
              Photo Selector
            </p>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="mx-auto max-w-4xl"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
            }}
          >
            <span className="text-ink drop-shadow-sm">Pilih foto dengan mudah. </span>
            <span className="bg-gradient-to-r from-primary via-[#f7d070] to-primary-hover bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 4px 24px rgba(229,169,61,0.3))' }}>
              Editing Jadi Lebih Cepat.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-2xl text-muted/90"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 1.6, fontWeight: 500, letterSpacing: '-0.01em' }}
          >
            Photo Selector membantu fotografer mengelola proses seleksi foto dengan lebih praktis. Tamu memilih foto favorit secara online, lalu hasilnya otomatis menjadi daftar nama file yang siap digunakan untuk proses editing.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-4 mt-4"
          >
            <motion.button
              onClick={onScrollToForm}
              whileHover={{ scale: 1.02, boxShadow: '0 0 32px rgba(229,169,61,0.4)' }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="group relative inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-[15px] font-bold text-white overflow-hidden"
              aria-label="Mulai Sekarang"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
              <FolderOpen size={18} strokeWidth={2.5} />
              Mulai Sekarang
            </motion.button>

            <div
              className="inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-surface/50 backdrop-blur-md px-6 py-4 text-[14px] font-semibold text-ink"
            >
              100% Gratis & Tanpa Akun
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-8 mt-2"
          >
            {[
              { n: 'Mudah', label: 'hanya paste link' },
              { n: '0', label: 'uploads needed' },
              { n: 'WhatsApp', label: 'delivery' },
            ].map(({ n, label }) => (
              <div key={n} className="flex flex-col items-center gap-0.5">
                <span className="text-[14px] font-semibold text-ink">{n}</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted/70">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Scroll indicator */}
      {isMounted && (
        <motion.button
          className="hero-scroll-indicator absolute bottom-7 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 text-muted/60 hover:text-muted transition-colors"
          onClick={onScrollToForm}
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          aria-label="Scroll ke formulir"
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em]">Mulai</span>
          <ChevronDown size={14} />
        </motion.button>
      )}
    </section>
  );
}
