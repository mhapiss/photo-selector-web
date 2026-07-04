import React from 'react';
import { motion } from 'framer-motion';

type GallerySurfaceProps = {
  children: React.ReactNode;
  isViewerOpen: boolean;
};

export const GallerySurface = React.memo(({ children, isViewerOpen }: GallerySurfaceProps) => {
  return (
    <motion.main
      className="relative z-10 mx-auto w-full px-3 pb-32 pt-20 sm:px-6 sm:pt-24 lg:px-10 xl:px-14 max-w-[1600px]"
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
