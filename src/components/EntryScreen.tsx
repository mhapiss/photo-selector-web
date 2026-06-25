import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
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
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Logo } from './ui/Logo';
import { extractFolderId } from '../lib/drive';
import type { AlbumMeta } from '../types';

type EntryScreenProps = {
  onSubmit: (meta: AlbumMeta) => void;
};

const RANAH_TEPI = {
  name: 'RanahTepi',
  whatsApp: '6289629787600',
  description: 'Bercerita Ditepian Tempat',
  services: 'Wedding • Couple Session • Engagement',
  location: '📍 Medan, Sumatera Utara',
  promo: '✨ Abadikan momen terindahmu bersama RanahTepi.',
  instagram: 'https://www.instagram.com/ranahtepi/',
};

const STEPS = [
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

type Particle = {
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay: number;
  duration: number;
};

const FLOAT_PARTICLES: Particle[] = [
  { size: 280, top: '-8%', left: '-6%', delay: 0, duration: 14 },
  { size: 200, top: '15%', right: '-4%', delay: 2, duration: 18 },
  { size: 160, bottom: '20%', left: '5%', delay: 4, duration: 12 },
  { size: 120, bottom: '-5%', right: '10%', delay: 1, duration: 16 },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const formVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: 'easeOut', delay: 0.3 },
  },
};

