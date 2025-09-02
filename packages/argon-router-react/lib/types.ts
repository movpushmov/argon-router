import { Route, OpenPayloadBase } from '@argon-router/core';
import { AnchorHTMLAttributes, ComponentType, FC, ReactNode } from 'react';

interface CreateBaseRouteViewProps<T> {
  route: Route<T>;
  layout?: ComponentType<{ children: ReactNode }>;
}

export interface CreateRouteViewProps<T> extends CreateBaseRouteViewProps<T> {
  view: ComponentType;
}

export interface CreateLazyRouteViewProps<T>
  extends CreateBaseRouteViewProps<T> {
  view: () => Promise<{ default: ComponentType }>;
  fallback?: ComponentType;
}

export interface RouteView {
  route: Route<any>;
  view: FC;
}

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

type BaseLinkProps<Params> = {
  to: Route<Params>;
  children?: ReactNode;
} & AnchorProps & OpenPayloadBase;

export type LinkProps<Params> = Params extends
  | Record<string, never>
  | void
  | undefined
  ? BaseLinkProps<Params> & { params?: Params }
  : BaseLinkProps<Params> & { params: Params };
