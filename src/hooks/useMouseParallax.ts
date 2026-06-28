import { useEffect } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

export function useMouseParallax(containerRef: React.RefObject<HTMLDivElement>) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 30, stiffness: 120 });
  const springY = useSpring(mouseY, { damping: 30, stiffness: 120 });

  const parallaxX1 = useTransform(springX, [-0.5, 0.5], [-18, 18]);
  const parallaxY1 = useTransform(springY, [-0.5, 0.5], [-12, 12]);
  const parallaxX2 = useTransform(springX, [-0.5, 0.5], [12, -12]);
  const parallaxY2 = useTransform(springY, [-0.5, 0.5], [8, -8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, containerRef]);

  return {
    parallaxX1,
    parallaxY1,
    parallaxX2,
    parallaxY2,
  };
}
