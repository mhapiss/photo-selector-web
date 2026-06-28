import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import { HOW_STEPS } from '../../config/constants';
import { itemVariants } from '../../utils/animations';
import { SectionLabel } from './SectionLabel';

export function HowItWorksSection() {
  return (
    <motion.div variants={itemVariants} className="order-2 lg:order-1" aria-label="Cara kerja Photo Selector">
      <SectionLabel>Cara Kerja</SectionLabel>

      <ol className="mt-5 flex flex-col gap-3" role="list">
        {HOW_STEPS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.li
              key={item.step}
              className="group relative overflow-hidden rounded-2xl p-4 sm:p-5"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)',
              }}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{
                background: 'rgba(255,255,255,0.055)',
                scale: 1.01,
                transition: { duration: 0.2 },
              }}
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                aria-hidden="true"
              />
              <div className="relative flex items-start gap-4">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  aria-hidden="true"
                >
                  <Icon size={17} className="text-white/60" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="mb-1 flex items-center gap-2.5">
                    <span
                      className="font-mono text-[10px] font-semibold tracking-widest"
                      style={{ color: 'rgba(160,130,255,0.7)' }}
                      aria-hidden="true"
                    >
                      {item.step}
                    </span>
                    <h3 className="text-[13px] font-semibold text-white/85 sm:text-sm">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-[12px] leading-relaxed text-white/40 sm:text-[13px]">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>

      <motion.p
        className="mt-5 flex w-fit items-center gap-2 rounded-full px-4 py-2.5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
      >
        <ImageIcon size={12} className="text-white/30" strokeWidth={1.8} aria-hidden="true" />
        <span className="text-[11px] text-white/30 sm:text-[12px]">
          Dipercaya fotografer di seluruh Indonesia
        </span>
      </motion.p>
    </motion.div>
  );
}
