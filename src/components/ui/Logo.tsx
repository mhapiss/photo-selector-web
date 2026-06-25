import { Images } from 'lucide-react';

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative grid place-items-center rounded-2xl bg-primary text-white shadow-card"
      style={{ width: size, height: size }}
    >
      <Images size={size * 0.5} strokeWidth={2.2} />
      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
    </div>
  );
}
