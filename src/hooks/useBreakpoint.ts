// src/hooks/useBreakpoint.ts
// Sprint 6 — Responsive breakpoint detection hook
// Uses matchMedia for zero-overhead breakpoint queries.

"use client";

import { useEffect, useState } from "react";

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = useState(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`).matches
        : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
    setMatches(mq.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return matches;
}
