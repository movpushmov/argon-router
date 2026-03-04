import type { Route } from '@argon-router/core';
import type { InternalRoute } from '@argon-router/core';
import { useRouterContext } from './use-router';
import { useUnit } from 'effector-react';

export function useLink<T extends object | void = void>(
  to: Route<T>,
  params: T,
) {
  const { knownRoutes } = useRouterContext();
  const target = knownRoutes.find(
    ({ route }) => route === (to as unknown as InternalRoute<any>),
  );

  const { onOpen } = useUnit(to);

  if (!target) {
    console.error(`[useLink route log]`, to);
    throw new Error(
      `[useLink] Route not found. Maybe it is not passed into createRouter?`,
    );
  }

  return {
    path: target.build(params ?? undefined),
    onOpen,
  };
}
