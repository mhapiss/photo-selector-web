import { motion } from 'framer-motion';
import { Star, Check, Phone } from 'lucide-react';
import { BRAND, type PricingPackage } from '../../config/constants';

export function PricingCard({ pkg, index }: { pkg: PricingPackage; index: number }) {
  const Icon = pkg.icon;
  const waLink = `https://wa.me/${BRAND.whatsApp}?text=${encodeURIComponent(`Halo RanahTepi! Saya ingin memesan ${pkg.category} — ${pkg.name} (IDR ${pkg.price}). Boleh info lebih lanjut?`)}`;

  return (
    <motion.div
      className="relative flex flex-col overflow-hidden rounded-3xl p-6 sm:p-7"
      style={{
        background: pkg.highlight
          ? `linear-gradient(135deg, ${pkg.color.bg}, rgba(99,102,241,0.12))`
          : pkg.color.bg,
        border: `1px solid ${pkg.color.border}`,
        boxShadow: pkg.highlight
          ? `0 0 48px ${pkg.color.glow}, 0 8px 32px rgba(0,0,0,0.4)`
          : `0 4px 24px rgba(0,0,0,0.25)`,
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -4,
        boxShadow: `0 0 64px ${pkg.color.glow}, 0 16px 48px rgba(0,0,0,0.4)`,
        borderColor: pkg.color.accent + '55',
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
    >
      {/* Top shimmer line */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-px"
        aria-hidden="true"
        style={{
          background: `linear-gradient(90deg, transparent, ${pkg.color.accent}40, transparent)`,
        }}
      />

      {/* Popular badge */}
      {pkg.badge && (
        <div
          className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
          style={{
            background: `linear-gradient(135deg, ${pkg.color.accent}30, ${pkg.color.accent}15)`,
            border: `1px solid ${pkg.color.accent}40`,
            color: pkg.color.accent,
          }}
        >
          <Star size={9} fill="currentColor" aria-hidden="true" />
          {pkg.badge}
        </div>
      )}

      {/* Header */}
      <div className="mb-5 flex items-start gap-4">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: `${pkg.color.accent}18`,
            border: `1px solid ${pkg.color.accent}30`,
          }}
          aria-hidden="true"
        >
          <Icon size={20} style={{ color: pkg.color.accent }} strokeWidth={1.8} />
        </div>
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: pkg.color.accent + 'bb' }}
          >
            {pkg.category}
          </p>
          <h3 className="text-[15px] font-bold text-white/90">{pkg.name}</h3>
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-semibold text-white/40">IDR</span>
          <span
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: pkg.highlight ? pkg.color.accent : 'rgba(255,255,255,0.9)' }}
          >
            {pkg.price}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-white/30">Harga sudah termasuk pajak</p>
      </div>

      {/* Features */}
      <ul className="mb-6 flex flex-col gap-2.5" role="list">
        {pkg.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5">
            <Check
              size={13}
              className="mt-0.5 flex-shrink-0"
              style={{ color: pkg.color.accent }}
              aria-hidden="true"
            />
            <span className="text-[13px] leading-snug text-white/55">{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-semibold transition-all duration-200 active:scale-[0.97]"
        style={{
          background: pkg.highlight
            ? `linear-gradient(135deg, ${pkg.color.accent}, ${pkg.color.accent}cc)`
            : `${pkg.color.accent}15`,
          color: pkg.highlight ? '#000' : pkg.color.accent,
          border: `1px solid ${pkg.color.accent}30`,
        }}
        aria-label={`${pkg.cta} via WhatsApp`}
      >
        <Phone size={14} aria-hidden="true" />
        {pkg.cta}
      </a>
    </motion.div>
  );
}
