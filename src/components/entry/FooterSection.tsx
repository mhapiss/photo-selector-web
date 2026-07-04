import { motion } from 'framer-motion';
import { Camera, MapPin, Phone, Instagram } from 'lucide-react';
import { BRAND } from '../../config/constants';

export function FooterSection() {
  return (
    <section
      id="contact"
      className="relative z-10 mx-auto w-full max-w-[1100px] px-4 pb-20 pt-4 sm:px-6 lg:px-8"
      aria-label="Kontak RanahTepi"
    >
      {/* Divider */}
      <div className="mb-16 h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--color-border), transparent)' }} />

      <motion.div
        className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-8 shadow-card backdrop-blur-xl sm:p-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Top shimmer */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 h-px"
          aria-hidden="true"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
        />

        <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
          {/* Avatar placeholder */}
          <div
            className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(255,107,138,0.18), rgba(141,217,255,0.22))',
              border: '2px solid var(--color-border)',
              boxShadow: '0 18px 42px rgba(229,169,61,0.12)',
            }}
            aria-hidden="true"
          >
            <Camera size={32} style={{ color: 'var(--color-primary)' }} strokeWidth={1.6} />
            {/* Online indicator */}
            <span
              className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-400"
              aria-label="Online"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-ink/88">{BRAND.name}</h2>
            <p className="mt-0.5 text-sm font-semibold text-ink/55">{BRAND.tagline}</p>
            <p className="mt-1 text-sm text-ink/48">{BRAND.services}</p>
            <div className="mt-2 flex items-center justify-center gap-1.5 sm:justify-start">
              <MapPin size={12} className="text-primary-500/65" aria-hidden="true" />
              <span className="text-[12px] font-medium text-ink/45">{BRAND.location}</span>
            </div>
            <p className="mt-3 text-sm text-ink/58">{BRAND.promo}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`https://wa.me/${BRAND.whatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold text-white transition-all duration-200 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #E5A93D, #F2BA54)',
                boxShadow: '0 14px 30px rgba(229,169,61,0.20)',
              }}
              aria-label="Hubungi via WhatsApp"
            >
              <Phone size={14} aria-hidden="true" />
              WhatsApp
            </a>

            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-[13px] font-bold text-ink/60 shadow-soft transition-all duration-200 hover:bg-card hover:text-ink"
              aria-label="Ikuti di Instagram"
            >
              <Instagram size={14} aria-hidden="true" />
              Instagram
            </a>
          </div>
        </div>
      </motion.div>

      {/* Footer note */}
      <motion.p
        className="mt-8 text-center text-[11px] font-medium text-ink/35"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        © {new Date().getFullYear()} RanahTepi Photography · Medan, Sumatera Utara ·{' '}
        <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink/60">
          Instagram
        </a>
      </motion.p>
    </section>
  );
}
