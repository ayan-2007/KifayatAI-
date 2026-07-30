'use client';

import { motion } from 'framer-motion';
import { Tag, Sparkles, ShoppingCart, TrendingDown, Shield, Database, MapPin, ArrowRight } from 'lucide-react';
import { type ScanResult } from '@/types';
import { cn } from '@/lib/cn';
import { formatPKR } from '@/lib/currency';
import KifayatScoreGauge from './KifayatScoreGauge';

interface Props { result: ScanResult; }

const CONFIDENCE_CONFIG = {
  high: { label: 'High Confidence', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  medium: { label: 'Medium Confidence', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  low: { label: 'Low Confidence — Estimated', color: 'text-surface-400', bg: 'bg-white/5', border: 'border-white/10' },
};

const SOURCE_LABELS: Record<string, string> = {
  ai_vision_plus_web: 'AI Vision + Web Prices',
  ai_vision: 'AI Vision Estimate',
  web: 'Web Prices Only',
  estimated: 'Estimated Data',
};

export default function VerdictDashboard({ result }: Props) {
  const { kifayatScore, verdict, askingPrice, averageWebPrice, savingsAmount, savingsPercentage, category, brand, exactModel, features, confidence, dataSource, webPriceCount, comparisons } = result;
  const conf = CONFIDENCE_CONFIG[confidence];

  const cheaperOptions = comparisons
    .filter(c => c.isLowerPrice)
    .sort((a, b) => a.price - b.price)
    .slice(0, 4);

  return (
    <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full px-4 pb-6">
      <div className="mx-auto max-w-4xl">
        <div className="glass-card rounded-2xl p-6 md:p-8">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-surface-400">
              <MapPin className="size-3" /> Pakistan
            </span>
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border', conf.bg, conf.border, conf.color)}>
              <Shield className="size-3" /> {conf.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-surface-400 border border-white/10">
              <Database className="size-3" /> {SOURCE_LABELS[dataSource] || dataSource}
            </span>
            {webPriceCount > 0 && (
              <span className="text-[11px] text-surface-500 border border-white/5 rounded-full px-2.5 py-1">
                {webPriceCount} stores checked
              </span>
            )}
          </div>

          {/* Exact Model */}
          {exactModel && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-primary-500/5 border border-primary-500/10 text-xs text-primary-300 font-mono">
              Detected: {exactModel}
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
            <div className="flex items-start justify-center">
              <KifayatScoreGauge score={kifayatScore} verdict={verdict} />
            </div>

            <div className="space-y-5">
              {/* Price Delta */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-3 flex items-center gap-1.5">
                  <TrendingDown className="size-3.5" /> Price Comparison
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-medium text-surface-500 uppercase tracking-wider">Your Price</span>
                    <p className="text-xl font-bold text-white mt-0.5 font-mono">{formatPKR(askingPrice)}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-surface-500 uppercase tracking-wider">Web Average</span>
                    <p className="text-xl font-bold text-white mt-0.5 font-mono">{formatPKR(averageWebPrice)}</p>
                  </div>
                </div>
                {savingsAmount > 0 ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                    <span className="text-lg">🟢</span>
                    <div>
                      <p className="text-sm font-semibold text-emerald-400">Save {formatPKR(savingsAmount)}</p>
                      <p className="text-[11px] text-emerald-500">{savingsPercentage}% cheaper than web average</p>
                    </div>
                  </motion.div>
                ) : verdict === 'overpriced' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-primary-500/10 border border-primary-500/20 px-3 py-2">
                    <span className="text-lg">🔴</span>
                    <div>
                      <p className="text-sm font-semibold text-primary-400">Overpriced by {formatPKR(-savingsAmount)}</p>
                      <p className="text-[11px] text-primary-500">{Math.abs(savingsPercentage)}% above web average</p>
                    </div>
                  </motion.div>
                ) : null}
              </div>

              {/* AI Vision Analysis */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-3 flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> AI Vision Analysis
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-400 border border-primary-500/20">
                    <Tag className="size-3" /> {brand}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-surface-300 border border-white/5">
                    <ShoppingCart className="size-3" /> {category}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {features.map((f) => (
                    <span key={f} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-surface-400 border border-white/5">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cheaper Options */}
        {cheaperOptions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <TrendingDown className="size-4" /> Cheaper Options Available
            </h4>
            <div className="space-y-2">
              {cheaperOptions.map((item) => (
                <a key={item.id} href={item.productUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 shrink-0 rounded-lg overflow-hidden bg-white/5">
                      <img src={item.imageUrl} alt="" className="size-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-surface-200 truncate">{item.merchant}</p>
                      <p className="text-[11px] text-surface-500 truncate">{item.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold font-mono text-emerald-400">{formatPKR(item.price)}</span>
                    <span className="text-[11px] text-surface-600 group-hover:text-surface-400 transition-colors">
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
