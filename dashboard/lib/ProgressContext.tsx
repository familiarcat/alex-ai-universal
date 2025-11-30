'use client';

/**
 * 🖖 Progress Context Provider
 * 
 * Provides progress tracking context to all dashboard components
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useProgress, ProgressItem } from './useProgress';

interface ProgressContextType {
  items: ProgressItem[];
  start: (id: string, total: number, description: string) => string;
  update: (id: string, current: number, description?: string, status?: ProgressItem['status']) => void;
  complete: (id: string, description?: string) => void;
  fail: (id: string, description?: string) => void;
  retrieved: (id: string, description?: string) => void;
  clear: () => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const progress = useProgress();
  
  return (
    <ProgressContext.Provider value={progress}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgressContext() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgressContext must be used within ProgressProvider');
  }
  return context;
}

