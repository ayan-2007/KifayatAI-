'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import UploadSection from '@/components/UploadSection';
import AnalyzingState from '@/components/AnalyzingState';
import VerdictDashboard from '@/components/VerdictDashboard';
import ComparisonGrid from '@/components/ComparisonGrid';
import HistoryDrawer from '@/components/HistoryDrawer';
import { ShaderAnimation } from '@/components/ui/shader-lines';
import { useStore } from '@/store/useStore';

export default function Home() {
  const { scanState, currentResult, rehydrate, setScanState, setCurrentResult } = useStore();

  useEffect(() => { rehydrate(); }, [rehydrate]);

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <ShaderAnimation />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-redblack-950/30 via-transparent to-redblack-950/20" />
      </div>

      <Header />

      <main className="flex-1 flex flex-col relative z-10">
        {scanState === 'idle' && <UploadSection />}

        <AnimatePresence mode="wait">
          {scanState === 'analyzing' && (
            <motion.div key="analyzing" className="flex-1 flex items-center justify-center">
              <AnalyzingState />
            </motion.div>
          )}
        </AnimatePresence>

        {scanState === 'complete' && currentResult && (
          <motion.div key="complete" className="flex-1 flex flex-col pt-4">
            <UploadSection />
            <VerdictDashboard result={currentResult} />
            <ComparisonGrid comparisons={currentResult.comparisons} />
            <div className="flex justify-center pb-8">
              <button
                onClick={() => { setScanState('idle'); setCurrentResult(null); }}
                className="flex items-center gap-2 h-11 px-6 rounded-xl bg-redblack-600 hover:bg-redblack-500 text-white text-sm font-semibold transition-all shadow-lg shadow-redblack-600/30 hover:shadow-redblack-500/40"
              >
                <RefreshCw className="size-4" />
                Scan Another Item
              </button>
            </div>
          </motion.div>
        )}

        {scanState === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-sm">
              <div className="flex justify-center mb-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-redblack-600/10 glow-red">
                  <AlertCircle className="size-7 text-redblack-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white font-heading mb-2">Scan Failed</h3>
              <p className="text-sm text-deep-300 mb-6">Something went wrong while analyzing your item. Please try again.</p>
              <button
                onClick={() => setScanState('idle')}
                className="flex items-center gap-2 h-11 px-6 rounded-xl bg-redblack-600 hover:bg-redblack-500 text-white text-sm font-semibold transition-all shadow-lg shadow-redblack-600/30 mx-auto"
              >
                <RefreshCw className="size-4" />
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="relative z-10 w-full border-t border-white/5 py-6 mt-auto">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs text-deep-400 font-heading tracking-widest">KIFAYAT AI — SMART VISUAL SHOPPING &amp; PRICE INTELLIGENCE</p>
          <p className="text-[10px] text-deep-500 mt-1">کفایت — NEVER OVERPAY AGAIN</p>
        </div>
      </footer>

      <HistoryDrawer />
    </>
  );
}
