import { prepareParser } from './prepare-parser';
import { getTokenParameters } from './get-token-parameters';
import { ParameterToken, ParseUrlParams, Token } from './types';
import { prepareBuilder } from './prepare-builder';

export function compile<T extends string, Params = ParseUrlParams<T>>(path: T) {
  const tokens: Token[] = [];

  const regexp = /:(\w+)(<[\w|]+>)?({\d+\,\d+})?([+*?])?/;
  const parsedTokens = path.split('/').filter(Boolean);

  for (let i = 0; i < parsedTokens.length; i++) {
    const parsedToken = parsedTokens[i];

    if (!parsedToken) {
      continue;
    }

    const parameters = getTokenParameters(parsedToken.match(regexp));

    if (!parameters) {
      tokens.push({ type: 'const', name: parsedToken, payload: undefined });
      continue;
    }

    const { arrayProps, genericProps, modificator, name } = parameters;

    if (!name) {
      throw new Error(
        `Invalid path: "${path}". Name for argument must be provided`,
      );
    }

    const token: ParameterToken = {
      type: 'parameter',
      name,
      payload: {
        required: true,
      },
    };

    if (genericProps && genericProps === 'number') {
      token.payload.genericProps = { type: 'number' };
    }

    if (genericProps && genericProps.includes('|')) {
      token.payload.genericProps = {
        type: 'union',
        items: genericProps.split('|'),
      };
    }

    switch (modificator) {
      case '*': {
        token.payload.arrayProps = {};
        break;
      }
      case '+': {
        token.payload.arrayProps = { min: 1 };
        break;
      }
      case '?': {
        token.payload.required = false;
        break;
      }
    }

    if (arrayProps) {
      token.payload.arrayProps = {
        ...token.payload.arrayProps,
        min: arrayProps[0],
        max: arrayProps[1],
      };
    }

    tokens.push(token);
  }

  return {
    /**
     * @param input Input path
     * @returns `{ path: string; params: Params }` | `null`
     */
    parse: prepareParser<Params>(tokens),
    /**
     * @param params Route parameters
     * @returns string
     */
    build: prepareBuilder<Params>(tokens),
  };
}
