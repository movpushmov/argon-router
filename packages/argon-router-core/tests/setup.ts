import { expect } from 'vitest';

expect.extend({
  toBeFalseWithMessage(received: boolean, message: string) {
    return {
      message: () => message,
      pass: received === false,
    };
  },

  toBeTrueWithMessage(received: boolean, message: string) {
    return {
      message: () => message,
      pass: received === true,
    };
  },
});

interface CustomMatchers<R = unknown> {
  toBeFalseWithMessage: (message: string) => R;
  toBeTrueWithMessage: (message: string) => R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
