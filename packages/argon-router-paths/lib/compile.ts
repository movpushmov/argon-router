type RawRules = {
  required: boolean;
  type: 'string' | 'number' | { type: 'union'; values: string[] };
  array?: { minLength?: number; maxLength?: number };
};

type RawBlock = {
  name: string;
  rules: RawRules;
};

type Validator = (input?: string) => boolean;

type Block = {
  name: string;
  validator: Validator;
  parser: (input?: string) => any;
};

function generateValidator(rules: RawRules): Validator {
  return (input?: string) => {
    if (rules.required && !input) {
      return false;
    }

    if (rules.array) {
      const { minLength, maxLength } = rules.array;
      const parsed = input!.split(',');

      if (
        parsed.length > (maxLength ?? Infinity) ||
        parsed.length < (minLength ?? 0)
      ) {
        return false;
      }
    } else {
    }
  };
}

export function compile<T extends string>(path: T) {
  const blocks: Block[] = [];

  const regexp = /:(\w+)(<[\w|]+>)?([+*?])?/;

  const parsedBlocks = path.split('/').filter(Boolean);

  for (let i = 0; i < parsedBlocks.length; i++) {
    const block = parsedBlocks[i];

    if (!block) {
      continue;
    }

    const matches = block.match(regexp);

    if (!matches) {
      continue;
    }

    const name = matches[0];
    const generic = matches[1];
    const modificator = matches[2];

    if (!name) {
      throw new Error(
        `Invalid path: "${path}". Name for argument must be provided`,
      );
    }

    const result: RawBlock = { name, validator: () => true };

    if (generic) {
      const type = generic.replace('<', '').replace('>', '');

      if (type === 'number') {
        result.validator = (input?: string) =>
          input !== undefined && !isNaN(parseInt(input));
      }

      if (type.includes('|')) {
        const parsed = type.split('|').filter(Boolean);
        result.validator = (input?: string) =>
          input !== undefined && parsed.includes(input);
      }
    }

    switch (modificator) {
      case '*': {
        break;
      }
      case '+': {
        break;
      }
      case '?': {
        if (i + 1 < parsedBlocks.length) {
          throw new Error(
            `Invalid path: "${path}". Optional parameters cannot be defined not in the end of path`,
          );
        }

        result.validator = input;

        break;
      }
    }

    blocks.push(result);
  }

  return {
    /**
     * @param input input path
     * @returns `{ path: string; params: Params }` | `void`
     */
    parse(input: string) {},

    build() {},
  };
}

compile('/:name');
console.log('\n\n\n\n\n');
compile('/name');
console.log('\n\n\n\n\n');
compile('/:name<number>');
console.log('\n\n\n\n\n');
//compile('/:name<number>+');
console.log('\n\n\n\n\n');
//compile('/:name<world|hello>+');
console.log('\n\n\n\n\n');
