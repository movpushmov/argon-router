import { attach, createEffect, createEvent, createStore, sample, scopeBind } from "effector";

import queryString from 'query-string';

import type { LocationState, NavigatePayload, Query, RouterControls } from "./types";
import type { History } from "history";
import { trackQueryControlsFactory } from "./track-query";

/**
 * @description Creates argon router controls
 * @returns `RouterControls`
 * @link https://movpushmov.dev/argon-router/core/create-router-controls.html
 *
 * `be careful! router controls need to be initialzed with setHistory event,
 * which requires memory or browser history from history package.`
 *
 * @example ```ts
 * import { createRouterControls } from '@argon-router/core';
 *
 * // create controls
 * const controls = createRouterControls();
 *
 * // override path or query
 * sample({
 *  clock: goToPage,
 *  fn: () => ({ path: '/page' }),
 *  target: controls.navigate,
 * });
 *
 * sample({
 *  clock: addQuery,
 *  fn: () => ({ query: { param1: 'hello', params2: [1, 2] } }),
 *  target: controls.navigate,
 * });
 *
 * ```
 */
export function createRouterControls(): RouterControls {
  const $history = createStore<History | null>(null, { serialize: 'ignore' });
  const $locationState = createStore<LocationState>({
    query: {},
    path: null as unknown as string,
  });

  const $query = $locationState.map((state) => state.query);
  const $path = $locationState.map((state) => state.path);

  const setHistory = createEvent<History>();
  const navigate = createEvent<NavigatePayload>();

  const back = createEvent();
  const forward = createEvent();

  const locationUpdated = createEvent<{
    pathname: string;
    query: Query;
  }>();

  const navigateFx = attach({
    source: $history,
    effect: (history, { path, query, replace }: NavigatePayload) => {
      if (!history) {
        throw new Error('history not found');
      }

      const payload = {
        pathname: path,
        search: `?${queryString.stringify(query)}`,
      };

      if (replace) {
        history.replace(payload);
      } else {
        history.push(payload);
      }
    },
  });


  const subscribeHistoryFx = createEffect((history: History) => {
    const historyLocationUpdated = scopeBind(locationUpdated);

    historyLocationUpdated({
      pathname: history.location.pathname,
      query: { ...queryString.parse(history.location.search) },
    });

    if (!history) {
      throw new Error();
    }

    history.listen(({ location }) => {
      historyLocationUpdated({
        pathname: location.pathname,
        query: { ...queryString.parse(location.search) },
      });
    });
  });

  sample({
    clock: setHistory,
    target: $history,
  });

  sample({
    clock: $history,
    filter: Boolean,
    target: subscribeHistoryFx,
  });

  sample({
    clock: locationUpdated,
    fn: (location) => ({
      path: location.pathname,
      query: location.query,
    }),
    target: $locationState,
  });

  sample({
    clock: navigate,
    source: $path,
    fn: (path, payload) => ({ path, ...payload }),
    target: navigateFx,
  });

  return {
    $history,
    $locationState,
    $query,
    $path,

    setHistory,
    navigate,
    back,
    forward,
    locationUpdated,

    trackQuery: trackQueryControlsFactory({ $query, navigate }),
  };
}