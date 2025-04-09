import { Route } from '@argon-router/core';
import { AnchorHTMLAttributes, ComponentType, FC, ReactNode } from 'react';

interface CreateBaseRouteViewProps {
  route: Route<any>;
  layout?: ComponentType<{ children: ReactNode }>;
}

export interface CreateRouteViewProps extends CreateBaseRouteViewProps {
  view: ComponentType;
}

export interface CreateLazyRouteViewProps extends CreateBaseRouteViewProps {
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
} & AnchorProps;

export type LinkProps<Params> = Params extends
  | Record<string, never>
  | void
  | undefined
  ? BaseLinkProps<Params> & { params?: Params }
  : BaseLinkProps<Params> & { params: Params };
