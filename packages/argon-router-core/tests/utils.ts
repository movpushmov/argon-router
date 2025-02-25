import { createWatch, Scope, Unit } from 'effector';
import { vi } from 'vitest';

export function watchCalls<T>(unit: Unit<T>, scope: Scope) {
  const mockedFn = vi.fn<(payload: T) => void>();

  createWatch({
    unit,
    scope,
    fn: mockedFn,
  });

  return mockedFn;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
