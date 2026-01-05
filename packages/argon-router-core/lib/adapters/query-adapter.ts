import type { History } from 'history';
import type { RouterAdapter, To } from './types';

function extractLocation(location: History['location']) {
  const url = new URL(decodeURIComponent(location.search));

  return {
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
  };
}

export function queryAdapter(history: History): RouterAdapter {
  return {
    location: extractLocation(history.location),

    push: (to: To) => {
      if (typeof to === 'string') {
        const url = new URL(history.location.pathname);
        url.search = to;
        history.push(url.toString());
      } else {
        const url = new URL(history.location.pathname);
        url.search = `${to.pathname ?? ''}${to.search ?? ''}${to.hash ?? ''}`;
        history.push(url.toString());
      }
    },

    replace: (to: To) => {
      if (typeof to === 'string') {
        const url = new URL(history.location.pathname);
        url.search = to;
        history.replace(url.toString());
      } else {
        const url = new URL(history.location.pathname);
        url.search = `${to.pathname ?? ''}${to.search ?? ''}${to.hash ?? ''}`;
        history.replace(url.toString());
      }
    },

    goBack: () => {
      history.back();
    },

    goForward: () => {
      history.forward();
    },

    listen: (callback) => {
      const unlisten = history.listen(({ location }) =>
        callback(extractLocation(location)),
      );

      return Object.assign(unlisten, {
        unsubscribe: unlisten,
      });
    },
  };
}
