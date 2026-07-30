'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Globe, BarChart3, Loader2, Eye, Search, Shield } from 'lucide-react';
import { cn } from '@/lib/cn';

const STEPS = [
  { icon: Eye, label: 'بینا (Bina) — Analyzing visual features, fabric pattern & brand signatures...' },
  { icon: Search, label: 'تلاش کار (Talashkaar) — Querying Pakistani shopping indexes & marketplace prices...' },
  { icon: Shield, label: 'منصف (Munsif) — Calculating Kifayat Score, savings & validating analysis...' },
];

export default function AnalyzingState() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setActiveStep(1), 1800);
    const t2 = setTimeout(() => setActiveStep(2), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center gap-6">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="flex size-16 items-center justify-center rounded-2xl bg-primary-500/10 glow-red">
            <Loader2 className="size-7 text-primary-400" />
          </motion.div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-white font-heading">راہنما (Rehnuma) is Analyzing Your Item</h3>
            <p className="text-sm text-surface-400 mt-1">Scanning Pakistani stores for the best prices...</p>
          </div>

          <div className="w-full space-y-3 mt-2">
            {STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = i === activeStep;
              const isDone = i < activeStep;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isActive || isDone ? 1 : 0.4, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl transition-all duration-500',
                    isActive ? 'bg-primary-500/10 border border-primary-500/20' : isDone ? 'bg-emerald-500/5' : 'bg-white/[0.02]'
                  )}>
                  <div className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'bg-primary-600 text-white' : isDone ? 'bg-emerald-500 text-white' : 'bg-white/5 text-surface-500'
                  )}>
                    {isDone ? (
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    ) : <StepIcon className="size-4" />}
                  </div>
                  <span className={cn('text-sm leading-snug',
                    isActive ? 'text-primary-300 font-medium' : isDone ? 'text-emerald-400' : 'text-surface-500'
                  )}>{step.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
