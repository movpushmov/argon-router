import { RouteOpenedPayload } from '@argon-router/core';
import { ForwardedRef, forwardRef, ReactNode } from 'react';
import { useRouterContext } from './use-router';
import { useUnit } from 'effector-react';
import { LinkProps } from './types';

type ForwardedLink = <Params = void>(
  props: LinkProps<Params> & { ref?: ForwardedRef<HTMLAnchorElement> },
) => ReactNode;

export const Link: ForwardedLink = forwardRef<
  HTMLAnchorElement,
  LinkProps<any>
>((props, ref) => {
  const { to, params, onClick, ...anchorProps } = props;

  const { mappedRoutes } = useRouterContext();
  const target = mappedRoutes.find(({ route }) => route === to);

  const { onOpen } = useUnit(to);

  if (!target) {
    throw new Error(
      `[Link] Route with path "${to.path}" not found. Maybe it is not passed into createRouter?`,
    );
  }

  return (
    <a
      {...anchorProps}
      ref={ref}
      href={target.build(params ?? undefined)}
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

        onOpen({ params: params || {} } as RouteOpenedPayload<any>);
      }}
    />
  );
});
