import React from 'react';
import { motion } from 'framer-motion';

type GallerySurfaceProps = {
  children: React.ReactNode;
  isViewerOpen: boolean;
};

export const GallerySurface = React.memo(({ children, isViewerOpen }: GallerySurfaceProps) => {
  return (
    <motion.main
      className="relative z-10 mx-auto w-full px-4 sm:px-8 lg:px-12 xl:px-16 pb-32 pt-24 max-w-[1600px]"
      animate={{
        scale: isViewerOpen ? 0.96 : 1,
        filter: isViewerOpen ? 'brightness(0.7) blur(12px)' : 'brightness(1) blur(0px)',
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.main>
  );
});
