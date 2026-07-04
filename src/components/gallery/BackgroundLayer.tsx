import React from 'react';

/**
 * Gallery background — warm off-white, very subtle.
 * The photos are the visual product; this stays invisible.
 */
export const BackgroundLayer = React.memo(() => {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ background: 'var(--color-background)' }}
    >
      {/* Soft noise texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.35] mix-blend-multiply dark:mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  );
});

BackgroundLayer.displayName = 'BackgroundLayer';
