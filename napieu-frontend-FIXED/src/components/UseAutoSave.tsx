'use client';

import { useEffect, useRef } from 'react';

interface AutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ 
  data, 
  onSave, 
  delay = 30000,
  enabled = true 
}: AutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>(''); // FIX: Initialize with empty string
  const isSavingRef = useRef<boolean>(false); // FIX: Initialize with false

  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);
    
    // Don't save if data hasn't changed
    if (currentData === previousDataRef.current) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;
      
      try {
        isSavingRef.current = true;
        await onSave(data);
        previousDataRef.current = currentData;
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        isSavingRef.current = false;
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled]);
}