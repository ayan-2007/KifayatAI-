'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, ShoppingBag, ScanLine } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Header() {
  const { theme, savedIds, setTheme, toggleHistory, rehydrate } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { rehydrate(); }, [rehydrate]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            useStore.getState().setCurrentResult(null);
            useStore.getState().setScanState('idle');
          }}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-redblack-600 to-redblack-900 shadow-lg shadow-redblack-600/30 group-hover:shadow-redblack-500/50 transition-all duration-300">
            <ScanLine className="size-5 text-redblack-100" />
          </div>
          <span className="hidden sm:inline text-lg font-heading tracking-widest text-white">
            KIFAYAT<span className="text-redblack-400"> AI</span>
          </span>
          <span className="text-[10px] font-semibold text-deep-400 bg-white/5 px-1.5 py-0.5 rounded leading-none border border-white/10 font-heading tracking-wider">
            کفایت
          </span>
        </button>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-base">🇵🇰</span>
            <span className="text-xs font-bold text-deep-200 font-mono">PKR</span>
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex size-8 items-center justify-center rounded-lg text-deep-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            {mounted && theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <button
            onClick={toggleHistory}
            className="relative flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium text-deep-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ShoppingBag className="size-4" />
            {savedIds.length > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-redblack-600 text-[10px] font-bold text-white px-1">
                {savedIds.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
