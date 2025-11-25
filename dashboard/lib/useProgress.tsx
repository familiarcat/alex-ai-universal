'use client';

/**
 * 🖖 Universal Progress Hook
 * 
 * Hook for tracking async operation progress across the dashboard
 * Provides terminal-style progress bar integration
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface ProgressItem {
  id: string;
  current: number;
  total: number;
  description: string;
  status: 'recording' | 'retrieved' | 'failed' | 'complete' | 'loading';
  timestamp: number;
}

export function useProgress() {
  const [items, setItems] = useState<ProgressItem[]>([]);
  const itemRefs = useRef<Map<string, ProgressItem>>(new Map());
  
  /**
   * Start tracking a new async operation
   */
  const start = useCallback((id: string, total: number, description: string) => {
    const item: ProgressItem = {
      id,
      current: 0,
      total,
      description,
      status: 'loading',
      timestamp: Date.now()
    };
    
    itemRefs.current.set(id, item);
    setItems(prev => [...prev.filter(i => i.id !== id), item]);
    
    return id;
  }, []);
  
  /**
   * Update progress for an operation
   */
  const update = useCallback((id: string, current: number, description?: string, status?: ProgressItem['status']) => {
    const existing = itemRefs.current.get(id);
    if (!existing) return;
    
    const updated: ProgressItem = {
      ...existing,
      current: Math.min(current, existing.total),
      description: description || existing.description,
      status: status || existing.status,
      timestamp: Date.now()
    };
    
    itemRefs.current.set(id, updated);
    setItems(prev => prev.map(i => i.id === id ? updated : i));
  }, []);
  
  /**
   * Mark an operation as complete
   */
  const complete = useCallback((id: string, description?: string) => {
    const existing = itemRefs.current.get(id);
    if (!existing) return;
    
    const updated: ProgressItem = {
      ...existing,
      current: existing.total,
      description: description || existing.description,
      status: 'complete',
      timestamp: Date.now()
    };
    
    itemRefs.current.set(id, updated);
    setItems(prev => prev.map(i => i.id === id ? updated : i));
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id));
      itemRefs.current.delete(id);
    }, 3000);
  }, []);
  
  /**
   * Mark an operation as failed
   */
  const fail = useCallback((id: string, description?: string) => {
    const existing = itemRefs.current.get(id);
    if (!existing) return;
    
    const updated: ProgressItem = {
      ...existing,
      description: description || existing.description,
      status: 'failed',
      timestamp: Date.now()
    };
    
    itemRefs.current.set(id, updated);
    setItems(prev => prev.map(i => i.id === id ? updated : i));
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id));
      itemRefs.current.delete(id);
    }, 5000);
  }, []);
  
  /**
   * Mark an item as retrieved (cached)
   */
  const retrieved = useCallback((id: string, description?: string) => {
    const existing = itemRefs.current.get(id);
    if (!existing) return;
    
    const updated: ProgressItem = {
      ...existing,
      current: existing.total,
      description: description || existing.description,
      status: 'retrieved',
      timestamp: Date.now()
    };
    
    itemRefs.current.set(id, updated);
    setItems(prev => prev.map(i => i.id === id ? updated : i));
    
    // Auto-remove after 2 seconds
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id));
      itemRefs.current.delete(id);
    }, 2000);
  }, []);
  
  /**
   * Clear all progress items
   */
  const clear = useCallback(() => {
    setItems([]);
    itemRefs.current.clear();
  }, []);
  
  return {
    items,
    start,
    update,
    complete,
    fail,
    retrieved,
    clear
  };
}

