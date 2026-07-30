'use client';
/* eslint-disable @next/next/no-img-element */

import { useRef, useState, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, ImageUp, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useStore } from '@/store/useStore';

export default function UploadSection() {
  const { scanState, setScanState, setCurrentResult, addToHistory } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [askingPrice, setAskingPrice] = useState('');
  const [details, setDetails] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImage(file);
  }, [handleImage]);

  const onDragOver = useCallback((e: DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImage(file);
  }, [handleImage]);

  const clearImage = useCallback(() => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleScan = useCallback(async () => {
    if (!imagePreview || !askingPrice) return;
    setScanState('analyzing');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: imagePreview, askingPrice: parseFloat(askingPrice), details: details || undefined }),
      });
      if (!res.ok) throw new Error('Scan failed');
      const result = await res.json();
      setCurrentResult(result);
      addToHistory(result);
      setScanState('complete');
    } catch {
      setScanState('error');
    }
  }, [imagePreview, askingPrice, details, setScanState, setCurrentResult, addToHistory]);

  return (
    <section className="relative w-full px-4 pt-10 pb-8 md:pt-16 md:pb-10">
      <div className="mx-auto max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading tracking-tight text-white leading-tight">
            NEVER OVERPAY{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-redblack-400 to-redblack-600">
              AGAIN.
            </span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-deep-300 max-w-md mx-auto">
            Upload a product photo. AI inspects the price, checks across all Pakistani stores, and tells you if it&apos;s a steal or a scam.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            'rounded-2xl border-2 border-dashed p-6 md:p-8 transition-all duration-300 bg-black/40 backdrop-blur-xl',
            isDragging
              ? 'border-redblack-400 bg-redblack-500/10'
              : imagePreview
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-white/10 hover:border-redblack-400/40 bg-white/[0.02]'
          )}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <AnimatePresence mode="wait">
            {imagePreview ? (
              <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative">
                <div className="relative mx-auto max-w-xs rounded-xl overflow-hidden ring-1 ring-white/10">
                  <img src={imagePreview} alt="Product preview" className="w-full h-48 md:h-56 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
                <button onClick={clearImage} className="absolute -top-2 -right-2 flex size-7 items-center justify-full rounded-full bg-deep-800 border border-white/10 shadow-sm text-deep-400 hover:text-white transition-colors">
                  <X className="size-3.5 mx-auto" />
                </button>
              </motion.div>
            ) : (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-redblack-600/10 text-redblack-400">
                  <ImageUp className="size-7" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-deep-200">Drag & drop an image here</p>
                  <p className="text-xs text-deep-500 mt-1">or tap to browse files</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 h-10 px-5 rounded-xl bg-redblack-600 hover:bg-redblack-500 text-white text-sm font-semibold transition-all shadow-lg shadow-redblack-600/30 hover:shadow-redblack-500/40">
                    <Upload className="size-4" /> Upload Photo
                  </button>
                  <button onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
                    input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) handleImage(file); };
                    input.click();
                  }} className="flex items-center gap-2 h-10 px-5 rounded-xl border border-white/10 text-deep-300 text-sm font-medium hover:bg-white/5 transition-colors">
                    <Camera className="size-4" /> Take Photo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-deep-500">
              <span className="text-sm font-bold font-mono text-deep-400">₨</span>
            </div>
            <input type="number" step="1" min="0" placeholder="0" value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              className="w-full h-12 pl-10 pr-16 rounded-xl border border-white/10 bg-black/40 text-lg font-semibold text-white placeholder:text-deep-600 focus:outline-none focus:ring-2 focus:ring-redblack-500/40 focus:border-redblack-500 transition-all font-mono" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-deep-500 font-mono">PKR</div>
          </div>

          <input type="text" placeholder="Brand, store, or tag info (Optional)" value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-white/10 bg-black/40 text-sm text-white placeholder:text-deep-600 focus:outline-none focus:ring-2 focus:ring-redblack-500/40 focus:border-redblack-500 transition-all" />

          <button onClick={handleScan}
            disabled={!imagePreview || !askingPrice || scanState === 'analyzing'}
            className={cn(
              'relative w-full h-13 rounded-xl text-white text-sm font-bold tracking-wide overflow-hidden transition-all duration-300',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'shimmer-btn hover:shadow-lg hover:shadow-redblack-500/30 active:scale-[0.98] font-heading tracking-widest'
            )}>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Zap className="size-4" />
              RUN KIFAYAT SCAN
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