export function EntryScreen({ onSubmit }: EntryScreenProps) {
  const [clientName, setClientName] = useState('');
  const [eventName, setEventName] = useState('');
  const [folderLink, setFolderLink] = useState('');
  const [linkError, setLinkError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 30, stiffness: 120 });
  const springY = useSpring(mouseY, { damping: 30, stiffness: 120 });

  const parallaxX1 = useTransform(springX, [-0.5, 0.5], [-18, 18]);
  const parallaxY1 = useTransform(springY, [-0.5, 0.5], [-12, 12]);
  const parallaxX2 = useTransform(springX, [-0.5, 0.5], [12, -12]);
  const parallaxY2 = useTransform(springY, [-0.5, 0.5], [8, -8]);

  const folderId = extractFolderId(folderLink);
  const linkInvalid = touched && folderLink.length > 0 && !folderId;
  const formValid = !!clientName.trim() && !!eventName.trim() && !!folderId;

  useEffect(() => {
    setIsMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);

    if (!folderId) {
      setLinkError('Tempel link folder Google Drive yang valid.');
      return;
    }

    if (!clientName.trim() || !eventName.trim()) return;

    // SESUAIKAN DENGAN TYPE AlbumMeta DI ../types
    // Jika AlbumMeta memang punya key: clientName, eventName, folderLink, folderId
    // maka ini sudah aman. Kalau beda, ubah key-nya persis sesuai type kamu.
    onSubmit({
      clientName: clientName.trim(),
      eventName: eventName.trim(),
      folderLink: folderLink.trim(),
      folderId,
    } as AlbumMeta);
  }

  return (
    <>
      {isMounted && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Photo Selector — Pilih Foto Terbaikmu',
              description:
                'Aplikasi pemilihan foto profesional untuk klien fotografer. Buka album Google Drive, pilih foto favoritmu, dan kirim langsung ke WhatsApp fotografermu — tanpa screenshot, tanpa ketik nama file.',
              applicationCategory: 'PhotographyApplication',
              inLanguage: 'id-ID',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
            }),
          }}
        />
      )}

      <div
        ref={containerRef}
        className="relative min-h-[100dvh] w-full overflow-x-hidden"
        style={{
          background:
            'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 30%, #0a0f1a 60%, #060a10 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(120,40,200,0.25) 0%, transparent 60%),' +
                'radial-gradient(ellipse 60% 40% at 80% 10%, rgba(30,80,200,0.18) 0%, transparent 55%),' +
                'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(10,100,160,0.15) 0%, transparent 60%)',
            }}
          />
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background:
                'radial-gradient(ellipse 100% 40% at 50% 0%, rgba(80,30,160,0.2) 0%, transparent 70%)',
            }}
          />
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.2, 0.5, 0.2], x: [0, 30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            style={{
              background:
                'radial-gradient(ellipse 80% 30% at 70% 20%, rgba(20,80,200,0.15) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {FLOAT_PARTICLES.map((p, i) => {
            const orbStyle = {
              width: p.size,
              height: p.size,
              top: p.top,
              left: p.left,
              right: p.right,
              bottom: p.bottom,
              background:
                i % 3 === 0
                  ? 'radial-gradient(circle, rgba(120,60,220,0.12) 0%, rgba(80,30,160,0.04) 60%, transparent 100%)'
                  : i % 3 === 1
                  ? 'radial-gradient(circle, rgba(30,80,200,0.1) 0%, rgba(10,50,150,0.03) 60%, transparent 100%)'
                  : 'radial-gradient(circle, rgba(10,120,180,0.08) 0%, rgba(5,80,130,0.02) 60%, transparent 100%)',
              border: '1px solid rgba(255,255,255,0.04)',
              backdropFilter: 'blur(1px)',
            };

            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  ...orbStyle,
                  x: i % 2 === 0 ? parallaxX1 : parallaxX2,
                  y: i % 2 === 0 ? parallaxY1 : parallaxY2,
                }}
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: [1, 1.04, 1],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: p.delay,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage:
              'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          }}
        />

        <main
          className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[1100px] flex-col items-center justify-start px-4 pb-24 pt-14 sm:px-6 sm:pt-16 lg:px-8"
          role="main"
        >
          {isMounted && (
            <motion.div
              className="w-full"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={itemVariants}
                className="mb-12 flex flex-col items-center gap-4 text-center sm:mb-16"
              >
                <motion.div
                  className="group relative flex h-[60px] w-[60px] items-center justify-center rounded-[18px] sm:h-16 sm:w-16 sm:rounded-2xl"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(140,60,240,0.3) 0%, rgba(60,100,230,0.2) 100%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow:
                      '0 8px 32px rgba(100,40,200,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  aria-hidden="true"
                >
                  <Logo size={34} />
                  <div
                    className="absolute inset-0 rounded-[18px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-2xl"
                    style={{
                      background:
                        'radial-gradient(circle at center, rgba(140,60,240,0.15), transparent)',
                    }}
                  />
                </motion.div>

                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/30 sm:text-xs">
                  Pemilihan Foto Profesional
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-5 text-center sm:mb-6">
                <h1
                  className="mx-auto max-w-3xl bg-clip-text text-transparent"
                  style={{
                    fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                    backgroundImage:
                      'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(200,180,255,0.9) 40%, rgba(130,170,255,0.85) 80%, rgba(80,200,230,0.8) 100%)',
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
                </h1>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-12 text-center sm:mb-16">
                <p
                  className="mx-auto max-w-lg leading-relaxed text-white/50"
                  style={{ fontSize: 'clamp(0.9375rem, 1.8vw, 1.125rem)' }}
                >
                  Buka album dari fotografermu, pilih foto yang kamu suka, lalu kirim
                  pilihanmu langsung ke WhatsApp — tanpa screenshot, tanpa repot ketik nama
                  file satu per satu.
                </p>
              </motion.div>

              <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px] lg:gap-10">
                <motion.section
                  variants={itemVariants}
                  className="order-2 lg:order-1"
                  aria-label="Cara kerja Photo Selector"
                >
                  <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/25">
                    Cara Kerja
                  </p>

                  <ol className="flex flex-col gap-3" role="list">
                    {STEPS.map((item, index) => {
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
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.5 + index * 0.1,
                            duration: 0.5,
                            ease: 'easeOut',
                          }}
                          whileHover={{
                            background: 'rgba(255,255,255,0.055)',
                            borderColor: 'rgba(255,255,255,0.12)',
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
                              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
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
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <ImageIcon
                      size={12}
                      className="text-white/30"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <span className="text-[11px] text-white/30 sm:text-[12px]">
                      Dipercaya fotografer di seluruh Indonesia
                    </span>
                  </motion.p>
                </motion.section>

                <motion.div className="order-1 lg:order-2" variants={formVariants}>
                  <motion.form
                    onSubmit={handleSubmit}
                    aria-label="Formulir detail album foto"
                    className="relative overflow-hidden rounded-3xl p-5 sm:p-8"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
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
                        background:
                          'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                      }}
                    />

                    <div className="mb-6 flex items-center gap-3 sm:mb-7">
                      <motion.div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(140,60,240,0.4) 0%, rgba(80,120,230,0.3) 100%)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: '0 0 12px rgba(120,40,200,0.3)',
                        }}
                        animate={{
                          boxShadow: [
                            '0 0 12px rgba(120,40,200,0.3)',
                            '0 0 20px rgba(120,40,200,0.5)',
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
                            <User
                              size={16}
                              className="text-white/40 transition-colors group-focus-within:text-white/70"
                              aria-hidden="true"
                            />
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
                            <CalendarDays
                              size={16}
                              className="text-white/40 transition-colors group-focus-within:text-white/70"
                              aria-hidden="true"
                            />
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
                            <FolderOpen
                              size={16}
                              className="text-white/40 transition-colors group-focus-within:text-white/70"
                              aria-hidden="true"
                            />
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
                              <CheckCircle2
                                size={13}
                                className="text-emerald-400"
                                aria-hidden="true"
                              />
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
                      <ShieldCheck
                        size={13}
                        className="text-white/20"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      <span className="text-[11px] text-white/20">
                        Link-mu hanya digunakan untuk memuat pratinjau foto.
                      </span>
                    </motion.p>

                    <div
                      className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
                      aria-hidden="true"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                      }}
                    />
                  </motion.form>
                </motion.div>
              </div>

              <motion.div
                className="mt-12 w-full rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-blue-500/10 p-6 backdrop-blur-sm sm:p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 border-violet-500/30 bg-violet-500/20">
                    <Camera size={28} className="text-violet-300" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white/90">{RANAH_TEPI.name}</h3>
                    <p className="text-sm text-white/60">{RANAH_TEPI.description}</p>
                    <p className="text-sm font-medium text-white/50">{RANAH_TEPI.services}</p>
                    <p className="text-sm text-white/40">{RANAH_TEPI.location}</p>
                    <p className="mt-2 text-sm text-white/60">{RANAH_TEPI.promo}</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href={`https://wa.me/${RANAH_TEPI.whatsApp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500/20 px-6 py-2.5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/30"
                    >
                      <Phone size={18} /> WhatsApp
                    </a>

                    <a
                      href={RANAH_TEPI.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 px-6 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/10"
                    >
                      <Instagram size={18} /> Instagram
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}