import { Route } from '@argon-router/core';
import type { AnchorHTMLAttributes, Component } from 'vue';

interface CreateBaseRouteViewProps<T> {
  route: Route<T>;
  layout?: Component<{ children: Component }>;
}

export interface CreateRouteViewProps<T> extends CreateBaseRouteViewProps<T> {
  view: Component;
}

export interface CreateLazyRouteViewProps<T>
  extends CreateBaseRouteViewProps<T> {
  view: () => Promise<{ default: Component }>;
  fallback?: Component;
}

export interface RouteView {
  route: Route<any>;
  view: Component;
}

type AnchorProps = Omit<AnchorHTMLAttributes, 'href'>;

type BaseLinkProps<Params> = {
  to: Route<Params>;
  children?: Component;
} & AnchorProps;

export type LinkProps<Params> = Params extends
  | Record<string, never>
  | void
  | undefined
  ? BaseLinkProps<Params> & { params?: Params }
  : BaseLinkProps<Params> & { params: Params };
