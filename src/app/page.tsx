'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import UploadSection from '@/components/UploadSection';
import AnalyzingState from '@/components/AnalyzingState';
import VerdictDashboard from '@/components/VerdictDashboard';
import HistoryDrawer from '@/components/HistoryDrawer';
import { useStore } from '@/store/useStore';

export default function Home() {
  const { scanState, currentResult, rehydrate, setScanState } = useStore();

  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {scanState === 'analyzing' ? (
            <motion.div key="analyzing" className="flex-1 flex items-center justify-center">
              <AnalyzingState />
            </motion.div>
          ) : scanState === 'complete' && currentResult ? (
            <motion.div key="complete" className="flex-1 flex flex-col pt-4">
              <VerdictDashboard result={currentResult} />
              <div className="flex justify-center pb-8">
                <button
                  onClick={() => setScanState('idle')}
                  className="flex items-center gap-2 h-10 px-5 rounded-xl border border-white/10 text-surface-400 text-sm font-medium hover:bg-white/5 hover:text-white transition-colors"
                >
                  <RefreshCw className="size-4" />
                  Scan Another Item
                </button>
              </div>
            </motion.div>
          ) : scanState === 'error' ? (
            <motion.div key="error" className="flex-1 flex items-center justify-center px-4">
              <div className="text-center max-w-sm">
                <div className="flex justify-center mb-4">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-500/10">
                    <AlertCircle className="size-7 text-primary-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white font-heading mb-2">Scan Failed</h3>
                <p className="text-sm text-surface-400 mb-6">Something went wrong while analyzing your item. Please try again.</p>
                <button
                  onClick={() => setScanState('idle')}
                  className="flex items-center gap-2 h-11 px-6 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors shadow-lg shadow-primary-600/20 mx-auto"
                >
                  <RefreshCw className="size-4" />
                  Try Again
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="idle" className="flex-1">
              <UploadSection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <HistoryDrawer />
    </>
  );
}
