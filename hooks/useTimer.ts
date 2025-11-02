"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseTimerOptions {
  initialMs?: number;
  onEnd?: () => void;
  autoStart?: boolean;
}

export function useTimer({
  initialMs = 60,
  onEnd,
  autoStart = false,
}: UseTimerOptions = {}) {
  const [ms, setMs] = useState(initialMs);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [totalRunTimeMs, setTotalRunTimeMs] = useState(0);

  const rafId = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);
  const initialMsRef = useRef(initialMs);
  const hasEndedRef = useRef(false); // ✅ Track if onEnd was called

  // Update initial value if it changes
  useEffect(() => {
    initialMsRef.current = initialMs;
  }, [initialMs]);

  // Main rAF loop
  useEffect(() => {
    if (!isRunning) {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      lastTs.current = null;
      return;
    }

    const loop = (now: number) => {
      const last = lastTs.current ?? now;
      const delta = now - last;
      lastTs.current = now;

      setTotalRunTimeMs((prev) => prev + delta);

      setMs((prev) => {
        const next = prev - delta;
        if (next <= 0) {
          // ✅ Stop the loop immediately
          if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
          }

          // ✅ Call onEnd only once
          if (!hasEndedRef.current) {
            hasEndedRef.current = true;
            setIsRunning(false);
            onEnd?.();
          }

          return 0;
        }
        return next;
      });

      // ✅ Only schedule next frame if still running
      if (rafId.current !== null) {
        rafId.current = requestAnimationFrame(loop);
      }
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [isRunning, onEnd]);

  const start = useCallback(() => {
    setIsRunning(true);
    hasEndedRef.current = false; // ✅ Reset when starting
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setMs(initialMsRef.current);
    setTotalRunTimeMs(0);
    lastTs.current = null;
    hasEndedRef.current = false; // ✅ Reset ended flag
  }, []);

  const addMs = useCallback((amount: number) => {
    setMs((prev) => Math.max(0, prev + amount));
  }, []);

  return {
    ms,
    totalRunTimeMs,
    addMs,
    reset,
    start,
    pause,
    isRunning,
  };
}
