import { Search, X } from 'lucide-react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';

type SearchBarProps = {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
};

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: 'easeOut',
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
};

export function SearchBar({
  value,
  onChange,
  resultCount,
}: SearchBarProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full"
      role="search"
      aria-label="Pencarian Foto"
    >
      {/* Aurora */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
      >
        <div className="absolute -left-16 -top-20 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Dot Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,.8) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage:
            'radial-gradient(circle at center, black 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(circle at center, black 40%, transparent 100%)',
        }}
      />

      <motion.div
        variants={itemVariants}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl"
        style={{
          boxShadow:
            '0 4px 24px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.08)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5" />

        <div className="relative flex items-center">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 text-white/45"
          />

          <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Cari foto..."
            aria-label="Cari foto"
            className="h-14 w-full bg-transparent pl-12 pr-12 text-[15px] text-white/90 placeholder:text-white/30 outline-none transition-all"
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
                whileHover={{
                  scale: 1.08,
                }}
                whileTap={{
                  scale: 0.92,
                }}
                transition={{
                  duration: 0.2,
                  ease: 'easeOut',
                }}
                className="absolute right-3 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-xl hover:bg-white/10 hover:text-white"
                style={{
                  boxShadow: '0 0 16px rgba(120,40,200,.18)',
                }}
              >
                <X size={15} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {value && (
          <motion.div
            key="result"
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -6,
            }}
            transition={{
              duration: 0.25,
              ease: 'easeOut',
            }}
            className="mt-3 flex items-center justify-between px-1"
          >
            <span className="text-xs tracking-wide text-white/45">
              {resultCount}{' '}
              {resultCount === 1 ? 'hasil ditemukan' : 'hasil ditemukan'}
            </span>

            <div
              className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10"
              aria-hidden="true"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: '100%',
                }}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut',
                }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                style={{
                  boxShadow: '0 0 16px rgba(120,40,200,.3)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}