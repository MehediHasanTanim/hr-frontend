// src/hooks/__tests__/useBreakpoint.test.ts
// Sprint 6 1.6.F6 — useBreakpoint unit tests

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBreakpoint } from "../useBreakpoint";

describe("useBreakpoint", () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let listeners: Array<(e: MediaQueryListEvent) => void>;

  beforeEach(() => {
    listeners = [];
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
        listeners.push(handler);
      },
      removeEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
        listeners = listeners.filter((l) => l !== handler);
      },
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false when window width is below breakpoint", () => {
    matchMediaMock.mockReturnValue({
      ...matchMediaMock(),
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useBreakpoint("sm"));
    expect(result.current).toBe(false);
  });

  it("returns true when window width is at or above breakpoint", () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      media: "(min-width: 640px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    });

    const { result } = renderHook(() => useBreakpoint("sm"));
    expect(result.current).toBe(true);
  });

  it("updates when window is resized", () => {
    let match = false;
    matchMediaMock.mockReturnValue({
      get matches() { return match; },
      media: "(min-width: 640px)",
      addEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
        listeners.push(handler);
      },
      removeEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
        listeners = listeners.filter((l) => l !== handler);
      },
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    });

    const { result } = renderHook(() => useBreakpoint("sm"));
    expect(result.current).toBe(false);

    // Simulate resize
    act(() => {
      match = true;
      listeners.forEach((l) =>
        l({ matches: true, media: "(min-width: 640px)" } as MediaQueryListEvent),
      );
    });

    expect(result.current).toBe(true);
  });
});
