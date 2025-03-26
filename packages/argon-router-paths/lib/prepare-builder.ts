import { Builder, Token } from './types';

export function prepareBuilder<T>(tokens: Token[]): Builder<T> {
  return (params: any) => {
    const result: string[] = [];

    if (tokens.length === 0) {
      return '/';
    }

    for (const token of tokens) {
      switch (token.type) {
        case 'const': {
          result.push(token.name);
          break;
        }
        case 'parameter': {
          if (!params[token.name]) {
            continue;
          }

          if (Array.isArray(params[token.name])) {
            for (const param of params[token.name]) {
              result.push(param.toString());
            }
          } else {
            result.push(params[token.name].toString());
          }

          break;
        }
      }
    }

    return `/${result.join('/')}`;
  };
}
