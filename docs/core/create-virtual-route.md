# createVirtualRoute

Create a virtual route without a path. Virtual routes are used for UI state management, dialogs, popups, and as building blocks for other routing utilities like `chainRoute` and `group`.

## API

```typescript
function createVirtualRoute<T = void, TransformerResult = void>(
  options?: VirtualRouteOptions<T, TransformerResult>
): VirtualRoute<T, TransformerResult>
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `VirtualRouteOptions` | Optional configuration |
| `options.beforeOpen` | `Effect[]` | Effects to run before opening the route |
| `options.$isPending` | `Store<boolean>` | Custom pending state store |
| `options.transformer` | `(payload: T) => TransformerResult` | Transform payload before storing in `$params` |

### Returns

`VirtualRoute<T, TransformerResult>` with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `$params` | `Store<TransformerResult>` | Current route parameters |
| `$isOpened` | `Store<boolean>` | Whether route is opened |
| `$isPending` | `Store<boolean>` | Whether route is in pending state |
| `open` | `Event<T>` | Open the route with parameters |
| `opened` | `Event<T>` | Fires when route opens |
| `openedOnClient` | `Event<T>` | Fires when opened on client side |
| `openedOnServer` | `Event<T>` | Fires when opened on server side |
| `close` | `Event<void>` | Close the route |
| `closed` | `Event<void>` | Fires when route closes |
| `cancelled` | `Event<void>` | Fires when route opening is cancelled |

## Usage

### Basic Virtual Route

```ts
import { createVirtualRoute } from '@argon-router/core';

const route = createVirtualRoute();

route.open();  // Opens the route
route.close(); // Closes the route
```

### Dialog/Modal Management

```ts
import { createVirtualRoute } from '@argon-router/core';

interface DialogParams {
  title: string;
  message: string;
}

const confirmDialog = createVirtualRoute<DialogParams, DialogParams>({
  transformer: (params) => params,
});

// Open dialog
confirmDialog.open({
  title: 'Delete Item',
  message: 'Are you sure you want to delete this item?',
});

// React component
function ConfirmDialog() {
  const isOpen = useUnit(confirmDialog.$isOpened);
  const params = useUnit(confirmDialog.$params);

  if (!isOpen) return null;

  return (
    <div className="dialog">
      <h2>{params.title}</h2>
      <p>{params.message}</p>
      <button onClick={() => confirmDialog.close()}>Cancel</button>
      <button onClick={() => {
        handleConfirm();
        confirmDialog.close();
      }}>Confirm</button>
    </div>
  );
}
```

### With Parameter Transformer

```ts
import { createVirtualRoute } from '@argon-router/core';

interface OpenPayload {
  userId: string;
}

interface TransformedParams {
  userId: string;
  timestamp: number;
}

const userModal = createVirtualRoute<OpenPayload, TransformedParams>({
  transformer: (payload) => ({
    userId: payload.userId,
    timestamp: Date.now(),
  }),
});

userModal.open({ userId: '123' });
// $params will contain: { userId: '123', timestamp: 1234567890 }
```

### With Before Open Effects

```ts
import { createVirtualRoute } from '@argon-router/core';
import { createEffect } from 'effector';

const loadUserDataFx = createEffect(async () => {
  return await fetchUserData();
});

const profileModal = createVirtualRoute({
  beforeOpen: [loadUserDataFx],
});

// loadUserDataFx will execute before the modal opens
profileModal.open();
```

### Sidebar State

```ts
import { createVirtualRoute } from '@argon-router/core';

interface SidebarParams {
  section: 'notifications' | 'settings' | 'profile';
}

const sidebar = createVirtualRoute<SidebarParams, SidebarParams>({
  transformer: (params) => params,
});

function Sidebar() {
  const isOpen = useUnit(sidebar.$isOpened);
  const params = useUnit(sidebar.$params);

  return (
    <aside className={isOpen ? 'open' : 'closed'}>
      {params && <SidebarContent section={params.section} />}
    </aside>
  );
}

// Usage
sidebar.open({ section: 'notifications' });
```

### Popup with Custom Pending State

```ts
import { createVirtualRoute } from '@argon-router/core';
import { createStore } from 'effector';
import { pending } from 'patronum';

const loadContentFx = createEffect(async () => {
  return await fetchPopupContent();
});

const $isPending = pending({ effects: [loadContentFx] });

const popup = createVirtualRoute({
  $isPending,
  beforeOpen: [loadContentFx],
});

function Popup() {
  const isOpen = useUnit(popup.$isOpened);
  const isPending = useUnit(popup.$isPending);

  if (!isOpen) return null;

  return (
    <div className="popup">
      {isPending ? <Spinner /> : <Content />}
    </div>
  );
}
```

## Server/Client Split

Virtual routes can distinguish between server and client-side opens:

```ts
import { createVirtualRoute } from '@argon-router/core';
import { sample } from 'effector';

const route = createVirtualRoute();

sample({
  clock: route.openedOnServer,
  fn: () => console.log('Opened on server'),
});

sample({
  clock: route.openedOnClient,
  fn: () => console.log('Opened on client'),
});
```

## Best Practices

### Use for UI State

Virtual routes are perfect for managing UI state that needs Effector integration:

```ts
// ✅ Good use cases
const dialog = createVirtualRoute();
const drawer = createVirtualRoute();
const tooltip = createVirtualRoute();
const contextMenu = createVirtualRoute();
```

### Not for URL Routing

Virtual routes don't have paths and won't update the browser URL:

```ts
// ❌ For URL routing, use createRoute instead
const userRoute = createRoute({ path: '/user/:id' });
```

### Combine with Other Routes

Virtual routes work well as building blocks:

```ts
import { chainRoute, createRoute, createVirtualRoute } from '@argon-router/core';

const confirmStep = createVirtualRoute();
const successStep = createVirtualRoute();
const route = createRoute({ path: '/submit' });

const submitFlow = chainRoute([route, confirmStep, successStep]);
```

## See Also

- [group](/core/group) - Group multiple routes into a virtual route
- [chainRoute](/core/chain-route) - Create sequential route chains
- [createRoute](/core/create-route) - Create routes with paths
