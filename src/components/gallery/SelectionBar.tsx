import { motion } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';

type SelectionBarProps = {
  count: number;
  onReview: () => void;
  onClear: () => void;
};

export function SelectionBar({ count, onReview, onClear }: SelectionBarProps) {
  if (count === 0) return null;

  return (
    <div
      className="relative w-full max-w-sm overflow-hidden rounded-[20px] bg-card/90 border border-border"
      style={{
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 8px 32px -4px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05) inset',
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Count badge */}
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary"
          style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.10) inset' }}
        >
          <Check size={15} strokeWidth={2.5} className="text-white" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <motion.p
            key={count}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="text-[13px] font-semibold text-ink leading-tight"
          >
            {count} foto dipilih
          </motion.p>
          <button
            onClick={onClear}
            className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted hover:text-ink transition-colors focus:outline-none"
          >
            <X size={9} strokeWidth={2.5} />
            Hapus semua
          </button>
        </div>

        {/* Review CTA */}
        <motion.button
          onClick={onReview}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-[13px] font-semibold text-white transition-all duration-200 shadow-sm hover:brightness-105 active:brightness-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
          style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset' }}
          aria-label={`Tinjau ${count} foto`}
        >
          <span className="hidden sm:block">Tinjau</span>
          <ArrowRight size={14} strokeWidth={2} />
        </motion.button>
      </div>
    </div>
  );
}
