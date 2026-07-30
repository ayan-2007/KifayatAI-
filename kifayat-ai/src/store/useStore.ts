'use client';

import { create } from 'zustand';
import type { ScanResult, ScanState, CurrencyCode } from '@/types';

interface HistoryState {
  theme: 'light' | 'dark';
  currency: CurrencyCode;
  scanState: ScanState;
  currentResult: ScanResult | null;
  history: ScanResult[];
  savedIds: string[];
  isHistoryOpen: boolean;

  setTheme: (theme: 'light' | 'dark') => void;
  setCurrency: (currency: CurrencyCode) => void;
  setScanState: (state: ScanState) => void;
  setCurrentResult: (result: ScanResult | null) => void;
  addToHistory: (result: ScanResult) => void;
  toggleSaved: (id: string) => void;
  toggleHistory: () => void;
  rehydrate: () => void;
}

function persist(key: string, value: unknown) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { }
  }
}

function load<T>(key: string, fallback: T): T {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch { }
  }
  return fallback;
}

export const useStore = create<HistoryState>((set, get) => ({
  theme: 'dark',
  currency: 'USD',
  scanState: 'idle',
  currentResult: null,
  history: [],
  savedIds: [],
  isHistoryOpen: false,

  rehydrate: () => {
    const savedIds = load<string[]>('ka-saved', []);
    const history = load<ScanResult[]>('ka-history', []);
    const currency = load<CurrencyCode>('ka-currency', 'USD');
    const theme = load<'light' | 'dark'>('ka-theme', 'dark');
    set({ savedIds, history, currency, theme });
  },

  setTheme: (theme) => {
    set({ theme });
    persist('ka-theme', theme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  },

  setCurrency: (currency) => {
    set({ currency });
    persist('ka-currency', currency);
  },

  setScanState: (scanState) => set({ scanState }),

  setCurrentResult: (currentResult) => set({ currentResult }),

  addToHistory: (result) => {
    const { history } = get();
    const updated = [result, ...history].slice(0, 50);
    set({ history: updated });
    persist('ka-history', updated);
  },

  toggleSaved: (id) => {
    const { savedIds } = get();
    const updated = savedIds.includes(id)
      ? savedIds.filter((s) => s !== id)
      : [...savedIds, id];
    set({ savedIds: updated });
    persist('ka-saved', updated);
  },

  toggleHistory: () => set((s) => ({ isHistoryOpen: !s.isHistoryOpen })),
}));
