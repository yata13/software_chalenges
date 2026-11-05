import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/** Loop clock: returns t in [0, 1). Restarts when `playKey` changes. */
export function useLoop(seconds: number, playKey = 0) {
  const reduce = useReducedMotion();
  const [t, setT] = useState(reduce ? 0.999 : 0);
  const start = useRef(0);
  useEffect(() => {
    if (reduce) { setT(0.999); return; }
    start.current = performance.now();
    let raf = 0, last = 0;
    const tick = (now: number) => {
      if (now - last > 30) { // ~30 fps is plenty for a diagram
        last = now;
        setT(((Math.max(0, now - start.current) / 1000) % seconds) / seconds);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seconds, playKey, reduce]);
  return t;
}

export const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
