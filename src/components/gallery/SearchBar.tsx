import { Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type SearchBarProps = {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
};

export function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div className="relative w-full" role="search" aria-label="Pencarian foto">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dim"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cari foto..."
          aria-label="Cari foto"
          className={[
            'w-full h-10 rounded-xl',
            'bg-surface border border-border',
            'text-[14px] text-ink placeholder:text-dim',
            'pl-10 pr-10',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            value ? 'border-border' : 'border-border',
          ].join(' ')}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              type="button"
              aria-label="Hapus pencarian"
              onClick={() => onChange('')}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-dim/20 text-muted hover:bg-dim/30 hover:text-ink transition-colors"
            >
              <X size={11} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {value && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-2 px-1 text-[12px] text-muted"
          >
            {resultCount} hasil ditemukan
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
