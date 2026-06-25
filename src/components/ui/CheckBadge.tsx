import { Check } from 'lucide-react';

type CheckBadgeProps = {
  selected: boolean;
  /** index in selection order, to show the pick sequence number */
  index?: number | null;
  size?: number;
};

/**
 * Selection indicator overlay for photo cards. Shows a numbered circle when
 * selected (with a check-pop animation) and a hollow ring otherwise.
 */
export function CheckBadge({ selected, index, size = 28 }: CheckBadgeProps) {
  if (!selected) {
    return (
      <span
        aria-hidden
        className="absolute right-2 top-2 grid place-items-center rounded-full border-2 border-white/80 bg-black/20 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="absolute right-2 top-2 grid place-items-center rounded-full bg-primary text-white shadow-md animate-check-pop"
      style={{ width: size, height: size }}
    >
      {typeof index === 'number' ? (
        <span className="text-[11px] font-bold leading-none">{index + 1}</span>
      ) : (
        <Check size={16} strokeWidth={3.5} />
      )}
    </span>
  );
}
