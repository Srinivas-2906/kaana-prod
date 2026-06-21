import { useEffect, useRef, useState } from 'react';

/** Remount key so CSS stagger animations replay cleanly (no broken infinite loops). */
export function useDemoLoop(
  resetKey: string,
  maxDelaySec: number,
  holdSec = 14,
  fadeSec = 0.6,
) {
  const [cycle, setCycle] = useState(0);
  const prevKey = useRef(resetKey);

  useEffect(() => {
    if (prevKey.current === resetKey) return;
    prevKey.current = resetKey;
    setCycle((c) => c + 1);
  }, [resetKey]);

  useEffect(() => {
    const totalMs = (maxDelaySec + fadeSec + holdSec) * 1000;
    const id = window.setInterval(() => setCycle((c) => c + 1), totalMs);
    return () => window.clearInterval(id);
  }, [resetKey, maxDelaySec, holdSec, fadeSec]);

  return cycle;
}
