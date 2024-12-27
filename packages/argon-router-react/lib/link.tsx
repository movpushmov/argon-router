import { Route, RouteOpenedPayload } from '@argon-router/core';
import { AnchorHTMLAttributes, ReactNode } from 'react';
import { useRouter } from './use-router';
import { useUnit } from 'effector-react';
import { InternalRoute } from '@argon-router/core/lib/types';

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

type BaseLinkProps<Params> = {
  to: Route<Params>;
  children?: ReactNode;
} & AnchorProps;

type LinkProps<Params> =
  Params extends Record<string, never>
    ? BaseLinkProps<Params> & { params?: Params }
    : BaseLinkProps<Params> & { params: Params };

export function Link<Params = void>(props: LinkProps<Params>) {
  const { to, params, onClick, ...anchorProps } = props;

  const router = useRouter();
  const target = router.mappedRoutes.find(({ route }) => route === to);

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
