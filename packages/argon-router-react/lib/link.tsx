import { Route, RouteOpenedPayload } from '@argon-router/core';
import { AnchorHTMLAttributes, ReactNode, RefObject } from 'react';
import { useRouterContext } from './use-router';
import { useUnit } from 'effector-react';
import { InternalRoute } from '@argon-router/core/lib/types';

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

type BaseLinkProps<Params> = {
  to: Route<Params>;
  children?: ReactNode;
  ref?: RefObject<HTMLAnchorElement>;
} & AnchorProps;

type LinkProps<Params> = Params extends Record<string, never> | void | undefined
  ? BaseLinkProps<Params> & { params?: Params }
  : BaseLinkProps<Params> & { params: Params };

export function Link<Params = void>(props: LinkProps<Params>) {
  const { to, params, onClick, ref, ...anchorProps } = props;

  const { mappedRoutes } = useRouterContext();
  const target = mappedRoutes.find(({ route }) => route === to);

  const { onOpen } = useUnit(to);

  if (!target) {
    const { internal } = to as InternalRoute<Params>;

    throw new Error(
      `[Link] Route with path "${internal.path}" not found. Maybe it is not passed into createRouter?`,
    );
  }

  return (
    <a
      {...anchorProps}
      ref={ref}
      href={target.toPath(params ?? undefined)}
      onClick={(e) => {
        onClick?.(e);

        // allow user to prevent navigation
        if (e.defaultPrevented) {
          return;
        }

        // let browser handle "_blank" target and etc
        if (anchorProps.target && anchorProps.target !== '_self') {
          return;
        }

        // skip modified events (like cmd + click to open the link in new tab)
        if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
          return;
        }

        e.preventDefault();

        onOpen({ params: params || {} } as RouteOpenedPayload<Params>);
      }}
    />
  );
}
