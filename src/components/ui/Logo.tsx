import { Images } from 'lucide-react';

export function Logo({ size = 40 }: { size?: number }) {
  const r = Math.round(size * 0.22);
  return (
    <div
      className="relative grid place-items-center bg-primary"
      style={{
        width: size,
        height: size,
        borderRadius: r,
        boxShadow: '0 1px 0 rgba(255,255,255,0.10) inset',
      }}
    >
      <Images
        size={Math.round(size * 0.48)}
        strokeWidth={2}
        className="text-white"
      />
      <span
        className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background bg-success"
        style={{ width: Math.round(size * 0.28), height: Math.round(size * 0.28) }}
      />
    </div>
  );
}
