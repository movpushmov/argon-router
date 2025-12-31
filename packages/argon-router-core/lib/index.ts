export { createRoute } from './create-route';
export { createRouter } from './create-router';
export { chainRoute } from './chain-route';
export { createRouterControls } from './create-router-controls';
export { group } from './group';
export { createVirtualRoute } from './create-virtual-route';

export type {
  Route,
  Router,
  Query,
  OpenPayloadBase,
  RouteOpenedPayload,
  NavigatePayload,
  QueryTracker,
  QueryTrackerConfig,
  VirtualRoute,
  MappedRoute,
} from './types';

export {
  historyAdapter,
  queryAdapter,
  type RouterAdapter,
  type RouterLocation,
} from './adapters';

export { is } from './utils';
