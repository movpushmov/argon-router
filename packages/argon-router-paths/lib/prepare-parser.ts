import { Parser, Token } from './types';

export function prepareParser<T>(tokens: Token[]): Parser<T> {
  return (input) => {
    const rawTokens = input.split('/').filter(Boolean);
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
      let rawToken = rawTokens[i];
      const token = tokens[i];

      switch (token.type) {
        case 'const': {
          if (rawToken !== token.name) {
            return null;
          }

          continue;
        }
        case 'parameter': {
          const { arrayProps, genericProps, required } = token.payload;

          if (arrayProps) {
            const array: any[] = [];

            while (rawToken && array.length < (arrayProps.max ?? Infinity)) {
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

              rawToken = rawTokens[i + array.length];
            }

            if (array.length < (arrayProps.min ?? 0)) {
              return null;
            }

            if (rawTokens[i + array.length] && !tokens[i + 1]) {
              return null;
            }

            setKey(token.name, array);
            break;
          }

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

    return { path: input, params };
  };
}
