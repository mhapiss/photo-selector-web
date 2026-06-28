import { motion } from 'framer-motion';
import { Instagram, ArrowRight } from 'lucide-react';
import { BRAND, PORTFOLIO_SLOTS } from '../../config/constants';
import { fadeUp } from '../../utils/animations';
import { SectionLabel } from './SectionLabel';
import { PortfolioCard } from './PortfolioCard';

export function PortfolioSection() {
  return (
    <section
      id="portfolio"
      className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pb-28 pt-4 sm:px-6 lg:px-8"
      aria-label="Portfolio"
    >
      {/* Divider */}
      <div className="mb-16 h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

      <motion.div
        className="mb-12 flex flex-col items-center gap-3 text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <SectionLabel>Portfolio</SectionLabel>
        <h2
          className="mx-auto max-w-2xl bg-clip-text text-transparent"
          style={{
            fontSize: 'clamp(1.6rem, 4vw, 3rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            backgroundImage:
              'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(200,180,255,0.9) 60%, rgba(130,175,255,0.85) 100%)',
          }}
        >
          Karya yang berbicara
          <br />
          sendiri.
        </h2>
        <p className="mx-auto max-w-md text-[14px] leading-relaxed text-white/40">
          Setiap foto adalah cerita. Berikut adalah sebagian karya terbaik kami.
        </p>
      </motion.div>

      {/* Bento grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {PORTFOLIO_SLOTS.map((slot, index) => (
          <PortfolioCard key={slot.id} slot={slot} index={index} />
        ))}
      </div>

      {/* Instagram CTA */}
      <motion.div
        className="mt-10 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <a
          href={BRAND.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.05] px-7 py-3 text-[13px] font-semibold text-white/60 backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.09] hover:text-white/80 active:scale-[0.97]"
          aria-label="Lihat lebih banyak karya di Instagram"
        >
          <Instagram size={15} aria-hidden="true" />
          Lihat lebih banyak di Instagram
          <ArrowRight size={13} aria-hidden="true" />
        </a>
      </motion.div>
    </section>
  );
}
