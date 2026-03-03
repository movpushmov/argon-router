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
  interface Matchers<T = any> extends CustomMatchers<T> {
    toBeFalseWithMessage: (message: string) => T;
    toBeTrueWithMessage: (message: string) => T;
  }
}
