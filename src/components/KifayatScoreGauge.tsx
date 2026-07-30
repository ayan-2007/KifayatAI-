'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface Props {
  score: number;
  verdict: 'must_buy' | 'fair_value' | 'overpriced';
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getScoreColor(score: number) {
  if (score >= 80) return 'stroke-emerald-500';
  if (score >= 50) return 'stroke-amber-400';
  return 'stroke-redblack-500';
}

function getScoreGlow(score: number) {
  if (score >= 80) return 'glow-emerald';
  if (score >= 50) return 'glow-amber';
  return 'glow-red';
}

const VERDICT_LABELS: Record<string, { label: string; sub: string }> = {
  must_buy: { label: 'MUST BUY', sub: 'Exceptional Value!' },
  fair_value: { label: 'FAIR MARKET VALUE', sub: 'Reasonable Purchase' },
  overpriced: { label: 'OVERPRICED', sub: 'Do Not Buy! Cheaper Options Available' },
};

export default function KifayatScoreGauge({ score, verdict }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) { setAnimatedScore(score); clearInterval(interval); }
      else setAnimatedScore(Math.round(current));
    }, duration / steps);
    return () => clearInterval(interval);
  }, [score]);

  const offset = CIRCUMFERENCE - (animatedScore / 100) * CIRCUMFERENCE;
  const info = VERDICT_LABELS[verdict];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn('relative rounded-2xl p-1', getScoreGlow(score))}>
        <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
          <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
          <motion.circle cx="70" cy="70" r={RADIUS} fill="none" strokeWidth="8" strokeLinecap="round"
            className={getScoreColor(score)}
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums text-white font-mono">{animatedScore}</span>
          <span className="text-[10px] font-medium text-deep-500 uppercase tracking-widest">Score</span>
        </div>
      </div>

      <div className="text-center">
        <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className={cn(
            'inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
            score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : score >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-redblack-600/10 text-redblack-400 border border-redblack-500/20'
          )}>
          {info.label}
        </motion.span>
        <p className="text-sm text-deep-400 mt-1">{info.sub}</p>
      </div>
    </div>
  );
}
