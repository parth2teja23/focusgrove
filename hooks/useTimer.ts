"use client";

import { useState, useEffect, useCallback } from "react";
import { TimerState } from "@/types";

/**
 * Custom hook for managing a countdown timer
 * Runs client-side only, persists to DB on pause
 */
export function useTimer(initialSeconds: number | null, onComplete?: () => void) {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    secondsLeft: initialSeconds || 0,
    initialDuration: initialSeconds || 0,
  });
  
  const start = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);
  
  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);
  
  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);
  
  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      secondsLeft: prev.initialDuration,
    }));
  }, []);
  
  const setTimeLeft = useCallback((seconds: number) => {
    setState((prev) => ({ ...prev, secondsLeft: Math.max(0, seconds) }));
  }, []);
  
  // Countdown effect
  useEffect(() => {
    if (!state.isRunning || state.secondsLeft <= 0) {
      return;
    }
    
    const interval = setInterval(() => {
      setState((prev) => {
        const newSeconds = prev.secondsLeft - 1;
        
        if (newSeconds <= 0) {
          if (onComplete) {
            onComplete();
          }
          return { ...prev, secondsLeft: 0, isRunning: false };
        }
        
        return { ...prev, secondsLeft: newSeconds };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state.isRunning, onComplete]);
  
  const progress = state.initialDuration
    ? ((state.initialDuration - state.secondsLeft) / state.initialDuration) * 100
    : 0;
  
  return {
    ...state,
    progress,
    start,
    pause,
    resume,
    reset,
    setTimeLeft,
  };
}
