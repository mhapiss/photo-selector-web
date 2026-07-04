import { motion } from 'framer-motion';
import { HOW_STEPS } from '../../config/constants';
import { itemVariants } from '../../utils/animations';
import { SectionLabel } from './SectionLabel';

export function HowItWorksSection() {
  return (
    <motion.div variants={itemVariants} className="order-2 lg:order-1" aria-label="Cara kerja">
      <SectionLabel>Cara Kerja</SectionLabel>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {HOW_STEPS.map((item, index) => {
          const Icon = item.icon;
          // Custom spans for bento box feel (make the last one span 2 columns if there are 3 items)
          const isLastAndOdd = index === HOW_STEPS.length - 1 && HOW_STEPS.length % 2 !== 0;
          
          return (
            <motion.div
              key={item.step}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-surface/40 p-6 backdrop-blur-md transition-colors hover:bg-surface/80 hover:border-border ${isLastAndOdd ? 'sm:col-span-2' : ''}`}
            >
              {/* Subtle background glow */}
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${item.color} blur-[32px] opacity-40 group-hover:opacity-80 transition-opacity duration-500`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background border border-border shadow-sm">
                    <Icon size={20} className="text-primary" strokeWidth={2} />
                  </div>
                  <span className="text-[28px] font-black text-ink/5 tracking-tighter">
                    {item.step}
                  </span>
                </div>
                
                <h3 className="text-[17px] font-bold text-ink mb-2">{item.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-muted/90 flex-grow">{item.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-6 text-[12px] text-muted/60 text-center font-medium tracking-wide uppercase">
        Dipercaya ratusan fotografer di seluruh Indonesia
      </p>
    </motion.div>
  );
}
