import {
  FolderOpen,
  Camera,
  ArrowRight,
  Gift,
  Package,
  Heart,
  Aperture,
  Diamond,
  Crown,
} from 'lucide-react';

export const BRAND = {
  name: 'RanahTepi',
  tagline: 'Bercerita Ditepian Tempat',
  services: 'Wedding · Couple Session · Engagement',
  location: 'Medan, Sumatera Utara',
  promo: 'Abadikan momen terindahmu bersama RanahTepi.',
  instagram: 'https://www.instagram.com/ranahtepi/',
  whatsApp: '6289629787600',
};

export const HOW_STEPS = [
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

import type { ComponentType, CSSProperties } from 'react';

export type PricingPackage = {
  id: string;
  icon: ComponentType<{ size?: number | string; className?: string; style?: CSSProperties; strokeWidth?: number | string; color?: string }>;
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

export const PACKAGES: PricingPackage[] = [
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

export type PortfolioSlot = {
  id: string;
  span: string;
  aspectClass: string;
  label: string;
  src?: string;
};

export const PORTFOLIO_SLOTS: PortfolioSlot[] = [
  { id: 'p1', span: 'col-span-2 row-span-2', aspectClass: 'aspect-square', label: 'Wedding 01' },
  { id: 'p2', span: 'col-span-1 row-span-1', aspectClass: 'aspect-[4/3]', label: 'Prewedding 01' },
  { id: 'p3', span: 'col-span-1 row-span-1', aspectClass: 'aspect-[4/3]', label: 'Couple 01' },
  { id: 'p4', span: 'col-span-1 row-span-2', aspectClass: 'aspect-[3/4]', label: 'Portrait 01' },
  { id: 'p5', span: 'col-span-2 row-span-1', aspectClass: 'aspect-[2/1]', label: 'Wedding 02' },
  { id: 'p6', span: 'col-span-1 row-span-1', aspectClass: 'aspect-[4/3]', label: 'Engagement 01' },
];

export const ORBS = [
  { size: 400, top: '-12%', left: '-8%', delay: 0, duration: 16, colorIdx: 0 },
  { size: 300, top: '20%', right: '-5%', delay: 2.5, duration: 20, colorIdx: 1 },
  { size: 220, bottom: '15%', left: '3%', delay: 5, duration: 14, colorIdx: 2 },
  { size: 180, bottom: '-6%', right: '8%', delay: 1, duration: 18, colorIdx: 0 },
];

export const ORB_COLORS = [
  'radial-gradient(circle, rgba(120,60,240,0.13) 0%, rgba(80,30,160,0.04) 60%, transparent 100%)',
  'radial-gradient(circle, rgba(30,80,220,0.10) 0%, rgba(10,50,160,0.03) 60%, transparent 100%)',
  'radial-gradient(circle, rgba(10,130,190,0.08) 0%, rgba(5,80,130,0.02) 60%, transparent 100%)',
];
