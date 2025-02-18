import { Effect, Event, EventCallable, Store } from 'effector';
import {
  AnyParameter,
  ArrayParameter,
  NumberParameter,
  StringParameter,
} from './const';
import { MatchFunction } from 'path-to-regexp';

import { History } from 'history';

type SupportedPrimitive = string | number | Date | boolean;

export type RawConfig = Record<
  string,
  | AnyParameter
  | ArrayParameter
  | NumberParameter
  | StringParameter
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

  getPayload: (config: ReadyConfig<ParametersConfig>) => Record<string, any>;
}

type PayloadBase = {
  query?: Query;
  replace?: boolean;
};

export type RouteOpenedPayload<T> = T extends void
  ? void | undefined | PayloadBase
  : { params: T } & PayloadBase;

export interface Route<T = void> {
  $params: Store<T>;

  $isOpened: Store<boolean>;
  $isPending: Store<boolean>;

  open: EventCallable<RouteOpenedPayload<T>>;

  opened: Event<RouteOpenedPayload<T>>;
  openedOnServer: Event<RouteOpenedPayload<T>>;
  openedOnClient: Event<RouteOpenedPayload<T>>;

  closed: Event<void>;

  '@@unitShape': () => {
    params: Store<T>;
    isOpened: Store<boolean>;
    isPending: Store<boolean>;

    onOpen: EventCallable<RouteOpenedPayload<T>>;
  };
}

export type NavigatePayload = {
  path: string;
  query: Query;
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

  trackQuery: <ParametersConfig extends RawConfig>(
    config: QueryTrackerConfig<ParametersConfig>,
  ) => QueryTracker<ParametersConfig>;

  mappedRoutes: {
    route: Route<any>;
    path: string;
    toPath: (
      data?: Partial<Record<string, string | string[]>> | undefined,
    ) => string;
    fromPath: MatchFunction<Partial<Record<string, string | string[]>>>;
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

export interface InternalRouteParams<T> {
  path: string;

  parent?: InternalRoute<any>;
  close: EventCallable<void>;

  beforeOpen?: Effect<any, any, any>[];
  openFx: Effect<
    RouteOpenedPayload<T> & { historyIgnore?: boolean },
    RouteOpenedPayload<T> & { historyIgnore?: boolean },
    Error
  >;

  setAsyncImport: (value: AsyncBundleImport) => void;
}

export interface InternalRoute<T = any> extends Route<T> {
  internal: InternalRouteParams<T>;
}
