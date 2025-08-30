# Tracking query

Tracking query is very popular case. Argon router gives you instrument with name
`query tracker`, which allows you to watch query & controls it without headache.

Now query tracker supports only `zod` schema. You must install zod manually.

### Basic example (persistent dialog)

```ts
// settings/model/root.ts

import { router } from '@shared/router';
import { createDialog } from '@shared/libs/dialogs';
import { z } from 'zod/v4';

const dialog = createDialog();
const tracker = router.trackQuery({
  parameters: z.object({
    dialog: z.literal('age'),
  }),
});

sample({
  clock: tracker.entered,
  target: dialog.open,
});

sample({
  clock: tracker.exited,
  target: dialog.close,
});

sample({
  clock: dialog.closed,
  target: tracker.exit,
});
```

### Edit team member (in persistent dialog)

```ts
// team/model/root.ts

import { parameters } from '@argon-router/core';
import { router } from '@shared/router';
import { createDialog } from '@shared/libs/dialogs';
import { z } from 'zod/v4';

const dialog = createDialog();
const tracker = router.trackQuery({
  parameters: z.object({
    dialog: z.literal('team-member'),
    // be careful: all params in query is string by default
    id: z.cource.number(),
  }),
});

// triggered for:
// /team?dialog=team-member&id=1
// /team?dialog=team-member&id=10000

// not triggered for:
// /team?dialog=team&id=1
// /team?id=10000
// /team?dialog=team&id=not_number
```

### Exit without loss parameters

```ts
sample({
  clock: someEvent,
  // do not erase 'uid' parameter when exit
  fn: () => ({ ignoreParams: ['uid'] }),
  target: tracker.exit,
});
```
