import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ArrowRight, Check, ListChecks, X } from 'lucide-react';

type SelectionBarProps = {
  count: number;
  onReview: () => void;
  onClear: () => void;
};

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 80,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: 'easeOut',
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: 80,
    scale: 0.96,
    transition: {
      duration: 0.28,
      ease: 'easeOut',
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
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

export function SelectionBar({
  count,
  onReview,
  onClear,
}: SelectionBarProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom),1rem)',
          }}
        >
          <motion.div
            layout
            className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.04)] backdrop-blur-3xl"
            style={{
              boxShadow:
                '0 20px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.08)',
            }}
          >
            {/* Aurora */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <div className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-violet-500/15 blur-3xl" />
              <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
            </div>

            {/* Dot Grid */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
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

            <div className="relative flex items-center gap-4 p-3">
              {/* Badge */}
              <motion.div
                variants={itemVariants}
                animate={{
                  boxShadow: [
                    '0 0 14px rgba(120,40,200,.35)',
                    '0 0 24px rgba(120,40,200,.55)',
                    '0 0 14px rgba(120,40,200,.35)',
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(140,60,240,.95), rgba(80,120,240,.95))',
                }}
              >
                <Check
                  size={18}
                  strokeWidth={2.8}
                  className="text-white"
                />
              </motion.div>

              {/* Text */}
              <motion.div
                variants={itemVariants}
                className="min-w-0 flex-1"
              >
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
                  className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-base font-semibold tracking-[-0.03em] text-transparent"
                >
                  {count} Foto Dipilih
                </motion.h3>

                <p className="mt-1 text-xs text-white/45">
                  Siap untuk ditinjau atau diproses.
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
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-white/45 hover:text-white/80"
                >
                  <X size={12} />
                  Hapus semua
                </motion.button>
              </motion.div>

              {/* CTA */}
              <motion.button
                variants={itemVariants}
                onClick={onReview}
                whileHover={{
                  scale: 1.04,
                  y: -1,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                transition={{
                  duration: 0.18,
                  ease: 'easeOut',
                }}
                className="group relative inline-flex h-12 shrink-0 items-center gap-2 overflow-hidden rounded-2xl px-5 font-semibold text-white"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(140,60,240,.92), rgba(80,120,240,.92))',
                  boxShadow:
                    '0 0 18px rgba(120,40,200,.30)',
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
                  className="absolute inset-y-0 w-16 bg-white/20 blur-xl"
                />

                <ListChecks
                  size={17}
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
                  <ArrowRight size={16} />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}