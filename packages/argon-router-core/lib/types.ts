import { Effect, Event, EventCallable, Store, StoreWritable } from 'effector';
import {
  AnyParameter,
  ArrayParameter,
  BooleanParameter,
  NumberParameter,
  StringParameter,
} from './const';

import { History } from 'history';
import { Builder, Parser } from '@argon-router/paths';

type SupportedPrimitive = string | number | Date | boolean;

export type RawConfig = Record<
  string,
  | AnyParameter
  | ArrayParameter
  | NumberParameter
  | StringParameter
  | BooleanParameter
  | SupportedPrimitive
  | SupportedPrimitive[]
>;

export type AsyncBundleImport = () => Promise<{ default: any }>;

export type Query = Record<string, string | null | Array<string | null>>;

export type ReadyConfig<T extends RawConfig> = {
  [K in keyof T]: T[K] extends StringParameter
    ? string
    : T[K] extends NumberParameter
      ? number
      : T[K] extends ArrayParameter
        ? string[]
        : T[K] extends AnyParameter
          ? string | string[]
          : never;
};

export type QueryTrackerConfig<ParametersConfig extends RawConfig> = {
  forRoutes?: Route<any>[];
  parameters: ParametersConfig;
};

export interface QueryTracker<ParametersConfig extends RawConfig> {
  entered: Event<ReadyConfig<ParametersConfig>>;
  exited: Event<void>;

  exit: EventCallable<{ ignoreParams: string[] } | void>;
}

export type OpenPayloadBase = {
  query?: Query;
  replace?: boolean;
};

export type RouteOpenedPayload<T> = T extends void
  ? void | undefined | OpenPayloadBase
  : { params: T } & OpenPayloadBase;

export interface Route<T = void> {
  $params: Store<T>;

  $isOpened: Store<boolean>;
  $isPending: Store<boolean>;

  open: EventCallable<RouteOpenedPayload<T>>;

  opened: Event<RouteOpenedPayload<T>>;
  openedOnServer: Event<RouteOpenedPayload<T>>;
  openedOnClient: Event<RouteOpenedPayload<T>>;

  closed: Event<void>;

  path: string;
  parent?: Route<any>;
  beforeOpen?: Effect<any, any, any>[];

  '@@unitShape': () => {
    params: Store<T>;
    isOpened: Store<boolean>;
    isPending: Store<boolean>;

    onOpen: EventCallable<RouteOpenedPayload<T>>;
  };
}

export type NavigatePayload = {
  query: Query;
  path?: string;
  replace?: boolean;
};

export interface Router {
  $query: Store<Query>;
  $path: Store<string>;
  $activeRoutes: Store<Route<any>[]>;

  back: EventCallable<void>;
  forward: EventCallable<void>;
  navigate: EventCallable<NavigatePayload>;

  setHistory: EventCallable<History>;

  routes: Route<any>[];

  /**
   * @description Creates query params tracker
   * @param config Query tacker config
   * @link https://movpushmov.dev/argon-router/core/track-query.html
   * @example ```ts
   * import { parameters } from '@argon-router/core';
   * import { router } from '@shared/router';
   * import { createDialog } from '...';
   *
   * const dialog = createDialog();
   * const tracker = router.trackQuery({
   *   dialog: 'team-member',
   *   id: parameters.number,
   * });
   *
   * // triggered for:
   * // /team?dialog=team-member&id=1
   * // /team?dialog=team-member&id=10000
   *
   * // not triggered for:
   * // /team?dialog=team&id=1
   * // /team?id=10000
   * // /team?dialog=team&id=not_number
   * ```
   */
  trackQuery: <ParametersConfig extends RawConfig>(
    config: QueryTrackerConfig<ParametersConfig>,
  ) => QueryTracker<ParametersConfig>;

  mappedRoutes: {
    route: Route<any>;
    path: string;
    build: Builder<any>;
    parse: Parser<any>;
  }[];

  '@@unitShape': () => {
    query: Store<Query>;
    path: Store<string>;
    activeRoutes: Store<Route<any>[]>;

    onBack: EventCallable<void>;
    onForward: EventCallable<void>;
    onNavigate: EventCallable<NavigatePayload>;
  };
}

type InternalOpenedPayload<T> = RouteOpenedPayload<T> & { navigate?: boolean };

export interface InternalRouteParams<T> {
  close: EventCallable<void>;
  navigated: EventCallable<RouteOpenedPayload<T>>;
  openFx: Effect<InternalOpenedPayload<T>, InternalOpenedPayload<T>, Error>;

  setAsyncImport: (value: AsyncBundleImport) => void;
}

export interface InternalRoute<T = any> extends Route<T> {
  internal: InternalRouteParams<T>;
}

export interface VirtualRoute<T = any> extends Route<T> {
  $params: StoreWritable<T>;
  close: EventCallable<void>;
  cancelled: Event<void>;
}

export type LocationState = { path: string; query: Query };

export interface RouterControls {
  $history: StoreWritable<History | null>;
  $locationState: StoreWritable<LocationState>;

  $query: Store<Query>;
  $path: Store<string>;

  setHistory: EventCallable<History>;

  navigate: EventCallable<NavigatePayload>;

  back: EventCallable<void>;
  forward: EventCallable<void>;

  locationUpdated: EventCallable<{
    pathname: string;
    query: Query;
  }>;

  /**
   * @description Creates query params tracker
   * @param config Query tacker config
   * @link https://movpushmov.dev/argon-router/core/track-query.html
   * @example ```ts
   * import { parameters } from '@argon-router/core';
   * import { router } from '@shared/router';
   * import { createDialog } from '...';
   *
   * const dialog = createDialog();
   * const tracker = router.trackQuery({
   *   dialog: 'team-member',
   *   id: parameters.number,
   * });
   *
   * // triggered for:
   * // /team?dialog=team-member&id=1
   * // /team?dialog=team-member&id=10000
   *
   * // not triggered for:
   * // /team?dialog=team&id=1
   * // /team?id=10000
   * // /team?dialog=team&id=not_number
   * ```
   */
  trackQuery: <T extends RawConfig>(
    config: Omit<QueryTrackerConfig<T>, 'forRoutes'>,
  ) => QueryTracker<T>;
}
