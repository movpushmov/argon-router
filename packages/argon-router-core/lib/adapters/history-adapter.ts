import type { History } from 'history';
import type { RouterAdapter } from './types';

export function historyAdapter(history: History): RouterAdapter {
  return {
    location: history.location,

    push: history.push.bind(history),
    replace: history.replace.bind(history),

    goBack: history.back.bind(history),
    goForward: history.forward.bind(history),

    listen: (callback) => {
      const unlisten = history.listen(({ location }) => callback(location));

      return Object.assign(unlisten, {
        unsubscribe: unlisten,
      });
    },
  };
}
