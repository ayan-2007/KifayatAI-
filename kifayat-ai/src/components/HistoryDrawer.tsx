'use client';
/* eslint-disable @next/next/no-img-element */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Heart } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useStore } from '@/store/useStore';
import { formatPKR } from '@/lib/currency';
import { type ScanResult } from '@/types';

export default function HistoryDrawer() {
  const { isHistoryOpen, toggleHistory, history, savedIds, toggleSaved, setCurrentResult, setScanState } = useStore();
  const savedResults = history.filter((h) => savedIds.includes(h.id));
  const recentResults = history.filter((h) => !savedIds.includes(h.id));

  const handleSelect = (result: ScanResult) => {
    setCurrentResult(result); setScanState('complete'); toggleHistory();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isHistoryOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleHistory} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-dvh w-full max-w-sm bg-surface-950 border-l border-white/5 shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 h-14 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white font-heading">محفوظ سودے</h2>
                <button onClick={toggleHistory} className="flex size-8 items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-colors">
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-white/5 mb-3"><Clock className="size-6 text-surface-500" /></div>
                    <p className="text-sm font-medium text-surface-400">ابھی تک کوئی اسکین نہیں</p>
                    <p className="text-xs text-surface-600 mt-1">قیمت کی معلومات کی تاریخ یہاں ظاہر ہوگی۔</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    {savedResults.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-500 mb-2 px-1">محفوظ کردہ</p>
                        {savedResults.map((r) => <HistoryItem key={r.id} result={r} isSaved onSelect={handleSelect} onToggleSave={toggleSaved} />)}
                      </div>
                    )}
                    {recentResults.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-500 mb-2 px-1">حالیہ</p>
                        {recentResults.map((r) => <HistoryItem key={r.id} result={r} isSaved={false} onSelect={handleSelect} onToggleSave={toggleSaved} />)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function HistoryItem({ result, isSaved, onSelect, onToggleSave }: { result: ScanResult; isSaved: boolean; onSelect: (r: ScanResult) => void; onToggleSave: (id: string) => void }) {
  return (
    <button onClick={() => onSelect(result)} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-white/5">
      <div className="size-12 shrink-0 rounded-lg overflow-hidden bg-white/5">
        <img src={result.imageData} alt="" className="size-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-surface-200 truncate">{result.brand} {result.category}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn('text-xs font-semibold font-mono',
            result.verdict === 'must_buy' ? 'text-emerald-400' : result.verdict === 'fair_value' ? 'text-amber-400' : 'text-primary-400'
          )}>{formatPKR(result.askingPrice)}</span>
          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded font-mono',
            result.kifayatScore >= 80 ? 'bg-emerald-500/10 text-emerald-400'
              : result.kifayatScore >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-primary-500/10 text-primary-400'
          )}>{result.kifayatScore}</span>
        </div>
        <p className="text-[10px] text-surface-600 mt-0.5">{new Date(result.timestamp).toLocaleDateString('en-PK')}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onToggleSave(result.id); }}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-surface-500 hover:text-primary-400 hover:bg-white/5 transition-colors">
        <Heart className={cn('size-4', isSaved && 'fill-primary-500 text-primary-500')} />
      </button>
    </button>
  );
}
