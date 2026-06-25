import { useState, useEffect, useRef, useCallback } from 'react';

type LazyImageProps = {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  onLoad?: () => void;
};

const loadedImages = new Set<string>();

export function LazyImage({
  src,
  alt,
  className = '',
  aspectClass = 'aspect-square',
  onLoad,
}: LazyImageProps) {
  const [inView, setInView] = useState(
    loadedImages.has(src)
  );

  const [loaded, setLoaded] = useState(
    loadedImages.has(src)
  );

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loadedImages.has(src)) return;

    const el = ref.current;

    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '800px 0px',
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [src]);

  const handleLoad = useCallback(() => {
    loadedImages.add(src);

    setLoaded(true);

    onLoad?.();
  }, [src, onLoad]);

  const handleError = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden bg-slate-100 ${aspectClass} ${className}`}
    >
      {!loaded && (
        <div className="absolute inset-0 skeleton" />
      )}

      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          draggable={false}
          onLoad={handleLoad}
          onError={handleError}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            loaded
              ? 'opacity-100'
              : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}