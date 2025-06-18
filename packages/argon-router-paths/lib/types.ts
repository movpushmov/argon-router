export type ReplaceAll<
  S,
  From extends string,
  To extends string,
> = From extends ''
  ? S
  : S extends `${infer R1}${From}${infer R2}`
    ? `${R1}${To}${ReplaceAll<R2, From, To>}`
    : S;

type Parameter<Name extends string, Payload> = {
  [k in Name]: Payload;
};

type WithModificator<
  Type,
  T extends string,
> = T extends `${infer K}{${infer Start},${infer End}}+`
  ? Type[]
  : T extends `${infer K}{${infer Start},${infer End}}*`
    ? Type[]
    : T extends `${infer K}{${infer Start},${infer End}}?`
      ? Type[] | undefined
      : T extends `${infer K}{${infer Start},${infer End}}`
        ? Type[]
        : T extends `${infer K}+`
          ? Type[]
          : T extends `${infer K}*`
            ? Type[]
            : T extends `${infer K}?`
              ? Type | undefined
              : Type;

type WithoutModificator<T extends string> =
  T extends `${infer K}{${infer Start},${infer End}}${infer Modificator}`
    ? K
    : T extends `${infer K}{${infer Start},${infer End}}`
      ? K
      : T extends `${infer K}?`
        ? K
        : T extends `${infer K}*`
          ? K
          : T extends `${infer K}+`
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

type GenericType<T extends string> =
  ReplaceAll<T, ' ', ''> extends infer Trimmed
    ? Trimmed extends `number`
      ? number
      : Trimmed extends `${infer A}|${infer B}`
        ? Union<Trimmed>
        : Trimmed
    : never;

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
> = T extends `/:${infer Parameter}/${infer Route}`
  ? Result extends void
    ? UrlParams<`/${Route}`, UrlParameter<`:${Parameter}`>>
    : UrlParams<`/${Route}`, Result & UrlParameter<`:${Parameter}`>>
  : T extends `/:${infer Parameter}`
    ? Result extends void
      ? UrlParameter<`:${Parameter}`>
      : Result & UrlParameter<`:${Parameter}`>
    : T extends `/${infer Static}/${infer Next}`
      ? UrlParams<`/${Next}`, Result>
      : Result;

type Unwrap<Result extends UrlParams<any, void>> = {
  [k in keyof Result]: Result[k];
};

/**
 * @description Extracts the parameters from a URL string.
 * @example ```ts
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
 * ```
 */
export type ParseUrlParams<T extends string> = Unwrap<UrlParams<T>>;

export type Builder<T> = (params: T) => string;
export type Parser<T> = (path: string) => { path: string; params: T } | null;

interface BaseToken<Type, T = void> {
  type: Type;
  name: string;
  payload: T;
}

export type ConstToken = BaseToken<'const'>;
export type ParameterToken = BaseToken<
  'parameter',
  {
    required: boolean;
    genericProps?: { type: 'union'; items: string[] } | { type: 'number' };
    arrayProps?: { min?: number; max?: number };
  }
>;

export type Token = ConstToken | ParameterToken;

type IsEqual<T, Payload> = T extends Payload ? true : false;
type Assert<T extends true> = T;

type TestsUnion = 'hello' | 'world';

