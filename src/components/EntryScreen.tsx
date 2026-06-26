import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useMotionTemplate,
  type Variants,
} from 'framer-motion';
import {
  User,
  CalendarDays,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Camera,
  ImageIcon,
  CheckCircle2,
  Phone,
  Instagram,
  Heart,
  MapPin,
  ChevronDown,
  Star,
  Check,
  Gift,
  Package,
  Diamond,
  Crown,
  Aperture,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Logo } from './ui/Logo';
import { extractFolderId } from '../lib/drive';
import type { AlbumMeta } from '../types';

// ─── Brand Data ────────────────────────────────────────────────────────────────
type EntryScreenProps = { onSubmit: (meta: AlbumMeta) => void };

const BRAND = {
  name: 'RanahTepi',
  tagline: 'Bercerita Ditepian Tempat',
  services: 'Wedding · Couple Session · Engagement',
  location: 'Medan, Sumatera Utara',
  promo: 'Abadikan momen terindahmu bersama RanahTepi.',
  instagram: 'https://www.instagram.com/ranahtepi/',
  whatsApp: '6289629787600',
};

// ─── How-it-works steps ────────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    icon: FolderOpen,
    step: '01',
    title: 'Buka Album',
    desc: 'Tempel link folder Google Drive dari fotografermu untuk memuat galeri foto',
    color: 'from-violet-500/20 to-purple-500/20',
  },
  {
    icon: Camera,
    step: '02',
    title: 'Pilih Favorit',
    desc: 'Telusuri setiap foto dan tandai yang paling berkesan untukmu',
    color: 'from-sky-500/20 to-blue-500/20',
  },
  {
    icon: ArrowRight,
    step: '03',
    title: 'Kirim via WhatsApp',
    desc: 'Pilihanmu langsung terformat dan dikirim — tanpa ketik nama file, tanpa screenshot',
    color: 'from-emerald-500/20 to-teal-500/20',
  },
] as const;

// ─── Pricing Packages ──────────────────────────────────────────────────────────
type PricingPackage = {
  id: string;
  icon: typeof Package;
  category: string;
  name: string;
  price: string;
  unit: string;
  highlight: boolean;
  badge?: string;
  color: { bg: string; border: string; glow: string; accent: string };
  features: string[];
  cta: string;
};

