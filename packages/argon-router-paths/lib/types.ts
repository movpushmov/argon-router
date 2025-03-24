type Parameter<Name extends string, Payload> = {
  [k in Name]: Payload;
};

type WithModificator<Type, T extends string> = T extends `${infer K}+`
  ? Type[]
  : T extends `${infer K}*`
    ? Type[]
    : T extends `${infer K}?`
      ? Type | undefined
      : T extends `${infer K}{${infer Start},${infer End}}`
        ? Type[]
        : Type;

type WithoutModificator<T extends string> = T extends `${infer K}+`
  ? K
  : T extends `${infer K}*`
    ? K
    : T extends `${infer K}?`
      ? K
      : T extends `${infer K}{${infer Start},${infer End}}`
        ? K
        : T;

type Union<
  T extends string,
  Result = void,
> = T extends `${infer Start}|${infer Type}`
  ? Union<Type, Result extends void ? Start : Result | Start>
  : Result extends void
    ? T
    : Result | T;

type GenericType<T extends string> = T extends `number`
  ? number
  : T extends `${infer A}|${infer B}`
    ? Union<T>
    : string;

export type UrlParameter<T extends string> =
  T extends `:${infer Name}<${infer Type}>${infer Modificator}`
    ? Parameter<WithoutModificator<Name>, WithModificator<GenericType<Type>, T>>
    : T extends `:${infer Name}<${infer Type}>`
      ? Parameter<Name, GenericType<Type>>
      : T extends `:${infer Name}`
        ? Parameter<WithoutModificator<Name>, WithModificator<string, T>>
        : never;

type UrlParams<
  T extends string,
  Result = void,
> = T extends `/:${infer Parameter extends string}/${infer Route}`
  ? Result extends void
    ? UrlParams<`/${Route}`, UrlParameter<`:${Parameter}`>>
    : UrlParams<`/${Route}`, Result & UrlParameter<`:${Parameter}`>>
  : T extends `/:${infer Parameter extends string}`
    ? Result extends void
      ? UrlParameter<`:${Parameter}`>
      : Result & UrlParameter<`:${Parameter}`>
    : Result;

type Unwrap<Result extends UrlParams<any, void>> = {
  [k in keyof Result]: Result[k];
};

/**
 * @description Extracts the parameters from a URL string.
 * @example
 *
 * type Params = ParseUrlParams<'/:id/:name'>;
 * //      ^----- { id: string, name: string }
 *
 * type Params = ParseUrlParams<'/:id+'>;
 * //      ^----- { id: string[] }
 *
 * type Params = ParseUrlParams<'/:id*'>;
 * //      ^----- { id: string[] }
 *
 * type Params = ParseUrlParams<'/:id?'>;
 * //      ^----- { id?: string }
 *
 * type Params = ParseUrlParams<'/:id<number>+'>;
 * //      ^----- { id: number[] }
 *
 * type Params = ParseUrlParams<'/:id<number>*'>;
 * //      ^----- { id: number[] }
 *
 * type Params = ParseUrlParams<'/:id<number>'>;
 * //      ^----- { id: number }
 *
 * type Params = ParseUrlParams<'/:id<hello|world>?'>;
 * //      ^----- { id?: 'hello' | 'world' }
 *
 * type Params = ParseUrlParams<'/:id<hello|world>+'>;
 * //      ^----- { id: ('hello' | 'world')[] }
 *
 * type Params = ParseUrlParams<'/'>;
 * //      ^----- void
 */
export type ParseUrlParams<T extends string> = Unwrap<UrlParams<T>>;
