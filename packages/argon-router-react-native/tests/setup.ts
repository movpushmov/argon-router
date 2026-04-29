import * as React from 'react';
import { vi } from 'vitest';

vi.mock('react-native-gesture-handler', async () => {
  const ReactNative =
    await vi.importActual<typeof import('react-native')>('react-native');

  const Handler = React.forwardRef<any, any>((props, ref) =>
    React.createElement(ReactNative.View, { ...props, ref }, props.children),
  );

  Handler.displayName = 'GestureHandler';

  return {
    GestureHandlerRootView: ReactNative.View,
    PanGestureHandler: Handler,
    State: {
      UNDETERMINED: 0,
      FAILED: 1,
      BEGAN: 2,
      CANCELLED: 3,
      ACTIVE: 4,
      END: 5,
    },
  };
});
