import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundLayer = React.memo(() => {
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#050508]">
      {/* Aurora Mesh / Blob Gradient */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] rounded-full bg-[#3b1d6e] blur-[120px] mix-blend-screen"
        animate={{
          x: prefersReducedMotion ? 0 : [0, 150, -100, 0],
          y: prefersReducedMotion ? 0 : [0, -100, 150, 0],
          scale: prefersReducedMotion ? 1 : [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{ opacity: 0.6 }}
      />
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 w-[150%] h-[150%] rounded-full bg-[#1d4b6e] blur-[100px] mix-blend-screen"
        animate={{
          x: prefersReducedMotion ? 0 : [0, -120, 80, 0],
          y: prefersReducedMotion ? 0 : [0, 120, -80, 0],
          scale: prefersReducedMotion ? 1 : [1, 0.8, 1.3, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{ opacity: 0.4 }}
      />

      {/* Depth Fog / Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_#050508_90%)]" />

      {/* Soft Noise Texture (Data URI) */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />
    </div>
  );
});
