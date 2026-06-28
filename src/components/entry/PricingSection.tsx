import { motion } from 'framer-motion';
import { Sparkles, Phone } from 'lucide-react';
import { BRAND, PACKAGES } from '../../config/constants';
import { fadeUp } from '../../utils/animations';
import { SectionLabel } from './SectionLabel';
import { PricingCard } from './PricingCard';

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pb-28 pt-4 sm:px-6 lg:px-8"
      aria-label="Paket Harga"
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
        <SectionLabel>Paket Harga</SectionLabel>
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
          Investasi untuk
          <br />
          kenangan seumur hidup.
        </h2>
        <p className="mx-auto max-w-md text-[14px] leading-relaxed text-white/40">
          Pilih paket yang sesuai dengan kebutuhanmu. Semua harga transparan tanpa biaya tersembunyi.
        </p>
      </motion.div>

      {/* Pricing grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {PACKAGES.map((pkg, index) => (
          <PricingCard key={pkg.id} pkg={pkg} index={index} />
        ))}
      </div>

      {/* Custom package note */}
      <motion.div
        className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 text-center backdrop-blur-sm"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}
          aria-hidden="true"
        >
          <Sparkles size={20} style={{ color: '#a78bfa' }} strokeWidth={1.8} />
        </div>
        <h3 className="text-[16px] font-bold text-white/85">Butuh paket custom?</h3>
        <p className="max-w-sm text-[13px] leading-relaxed text-white/40">
          Setiap cerita itu unik. Hubungi kami dan kami akan merancang paket yang sempurna untukmu.
        </p>
        <a
          href={`https://wa.me/${BRAND.whatsApp}?text=${encodeURIComponent('Halo RanahTepi! Saya ingin diskusi paket foto custom.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[13px] font-semibold text-black transition-all duration-200 active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
            boxShadow: '0 4px 20px rgba(139,92,246,0.35)',
          }}
          aria-label="Diskusi paket custom via WhatsApp"
        >
          <Phone size={13} aria-hidden="true" />
          Diskusi via WhatsApp
        </a>
      </motion.div>
    </section>
  );
}