type Case1 = ParseUrlParams<'/:id'>;
type Case2 = ParseUrlParams<'/:id?'>;
type Case3 = ParseUrlParams<'/:id*'>;
type Case4 = ParseUrlParams<'/:id+'>;
type Case5 = ParseUrlParams<'/:id<string>'>;
type Case6 = ParseUrlParams<'/:id<number>'>;
type Case7 = ParseUrlParams<'/:id<hello|world>'>;
type Case8 = ParseUrlParams<'/:id<string>?'>;
type Case9 = ParseUrlParams<'/:id<number>?'>;
type Case10 = ParseUrlParams<'/:id<hello|world>?'>;
type Case11 = ParseUrlParams<'/:id<string>*'>;
type Case12 = ParseUrlParams<'/:id<number>*'>;
type Case13 = ParseUrlParams<'/:id<hello|world>*'>;
type Case14 = ParseUrlParams<'/:id<string>+'>;
type Case15 = ParseUrlParams<'/:id<number>+'>;
type Case16 = ParseUrlParams<'/:id<hello|world>+'>;
type Case17 = ParseUrlParams<'/:id{1,2}'>;
type Case18 = ParseUrlParams<'/:id<number>{1,2}'>;
type Case19 = ParseUrlParams<'/:id<string>{1,2}'>;
type Case20 = ParseUrlParams<'/:id<hello|world>{1,2}'>;
type Case21 = ParseUrlParams<'/:id<number>{1,2}?'>;
type Case22 = ParseUrlParams<'/:id<string>{1,2}?'>;
type Case23 = ParseUrlParams<'/:id<hello|world>{1,2}?'>;
type Case24 = ParseUrlParams<'/:id<number>{1,2}*'>;
type Case25 = ParseUrlParams<'/:id<string>{1,2}*'>;
type Case26 = ParseUrlParams<'/:id<hello|world>{1,2}*'>;
type Case27 = ParseUrlParams<'/:id<number>{1,2}+'>;
type Case28 = ParseUrlParams<'/:id<string>{1,2}+'>;
type Case29 = ParseUrlParams<'/:id<hello|world>{1,2}+'>;
type Case30 = ParseUrlParams<'/:id<number >'>;
type Case31 = ParseUrlParams<'/:id<hello| world >'>;

type Tests = [
  Assert<IsEqual<Case1, { id: string }>>,
  Assert<IsEqual<Case2, { id: string | undefined }>>,
  Assert<IsEqual<Case3, { id: string[] }>>,
  Assert<IsEqual<Case4, { id: string[] }>>,
  Assert<IsEqual<Case5, { id: 'string' }>>,
  Assert<IsEqual<Case6, { id: number }>>,
  Assert<IsEqual<Case7, { id: TestsUnion }>>,
  Assert<IsEqual<Case8, { id: 'string' | undefined }>>,
  Assert<IsEqual<Case9, { id: number | undefined }>>,
  Assert<IsEqual<Case10, { id: TestsUnion | undefined }>>,
  Assert<IsEqual<Case11, { id: 'string'[] }>>,
  Assert<IsEqual<Case12, { id: number[] }>>,
  Assert<IsEqual<Case13, { id: TestsUnion[] }>>,
  Assert<IsEqual<Case14, { id: 'string'[] }>>,
  Assert<IsEqual<Case15, { id: number[] }>>,
  Assert<IsEqual<Case16, { id: TestsUnion[] }>>,
  Assert<IsEqual<Case17, { id: string[] }>>,
  Assert<IsEqual<Case18, { id: number[] }>>,
  Assert<IsEqual<Case19, { id: 'string'[] }>>,
  Assert<IsEqual<Case20, { id: TestsUnion[] }>>,
  Assert<IsEqual<Case21, { id: number[] | undefined }>>,
  Assert<IsEqual<Case22, { id: 'string'[] | undefined }>>,
  Assert<IsEqual<Case23, { id: TestsUnion[] | undefined }>>,
  Assert<IsEqual<Case24, { id: number[] }>>,
  Assert<IsEqual<Case25, { id: 'string'[] }>>,
  Assert<IsEqual<Case26, { id: TestsUnion[] }>>,
  Assert<IsEqual<Case27, { id: number[] }>>,
  Assert<IsEqual<Case28, { id: 'string'[] }>>,
  Assert<IsEqual<Case29, { id: TestsUnion[] }>>,
  Assert<IsEqual<Case30, { id: number }>>,
  Assert<IsEqual<Case31, { id: TestsUnion }>>,
];
