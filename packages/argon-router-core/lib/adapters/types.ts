import type { Subscription } from 'effector';

export interface RouterLocation {
  pathname: string;
  search: string;
  hash: string;
}

export type To = string | Partial<RouterLocation>;

type ListenCallback = (location: RouterLocation) => void;

export interface RouterAdapter {
  location: RouterLocation;

  push: (to: To) => void;
  replace: (to: To) => void;

  goBack: () => void;
  goForward: () => void;

  listen: (callback: ListenCallback) => Subscription;
}
