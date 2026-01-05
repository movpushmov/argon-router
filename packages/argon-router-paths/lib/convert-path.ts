type CompabilityMode = 'express';

const cases = {
  express: [
    [/:id<.+>/g, ':id'],
    [/:id\+/g, '*id'],
    [/:id\*/g, '*id'],
    [/:id\{.+\}/g, '*id'],
    [/([a-zA-Z0-9:/_\.]+)\/([\*:])id\?/g, '$1{/$2id}'],
    [/([\*:])id\?/g, '{$1id}'],
  ],
} as const;

export function convertPath(path: string, mode: CompabilityMode): string {
  switch (mode) {
    case 'express': {
      let newPath = path;

      for (const [regex, replacement] of cases.express) {
        const match = newPath.match(regex);

        if (!match) {
          continue;
        }

        newPath = newPath.replace(regex, replacement);
      }

      return newPath;
    }
  }
}
