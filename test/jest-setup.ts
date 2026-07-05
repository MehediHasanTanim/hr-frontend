// test/jest-setup.ts
// Custom Jest matchers for Sprint 6 test suite
import { expect } from '@jest/globals';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(candidates: unknown[]): R;
    }
  }
}

expect.extend({
  toBeOneOf(received: unknown, candidates: unknown[]) {
    const pass = candidates.includes(received);
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${String(received)} NOT to be one of [${candidates.join(', ')}]`
          : `Expected ${String(received)} to be one of [${candidates.join(', ')}]`,
    };
  },
});
