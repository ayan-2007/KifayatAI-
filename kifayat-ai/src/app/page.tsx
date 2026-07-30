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
      <Header />
      <main className="flex-1 flex flex-col items-center relative">
        {/* Shader background — only on idle state */}
        {scanState === 'idle' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-40">
              <ShaderAnimation />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-surface-950/40 via-transparent to-surface-950" />
          </div>
        )}

        {scanState === 'idle' && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 -z-10">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[128px]" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-700/10 rounded-full blur-[128px]" />
            </motion.div>
            <UploadSection />
          </>
        )}

        <AnimatePresence mode="wait">
          {scanState === 'analyzing' && <AnalyzingState key="analyzing" />}
        </AnimatePresence>

        {scanState === 'complete' && currentResult && (
          <>
            <UploadSection />
            <VerdictDashboard result={currentResult} />
            <ComparisonGrid comparisons={currentResult.comparisons} currency={currentResult.currency} />
          </>
        )}

        {scanState === 'error' && (
          <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-500/10 glow-red">
              <AlertCircle className="size-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-white font-heading">Scan Failed</h3>
            <p className="text-sm text-surface-400 max-w-xs">Something went wrong. Please try again.</p>
            <button onClick={() => { setScanState('idle'); setCurrentResult(null); }}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors shadow-lg shadow-primary-600/20">
              <RefreshCw className="size-4" /> Try Again
            </button>
          </div>
        )}
      </main>

      <footer className="w-full border-t border-white/5 py-6 mt-auto relative z-10">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs text-surface-500 font-heading">Kifayat AI — Smart Visual Shopping &amp; Price Intelligence</p>
          <p className="text-[10px] text-surface-600 mt-1">کفایت — Never Overpay Again</p>
        </div>
      </footer>

      <HistoryDrawer />
    </>
  );
}
