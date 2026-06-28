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
      <div className="mb-16 h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

      <motion.div
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-blue-500/10 p-8 backdrop-blur-sm sm:p-10"
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
              background: 'linear-gradient(135deg, rgba(120,60,240,0.3), rgba(60,100,230,0.2))',
              border: '2px solid rgba(139,92,246,0.35)',
              boxShadow: '0 0 32px rgba(139,92,246,0.25)',
            }}
            aria-hidden="true"
          >
            <Camera size={32} style={{ color: '#a78bfa' }} strokeWidth={1.6} />
            {/* Online indicator */}
            <span
              className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-[#080810] bg-emerald-400"
              aria-label="Online"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white/90">{BRAND.name}</h2>
            <p className="mt-0.5 text-sm font-medium text-white/50">{BRAND.tagline}</p>
            <p className="mt-1 text-sm text-white/40">{BRAND.services}</p>
            <div className="mt-2 flex items-center justify-center gap-1.5 sm:justify-start">
              <MapPin size={12} className="text-white/25" aria-hidden="true" />
              <span className="text-[12px] text-white/30">{BRAND.location}</span>
            </div>
            <p className="mt-3 text-sm text-white/55">{BRAND.promo}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`https://wa.me/${BRAND.whatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[13px] font-semibold text-black transition-all duration-200 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                boxShadow: '0 4px 20px rgba(74,222,128,0.3)',
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
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-[13px] font-medium text-white/55 transition-all duration-200 hover:bg-white/[0.09] hover:text-white/75"
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
        className="mt-8 text-center text-[11px] text-white/15"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        © {new Date().getFullYear()} RanahTepi Photography · Medan, Sumatera Utara ·{' '}
        <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/30">
          Instagram
        </a>
      </motion.p>
    </section>
  );
}
