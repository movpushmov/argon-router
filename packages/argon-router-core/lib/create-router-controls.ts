import {
  attach,
  createEvent,
  createStore,
  sample,
  type Subscription,
} from 'effector';

import queryString from 'query-string';

import type {
  LocationState,
  NavigatePayload,
  Query,
  RouterControls,
} from './types';
import { trackQueryControlsFactory } from './track-query';
import type { RouterAdapter } from './adapters';

import { createAsyncAction } from 'effector-action';

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
  const $history = createStore<RouterAdapter | null>(null, {
    serialize: 'ignore',
  });

  const $locationState = createStore<LocationState>({
    query: {},
    path: null as unknown as string,
  });

  const $subscription = createStore<Subscription | null>(null);

  const $query = $locationState.map((state) => state.query);
  const $path = $locationState.map((state) => state.path);

  const setHistory = createEvent<RouterAdapter>();
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

  const subscribeHistoryFx = createAsyncAction({
    target: {
      locationUpdated,
      $subscription,
    },
    source: { $subscription },
    fn: async (target, getSource, history: RouterAdapter | null) => {
      if (!history) {
        throw Error(
          'Cannot initialize router controls with empty history adapter. Please provide some provider or check your code for passing of nullable value',
        );
      }

      const source = await getSource();

      if (source.subscription) {
        source.subscription.unsubscribe();
      }

      target.locationUpdated({
        pathname: history.location.pathname,
        query: { ...queryString.parse(history.location.search) },
      });

      target.$subscription(
        history.listen((location) => {
          target.locationUpdated({
            pathname: location.pathname,
            query: { ...queryString.parse(location.search) },
          });
        }),
      );
    },
  });

  const goBackFx = attach({
    source: $history,
    effect: (history) => {
      if (!history) {
        throw new Error('history not found');
      }

      history.goBack();
    },
  });

  const goForwardFx = attach({
    source: $history,
    effect: (history) => {
      if (!history) {
        throw new Error('history not found');
      }

      history.goForward();
    },
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

  sample({
    clock: back,
    target: goBackFx,
  });

  sample({
    clock: forward,
    target: goForwardFx,
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