const PACKAGES: PricingPackage[] = [
  {
    id: 'prewedding-a',
    icon: Gift,
    category: 'Prewedding',
    name: 'Paket A',
    price: '2.500.000',
    unit: 'IDR',
    highlight: false,
    color: {
      bg: 'rgba(120,60,240,0.06)',
      border: 'rgba(120,60,240,0.18)',
      glow: 'rgba(120,60,240,0.15)',
      accent: '#a78bfa',
    },
    features: [
      '1 sesi outdoor/indoor',
      '2–3 jam sesi foto',
      '30 foto edit pilihan',
      'File digital resolusi tinggi',
      'Revisi warna 1x',
    ],
    cta: 'Pesan Paket A',
  },
  {
    id: 'prewedding-b',
    icon: Package,
    category: 'Prewedding',
    name: 'Paket B',
    price: '3.500.000',
    unit: 'IDR',
    highlight: true,
    badge: 'Terpopuler',
    color: {
      bg: 'rgba(99,102,241,0.10)',
      border: 'rgba(99,102,241,0.35)',
      glow: 'rgba(99,102,241,0.25)',
      accent: '#818cf8',
    },
    features: [
      '2 lokasi outdoor/indoor',
      'Seharian penuh (up to 6 jam)',
      '50 foto edit pilihan',
      'File digital resolusi tinggi',
      'Cetak 10R 5 lembar',
      'Revisi warna 2x',
      'Mini album fisik',
    ],
    cta: 'Pesan Paket B',
  },
  {
    id: 'wedding',
    icon: Heart,
    category: 'Wedding',
    name: 'Paket Pernikahan',
    price: '5.000.000',
    unit: 'IDR',
    highlight: false,
    color: {
      bg: 'rgba(236,72,153,0.06)',
      border: 'rgba(236,72,153,0.18)',
      glow: 'rgba(236,72,153,0.15)',
      accent: '#f472b6',
    },
    features: [
      'Liputan akad & resepsi',
      '8–12 jam dokumentasi',
      '100 foto edit pilihan',
      'File digital resolusi tinggi',
      'Cetak 10R 10 lembar',
      'Highlight video 3–5 menit',
      'Album hardcover premium',
      'Revisi tidak terbatas',
    ],
    cta: 'Pesan Paket Wedding',
  },
  {
    id: 'couple',
    icon: Aperture,
    category: 'Couple Session',
    name: 'Couple Session',
    price: '1.500.000',
    unit: 'IDR',
    highlight: false,
    color: {
      bg: 'rgba(6,182,212,0.06)',
      border: 'rgba(6,182,212,0.18)',
      glow: 'rgba(6,182,212,0.15)',
      accent: '#22d3ee',
    },
    features: [
      '1 lokasi pilihan',
      '1.5–2 jam sesi foto',
      '20 foto edit pilihan',
      'File digital resolusi tinggi',
      'Konsultasi outfit gratis',
    ],
    cta: 'Pesan Couple Session',
  },
  {
    id: 'engagement',
    icon: Diamond,
    category: 'Engagement',
    name: 'Engagement',
    price: '4.000.000',
    unit: 'IDR',
    highlight: false,
    color: {
      bg: 'rgba(245,158,11,0.06)',
      border: 'rgba(245,158,11,0.18)',
      glow: 'rgba(245,158,11,0.15)',
      accent: '#fbbf24',
    },
    features: [
      'Sesi pre-engagement & hari-H',
      '4–6 jam dokumentasi',
      '60 foto edit pilihan',
      'File digital resolusi tinggi',
      'Video highlights 2–3 menit',
      'Cetak 10R 5 lembar',
    ],
    cta: 'Pesan Engagement',
  },
  {
    id: 'maternity',
    icon: Crown,
    category: 'Maternity',
    name: 'Maternity Session',
    price: '2.000.000',
    unit: 'IDR',
    highlight: false,
    color: {
      bg: 'rgba(52,211,153,0.06)',
      border: 'rgba(52,211,153,0.18)',
      glow: 'rgba(52,211,153,0.15)',
      accent: '#34d399',
    },
    features: [
      '1 sesi indoor/outdoor',
      '2–3 jam sesi foto',
      '25 foto edit pilihan',
      'File digital resolusi tinggi',
      'Konsultasi tema & outfit',
      'Props dekorasi tersedia',
    ],
    cta: 'Pesan Maternity',
  },
];

// ─── Portfolio placeholder slots ───────────────────────────────────────────────
type PortfolioSlot = {
  id: string;
  span: string;
  aspectClass: string;
  label: string;
  src?: string;
};

const PORTFOLIO_SLOTS: PortfolioSlot[] = [
  { id: 'p1', span: 'col-span-2 row-span-2', aspectClass: 'aspect-square', label: 'Wedding 01' },
  { id: 'p2', span: 'col-span-1 row-span-1', aspectClass: 'aspect-[4/3]', label: 'Prewedding 01' },
  { id: 'p3', span: 'col-span-1 row-span-1', aspectClass: 'aspect-[4/3]', label: 'Couple 01' },
  { id: 'p4', span: 'col-span-1 row-span-2', aspectClass: 'aspect-[3/4]', label: 'Portrait 01' },
  { id: 'p5', span: 'col-span-2 row-span-1', aspectClass: 'aspect-[2/1]', label: 'Wedding 02' },
  { id: 'p6', span: 'col-span-1 row-span-1', aspectClass: 'aspect-[4/3]', label: 'Engagement 01' },
];

// ─── Animation variants ────────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const formVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.25 } },
};

