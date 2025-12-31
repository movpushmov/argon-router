import { useEffect, useMemo, useState } from 'react';
import type { RouteView } from './types';
import type { InternalRoute } from '@argon-router/core/lib/types';
import { useProvidedScope } from 'effector-react';
import { is, Router } from '@argon-router/core';
import { createWatch, Subscription, type Scope, type Store } from 'effector';

function getStoreValue<T>(store: Store<T>, scope?: Scope | null) {
  return scope ? scope.getState(store) : store.getState();
}

function getVisibilities(routes: RouteView[], scope?: Scope | null) {
  return routes.map((view) => {
    if (is.router(view.route)) {
      return getStoreValue(view.route.$activeRoutes, scope).length > 0;
    }

    return getStoreValue(view.route.$isOpened, scope);
  });
}

export function useOpenedViews(routes: RouteView[]) {
  const scope = useProvidedScope();
  const [visibilities, setVisibilities] = useState<boolean[]>(
    getVisibilities(routes, scope),
  );

  useEffect(() => {
    const subscriptions: Subscription[] = [];

    for (const [index, view] of routes.entries()) {
      if (is.router(view.route)) {
        const router = view.route as Router;

        const subscription = createWatch({
          unit: router.$activeRoutes,
          scope: scope ?? undefined,
          fn: (routes) => {
            setVisibilities((prev) => {
              const newVisibilities = [...prev];
              newVisibilities[index] = routes.length > 0;

              return newVisibilities;
            });
          },
        });

        subscriptions.push(subscription);
      } else {
        subscriptions.push(
          createWatch({
            unit: view.route.$isOpened,
            scope: scope ?? undefined,
            fn: (isOpened) => {
              setVisibilities((prev) => {
                const newVisibilities = [...prev];
                newVisibilities[index] = isOpened;
                return newVisibilities;
              });
            },
          }),
        );
      }
    }

    return () => {
      for (const subscription of subscriptions) {
        subscription.unsubscribe();
      }
    };
  }, [routes, scope]);

  return useMemo(() => {
    const filtered = routes.filter((_, i) => visibilities[i]);

    return filtered.reduce(
      (filtered, view) =>
        filtered.filter(
          (r) => r.route !== (view.route as InternalRoute<any>).parent,
        ),
      filtered,
    );
  }, [routes, visibilities]);
}
