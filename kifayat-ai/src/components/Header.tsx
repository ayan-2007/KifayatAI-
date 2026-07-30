'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ShoppingBag, ChevronDown, ScanLine } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CURRENCIES } from '@/types';
import { useStore } from '@/store/useStore';

export default function Header() {
  const { theme, currency, setTheme, setCurrency, savedIds, toggleHistory, rehydrate } = useStore();
  const [mounted, setMounted] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const currentCurr = CURRENCIES.find((c) => c.code === currency)!;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-surface-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            useStore.getState().setCurrentResult(null);
            useStore.getState().setScanState('idle');
          }}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
            <ScanLine className="size-4 text-white" />
          </div>
          <span className="hidden sm:inline text-base font-bold tracking-tight text-white font-heading">
            Kifayat<span className="text-primary-400"> AI</span>
          </span>
          <span className="text-[10px] font-medium text-surface-500 bg-white/5 px-1.5 py-0.5 rounded leading-none border border-white/5">
            کفایت
          </span>
        </button>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium text-surface-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <span>{currentCurr.flag}</span>
              <span>{currentCurr.symbol}</span>
              <ChevronDown className={cn('size-3 transition-transform', currencyOpen && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {currencyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-white/10 bg-surface-900/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                >
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                        currency === c.code
                          ? 'bg-primary-500/10 text-primary-400 font-medium'
                          : 'text-surface-300 hover:bg-white/5'
                      )}
                    >
                      <span className="text-base">{c.flag}</span>
                      <span className="flex-1 text-left">{c.label}</span>
                      <span className="text-xs text-surface-500">{c.symbol}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex size-8 items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            {mounted && theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <button
            onClick={toggleHistory}
            className="relative flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium text-surface-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ShoppingBag className="size-4" />
            {savedIds.length > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary-600 text-[10px] font-bold text-white px-1">
                {savedIds.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
