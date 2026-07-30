'use client';
/* eslint-disable @next/next/no-img-element */

import { motion } from 'framer-motion';
import { ExternalLink, ShieldCheck, Truck, Globe, Database } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPKR } from '@/lib/currency';
import { type ComparisonItem } from '@/types';

const SOURCE_LABELS: Record<string, string> = {
  ai_vision_plus_web: 'AI + Web',
  ai_vision: 'AI Estimate',
  web: 'Web Price',
  estimated: 'Estimated',
};

interface Props { comparisons: ComparisonItem[]; }

export default function ComparisonGrid({ comparisons }: Props) {
  const sorted = [...comparisons].sort((a, b) => a.price - b.price);

  return (
    <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full px-4 pb-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-deep-400 uppercase tracking-widest font-heading">Prices Across Pakistani Stores</h3>
          <span className="text-xs text-deep-500">{comparisons.length} matches found</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((item, i) => (
            <ComparisonCard key={item.id} item={item} index={i} isCheapest={i === 0} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function ComparisonCard({ item, index, isCheapest }: { item: ComparisonItem; index: number; isCheapest: boolean }) {
  return (
    <motion.a href={item.productUrl} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 * index }}
      className={cn(
        'group relative block rounded-xl border overflow-hidden glass-card-hover bg-black/40',
        item.isLowerPrice && 'border-emerald-500/20',
        isCheapest && 'ring-1 ring-emerald-500/30'
      )}>
      <div className="aspect-[4/3] overflow-hidden bg-white/[0.02]">
        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-deep-200 truncate">{item.title}</p>
            <p className="text-[11px] text-deep-500">{item.merchant}</p>
          </div>
          {isCheapest && (
            <span className="shrink-0 flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="size-3" /> Best
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-0.5 text-[10px] text-deep-400 bg-white/[0.03] rounded px-1.5 py-0.5 border border-white/5">
            <Globe className="size-2.5" /> {item.merchantDomain}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[10px] text-deep-500 bg-white/[0.03] rounded px-1.5 py-0.5 border border-white/5">
            <Database className="size-2.5" /> {SOURCE_LABELS[item.dataSource] || item.dataSource}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={cn('text-sm font-bold font-mono', item.isLowerPrice ? 'text-emerald-400' : 'text-white')}>
            {formatPKR(item.price)}
          </span>
          <span className={cn('text-[11px] font-medium',
            item.similarityScore >= 80 ? 'text-emerald-400' : item.similarityScore >= 60 ? 'text-amber-400' : 'text-deep-500'
          )}>{item.similarityScore}% match</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          <span className="text-[11px] text-deep-500 flex items-center gap-1"><ExternalLink className="size-3" /> View Deal</span>
          {item.supportsCOD && (
            <span className="text-[11px] text-deep-500 flex items-center gap-1 ml-auto">
              <Truck className="size-3" /> COD
            </span>
          )}
        </div>
      </div>
    </motion.a>
  );
}
