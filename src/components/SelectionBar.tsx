import { motion } from 'framer-motion';
import { ArrowRight, Check, ListChecks, X } from 'lucide-react';

type SelectionBarProps = {
  count: number;
  onReview: () => void;
  onClear: () => void;
};

export function SelectionBar({
  count,
  onReview,
  onClear,
}: SelectionBarProps) {
  if (count === 0) return null;

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-2xl p-3 shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]">
      {/* Ambient Aurora */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Subtle Dot Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,.9) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage:
            'radial-gradient(circle at center, black 45%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(circle at center, black 45%, transparent 100%)',
        }}
      />

      <div className="relative flex items-center gap-4">
        {/* Check Badge Icon */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 14px rgba(139,92,246,.25)',
              '0 0 24px rgba(139,92,246,.45)',
              '0 0 14px rgba(139,92,246,.25)',
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px]"
          style={{
            background:
              'linear-gradient(135deg, rgba(147,51,234,.95), rgba(79,70,229,.95))',
          }}
        >
          <Check
            size={16}
            strokeWidth={3}
            className="text-white"
          />
        </motion.div>

        {/* Counter Info */}
        <div className="min-w-0 flex-1">
          <motion.h3
            key={count}
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.25,
              ease: 'easeOut',
            }}
            className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-sm font-bold tracking-tight text-transparent"
          >
            {count} Foto Terpilih
          </motion.h3>

          <p className="text-[11px] text-white/40">
            Siap untuk ditinjau & kirim.
          </p>

          <motion.button
            onClick={onClear}
            whileHover={{
              x: 2,
            }}
            whileTap={{
              scale: 0.96,
            }}
            transition={{
              duration: 0.18,
              ease: 'easeOut',
            }}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-white/45 hover:text-white/80 focus:outline-none focus:text-white/80"
          >
            <X size={11} />
            Hapus semua
          </motion.button>
        </div>

        {/* Action Button */}
        <motion.button
          onClick={onReview}
          whileHover={{
            scale: 1.03,
            y: -0.5,
          }}
          whileTap={{
            scale: 0.97,
          }}
          transition={{
            duration: 0.18,
            ease: 'easeOut',
          }}
          className="group relative inline-flex h-11 shrink-0 items-center gap-1.5 overflow-hidden rounded-[14px] px-4 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          style={{
            background:
              'linear-gradient(135deg, rgba(147,51,234,.95), rgba(79,70,229,.95))',
            boxShadow:
              '0 0 18px rgba(139,92,246,.25)',
          }}
        >
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            className="absolute inset-y-0 w-16 bg-white/10 blur-md pointer-events-none"
          />

          <ListChecks
            size={14}
            className="relative z-10"
          />

          <span className="relative z-10 hidden sm:block">
            Tinjau
          </span>

          <motion.div
            animate={{
              x: [0, 3, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            className="relative z-10"
          >
            <ArrowRight size={13} />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}