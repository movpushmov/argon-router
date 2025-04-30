import { Parser, Token } from './types';

export function prepareParser<T>(tokens: Token[]): Parser<T> {
  return (input) => {
    const rawTokens = input
      .split('/')
      .map((part) => part.trim())
      .filter((part) => part !== '');

    let params: any = null;

    function setKey(key: string, value: any) {
      if (!params) {
        params = {};
      }

      params[key] = value;
    }

    if (tokens.length === 0) {
      return rawTokens.length === 0 ? { path: input, params: null } : null;
    }

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      switch (token.type) {
        case 'const': {
          if (token.name !== rawTokens.shift()) {
            return null;
          }

          continue;
        }
        case 'parameter': {
          const { arrayProps, genericProps, required } = token.payload;

          if (arrayProps) {
            const array: any[] = [];
            let rawToken;

            while (true) {
              rawToken = rawTokens.shift();

              if (!rawToken) {
                break;
              }

              switch (genericProps?.type) {
                case 'number': {
                  if (isNaN(+rawToken)) {
                    return null;
                  }

                  array.push(+rawToken);
                  break;
                }

                case 'union': {
                  if (!genericProps.items.includes(rawToken)) {
                    return null;
                  }

                  array.push(rawToken);
                  break;
                }
                default: {
                  array.push(rawToken);
                  break;
                }
              }

              if (array.length >= (arrayProps.max ?? Infinity)) {
                break;
              }
            }

            if (array.length < (arrayProps.min ?? 0)) {
              return null;
            }

            if (rawTokens.length > 0 && !tokens[i + 1]) {
              return null;
            }

            setKey(token.name, array);
            break;
          }

          const rawToken = rawTokens.shift();

          if (required && !rawToken) {
            return null;
          }

          if (!rawToken) {
            setKey(token.name, undefined);

            continue;
          }

          switch (genericProps?.type) {
            case 'number': {
              if (isNaN(+rawToken)) {
                return null;
              }

              setKey(token.name, +rawToken);
              break;
            }

            case 'union': {
              if (!genericProps.items.includes(rawToken)) {
                return null;
              }

              setKey(token.name, rawToken);
              break;
            }
            default: {
              setKey(token.name, rawToken);
              break;
            }
          }
        }
      }
    }

    if (rawTokens.length > 0) {
      return null;
    }

    return { path: input, params };
  };
}