// ─── Floating orb particle data ────────────────────────────────────────────────
const ORBS = [
  { size: 400, top: '-12%', left: '-8%', delay: 0, duration: 16, colorIdx: 0 },
  { size: 300, top: '20%', right: '-5%', delay: 2.5, duration: 20, colorIdx: 1 },
  { size: 220, bottom: '15%', left: '3%', delay: 5, duration: 14, colorIdx: 2 },
  { size: 180, bottom: '-6%', right: '8%', delay: 1, duration: 18, colorIdx: 0 },
];
const ORB_COLORS = [
  'radial-gradient(circle, rgba(120,60,240,0.13) 0%, rgba(80,30,160,0.04) 60%, transparent 100%)',
  'radial-gradient(circle, rgba(30,80,220,0.10) 0%, rgba(10,50,160,0.03) 60%, transparent 100%)',
  'radial-gradient(circle, rgba(10,130,190,0.08) 0%, rgba(5,80,130,0.02) 60%, transparent 100%)',
];

// ─── Portfolio Image Card ──────────────────────────────────────────────────────
function PortfolioCard({ slot, index }: { slot: PortfolioSlot; index: number }) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`${slot.span} relative overflow-hidden rounded-2xl`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className={`relative w-full ${slot.aspectClass} overflow-hidden`}>
        {slot.src ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 skeleton" aria-hidden="true" />
            )}
            <motion.img
              src={slot.src}
              alt={slot.label}
              className="h-full w-full object-cover"
              style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease' }}
              onLoad={() => setLoaded(true)}
              animate={{ scale: hovered ? 1.04 : 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        ) : (
          // Placeholder slot — replace with real image via slot.src
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, rgba(${(index * 30) % 200},${50 + (index * 20) % 100},${200 - (index * 15) % 100},0.08) 0%, rgba(10,10,20,0.5) 100%)`,
              }}
            />
            <div className="relative z-10 flex flex-col items-center gap-2 opacity-30">
              <ImageIcon size={24} strokeWidth={1.5} className="text-white" aria-hidden="true" />
              <span className="text-[11px] font-medium uppercase tracking-widest text-white/60">
                {slot.label}
              </span>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 flex items-end p-4"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <span className="text-[12px] font-semibold tracking-wide text-white/80">
            {slot.label}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────
function PricingCard({ pkg, index }: { pkg: PricingPackage; index: number }) {
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

// ─── Section label component ──────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/25">
      {children}
    </p>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function EntryScreen({ onSubmit }: EntryScreenProps) {
  // ── Form state (PRESERVED) ──
  const [clientName, setClientName] = useState('');
  const [eventName, setEventName] = useState('');
  const [folderLink, setFolderLink] = useState('');
  const [linkError, setLinkError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const formSectionRef = useRef<HTMLElement>(null);

  // ── Mouse parallax (PRESERVED) ──
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 30, stiffness: 120 });
  const springY = useSpring(mouseY, { damping: 30, stiffness: 120 });
  const parallaxX1 = useTransform(springX, [-0.5, 0.5], [-18, 18]);
  const parallaxY1 = useTransform(springY, [-0.5, 0.5], [-12, 12]);
  const parallaxX2 = useTransform(springX, [-0.5, 0.5], [12, -12]);
  const parallaxY2 = useTransform(springY, [-0.5, 0.5], [8, -8]);

  // ── Scroll-driven hero parallax ──
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 600], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  // ── Derived form values (PRESERVED) ──
  const folderId = extractFolderId(folderLink);
  const linkInvalid = touched && folderLink.length > 0 && !folderId;
  const formValid = !!clientName.trim() && !!eventName.trim() && !!folderId;

  useEffect(() => {
    setIsMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // ── Form submit (PRESERVED) ──
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!folderId) {
      setLinkError('Tempel link folder Google Drive yang valid.');
      return;
    }
    if (!clientName.trim() || !eventName.trim()) return;
    onSubmit({
      clientName: clientName.trim(),
      eventName: eventName.trim(),
      folderLink: folderLink.trim(),
      folderId,
    } as AlbumMeta);
  }

  // ── Scroll to form ──
  function scrollToForm() {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ─────────────────────────────────────────────────────────────────────────────
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
        {/* ═══════════════════════════════════════════════════
             GLOBAL BACKGROUND LAYER
        ════════════════════════════════════════════════════ */}
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
          {/* Animated gradient pulse */}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'radial-gradient(ellipse 100% 40% at 50% 0%, rgba(80,30,160,0.18) 0%, transparent 70%)',
            }}
          />
          {/* Floating orbs */}
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
          {/* Dot grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
            }}
          />
        </div>

        {/* ═══════════════════════════════════════════════════
             SECTION 1 — HERO
        ════════════════════════════════════════════════════ */}
        <section
          ref={heroRef}
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
                  RanahTepi Photography
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
                  onClick={scrollToForm}
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
              <motion.div
                variants={itemVariants}
                className="mt-3 flex items-center gap-5"
              >
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
              onClick={scrollToForm}
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              aria-label="Scroll ke bawah"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">Scroll</span>
              <ChevronDown size={16} aria-hidden="true" />
            </motion.button>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════
             SECTION 2 — PHOTO SELECTOR (Returning Clients)
        ════════════════════════════════════════════════════ */}
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
              {/* Section header */}
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

              {/* Two-column layout: how-to + form */}
              <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_440px] lg:gap-10">
                {/* How it works */}
                <motion.div variants={itemVariants} className="order-2 lg:order-1" aria-label="Cara kerja Photo Selector">
                  <SectionLabel>Cara Kerja</SectionLabel>

                  <ol className="mt-5 flex flex-col gap-3" role="list">
                    {HOW_STEPS.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.li
                          key={item.step}
                          className="group relative overflow-hidden rounded-2xl p-4 sm:p-5"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            backdropFilter: 'blur(12px)',
                          }}
                          initial={{ opacity: 0, x: -24 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{
                            background: 'rgba(255,255,255,0.055)',
                            scale: 1.01,
                            transition: { duration: 0.2 },
                          }}
                        >
                          <div
                            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                            aria-hidden="true"
                          />
                          <div className="relative flex items-start gap-4">
                            <div
                              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.08)',
                              }}
                              aria-hidden="true"
                            >
                              <Icon size={17} className="text-white/60" strokeWidth={1.8} />
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5">
                              <div className="mb-1 flex items-center gap-2.5">
                                <span
                                  className="font-mono text-[10px] font-semibold tracking-widest"
                                  style={{ color: 'rgba(160,130,255,0.7)' }}
                                  aria-hidden="true"
                                >
                                  {item.step}
                                </span>
                                <h3 className="text-[13px] font-semibold text-white/85 sm:text-sm">
                                  {item.title}
                                </h3>
                              </div>
                              <p className="text-[12px] leading-relaxed text-white/40 sm:text-[13px]">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ol>

                  <motion.p
                    className="mt-5 flex w-fit items-center gap-2 rounded-full px-4 py-2.5"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                  >
                    <ImageIcon size={12} className="text-white/30" strokeWidth={1.8} aria-hidden="true" />
                    <span className="text-[11px] text-white/30 sm:text-[12px]">
                      Dipercaya fotografer di seluruh Indonesia
                    </span>
                  </motion.p>
                </motion.div>

                {/* ── FORM (business logic PRESERVED) ── */}
                <motion.div className="order-1 lg:order-2" variants={formVariants}>
                  <motion.form
                    onSubmit={handleSubmit}
                    aria-label="Formulir detail album foto"
                    className="relative overflow-hidden rounded-3xl p-5 sm:p-8"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      backdropFilter: 'blur(24px)',
                      boxShadow:
                        '0 4px 24px rgba(0,0,0,0.4), 0 24px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}
                    whileHover={{
                      boxShadow:
                        '0 4px 24px rgba(0,0,0,0.5), 0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
                      transition: { duration: 0.3 },
                    }}
                  >
                    <div
                      className="pointer-events-none absolute left-0 right-0 top-0 h-px"
                      aria-hidden="true"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                      }}
                    />

                    <div className="mb-6 flex items-center gap-3 sm:mb-7">
                      <motion.div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(140,60,240,0.4) 0%, rgba(80,120,230,0.3) 100%)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: '0 0 12px rgba(120,40,200,0.3)',
                        }}
                        animate={{
                          boxShadow: [
                            '0 0 12px rgba(120,40,200,0.3)',
                            '0 0 22px rgba(120,40,200,0.55)',
                            '0 0 12px rgba(120,40,200,0.3)',
                          ],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        aria-hidden="true"
                      >
                        <Sparkles size={14} className="text-white/80" strokeWidth={2} />
                      </motion.div>
                      <div>
                        <h2 className="text-[14px] font-semibold tracking-tight text-white/90 sm:text-[15px]">
                          Detail Album
                        </h2>
                        <p className="text-[11px] text-white/35">Isi info berikut untuk memulai</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="group relative">
                        <Input
                          label="Nama Klien"
                          leftIcon={
                            <User size={16} className="text-white/40 transition-colors group-focus-within:text-white/70" aria-hidden="true" />
                          }
                          placeholder="Nama Client"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          autoComplete="name"
                          maxLength={60}
                        />
                      </div>

                      <div className="group relative">
                        <Input
                          label="Nama Acara"
                          leftIcon={
                            <CalendarDays size={16} className="text-white/40 transition-colors group-focus-within:text-white/70" aria-hidden="true" />
                          }
                          placeholder="Nama Acara & Tanggal"
                          value={eventName}
                          onChange={(e) => setEventName(e.target.value)}
                          maxLength={80}
                        />
                      </div>

                      <div className="group relative">
                        <Input
                          label="Link Folder Google Drive"
                          leftIcon={
                            <FolderOpen size={16} className="text-white/40 transition-colors group-focus-within:text-white/70" aria-hidden="true" />
                          }
                          placeholder="Link Google Drive"
                          value={folderLink}
                          onChange={(e) => {
                            setFolderLink(e.target.value);
                            if (linkError) setLinkError('');
                          }}
                          onBlur={() => setTouched(true)}
                          error={
                            linkInvalid
                              ? linkError || 'Tempel link folder Google Drive yang valid.'
                              : undefined
                          }
                          hint={
                            !linkInvalid
                              ? 'Tempel link "Bagikan" dari folder Google Drive-mu.'
                              : undefined
                          }
                          inputMode="url"
                          autoComplete="url"
                        />
                        <AnimatePresence>
                          {folderId && !linkInvalid && (
                            <motion.div
                              className="mt-2 flex items-center gap-1.5"
                              role="status"
                              aria-live="polite"
                              initial={{ opacity: 0, y: -6, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -6, height: 0 }}
                              transition={{ duration: 0.25, ease: 'easeOut' }}
                            >
                              <CheckCircle2 size={13} className="text-emerald-400" aria-hidden="true" />
                              <span className="text-[12px] font-medium text-emerald-400">
                                Folder terdeteksi — siap dibuka
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <motion.div className="mt-5 sm:mt-6" whileTap={{ scale: 0.985 }}>
                      <Button
                        type="submit"
                        size="lg"
                        fullWidth
                        rightIcon={
                          <motion.span
                            aria-hidden="true"
                            animate={formValid ? { x: [0, 3, 0] } : {}}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            <ArrowRight size={18} strokeWidth={2} />
                          </motion.span>
                        }
                        disabled={!formValid}
                      >
                        Buka Album
                      </Button>
                    </motion.div>

                    <motion.p
                      className="mt-4 flex items-center justify-center gap-1.5 sm:mt-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <ShieldCheck size={13} className="text-white/20" strokeWidth={1.8} aria-hidden="true" />
                      <span className="text-[11px] text-white/20">
                        Link-mu hanya digunakan untuk memuat pratinjau foto.
                      </span>
                    </motion.p>

                    <div
                      className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
                      aria-hidden="true"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                      }}
                    />
                  </motion.form>
                </motion.div>
              </div>
            </motion.div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════
             SECTION 3 — PORTFOLIO BENTO GRID
        ════════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════
             SECTION 4 — PRICING
        ════════════════════════════════════════════════════ */}
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
              Pilih paket yang sesuai dengan kebutuhanmu. Semua harga transparan tanpa biaya
              tersembunyi.
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
              Setiap cerita itu unik. Hubungi kami dan kami akan merancang paket yang sempurna
              untukmu.
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

        {/* ═══════════════════════════════════════════════════
             SECTION 5 — PHOTOGRAPHER CARD / FOOTER CTA
        ════════════════════════════════════════════════════ */}
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
      </div>
    </>
  );
}