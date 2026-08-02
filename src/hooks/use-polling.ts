"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Polls `callback` every `intervalMs` (default 3500ms).
 * Clears the interval on unmount.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs = 3500,
  enabled = true
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await savedCallback.current();
    };

    tick();
    const id = setInterval(tick, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs, enabled]);
}

export function useStableCallback<T extends (...args: never[]) => unknown>(
  fn: T
): T {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args: never[]) => ref.current(...args), []) as T;
}
