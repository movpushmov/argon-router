type SplitPath<S> = string extends S
  ? string[]
  : S extends `${infer Head}/${infer Tail}`
    ? Head extends ''
      ? SplitPath<Tail>
      : Tail extends ''
        ? [Head]
        : [Head, ...SplitPath<Tail>]
    : [S];

type JoinPath<T extends any[]> = `/${Join<T>}`;

type Join<T extends any[]> = T['length'] extends 0
  ? never
  : T extends [infer F, ...infer Rest]
    ? Join<Rest> extends infer Tail
      ? [Tail] extends [never]
        ? `${F & string}`
        : `${F & string}/${Tail & string}`
      : never
    : never;

type ReplaceAll<S, From extends string, To extends string> = From extends ''
  ? S
  : S extends `${infer R1}${From}${infer R2}`
    ? `${R1}${To}${ReplaceAll<R2, From, To>}`
    : S;

type ValidateRange<Range> = Range extends `${infer L},${infer R}`
  ? L extends `${number}`
    ? R extends `${number}`
      ? ['valid', `{${Range}`]
      : ['invalid', `{${L},number}`]
    : R extends `${number}`
      ? ['invalid', `{number,${R}}`]
      : ['invalid', `{number,number}`]
  : ['invalid', `{number,number}`];

type ValidateTypes<GenTypes> = GenTypes extends 'number'
  ? 'valid'
  : GenTypes extends ''
    ? ['invalid', `<number,union>`]
    : GenTypes extends string | `${string}|${string}`
      ? 'valid'
      : ['invalid', `<number,union>`];

type ValidateTokenBase<
  Token extends string,
  PostFix extends string = '',
> = Token extends `${infer Param}<${infer Types}>{${infer Range}}` // has Types, Range
  ? ValidateTypes<Types> extends ['invalid', infer TypesReplacer]
    ? ['invalid', `:${Param}${TypesReplacer & string}{${Range}}${PostFix}`]
    : ValidateRange<Range> extends ['invalid', infer RangeReplacer]
      ? ['invalid', `:${Param}<${Types}>${RangeReplacer & string}${PostFix}`]
      : 'valid'
  : Token extends `${infer Param}<${infer Types}>` // has only Types
    ? ValidateTypes<Types> extends ['invalid', infer TypesReplacer]
      ? ['invalid', `:${Param}${TypesReplacer & string}${PostFix}`]
      : 'valid'
    : Token extends `${infer Param}{${infer Range}}` // has only Range
      ? ValidateRange<Range> extends ['invalid', infer RangeReplacer]
        ? ['invalid', `:${Param}${RangeReplacer & string}${PostFix}`]
        : 'valid'
      : 'valid'; // base param

type ValidateToken<Token> = Token extends `:${infer RawParam}`
  ? RawParam extends `${infer WithoutModifier}${'*' | '?' | '+'}`
    ? RawParam extends `${WithoutModifier}${infer Modifier}`
      ? ValidateTokenBase<WithoutModifier, Modifier>
      : never
    : ValidateTokenBase<RawParam>
  : 'valid';

type ValidateTokens<
  Path,
  Current,
  Res extends string[] = [],
> = Current extends [infer Token, ...infer Rest]
  ? ValidateToken<ReplaceAll<Token, ' ', ''>> extends [
      'invalid',
      infer TokenReplacer,
    ]
    ? ['invalid', JoinPath<[...Res, TokenReplacer, ...Rest]>]
    : ValidateTokens<Path, Rest, [...Res, Token & string]>
  : Path;

export type ValidatePath<Path> = ValidateTokens<Path, SplitPath<Path>>;

type IsEqual<T, Payload> = T extends Payload ? true : false;
type Assert<T extends true> = T;

type Case1 = '/:id';
type Case2 = '/:id?';
type Case3 = '/:id*';
type Case4 = '/:id+';
type Case5 = '/:id<string>';
type Case6 = '/:id<number>';
type Case7 = '/:id<hello|world>';
type Case8 = '/:id<string>?';
type Case9 = '/:id<number>?';
type Case10 = '/:id<hello|world>?';
type Case11 = '/:id<string>*';
type Case12 = '/:id<number>*';
type Case13 = '/:id<hello|world>*';
type Case14 = '/:id<string>+';
type Case15 = '/:id<number>+';
type Case16 = '/:id<hello|world>+';
type Case17 = '/:id{1,2}';
type Case18 = '/:id<number>{1,2}';
type Case19 = '/:id<string>{1,2}';
type Case20 = '/:id<hello|world>{1,2}';
type Case21 = '/:id<number>{1,2}?';
type Case22 = '/:id<string>{1,2}?';
type Case23 = '/:id<hello|world>{1,2}?';
type Case24 = '/:id<number>{1,2}*';
type Case25 = '/:id<string>{1,2}*';
type Case26 = '/:id<hello|world>{1,2}*';
type Case27 = '/:id<number>{1,2}+';
type Case28 = '/:id<string>{1,2}+';
type Case29 = '/:id<hello|world>{1,2}+';

type Case30 = '/:id<hello|world>{err,err}+';
type Case31 = '/:id<hello|world>{1,err}';
type Case32 = '/:id<hello|world>{err,1}+';

type Tests = [
  Assert<IsEqual<ValidatePath<Case1>, Case1>>,
  Assert<IsEqual<ValidatePath<Case2>, Case2>>,
  Assert<IsEqual<ValidatePath<Case3>, Case3>>,
  Assert<IsEqual<ValidatePath<Case4>, Case4>>,
  Assert<IsEqual<ValidatePath<Case5>, Case5>>,
  Assert<IsEqual<ValidatePath<Case6>, Case6>>,
  Assert<IsEqual<ValidatePath<Case7>, Case7>>,
  Assert<IsEqual<ValidatePath<Case8>, Case8>>,
  Assert<IsEqual<ValidatePath<Case9>, Case9>>,
  Assert<IsEqual<ValidatePath<Case10>, Case10>>,
  Assert<IsEqual<ValidatePath<Case11>, Case11>>,
  Assert<IsEqual<ValidatePath<Case12>, Case12>>,
  Assert<IsEqual<ValidatePath<Case13>, Case13>>,
  Assert<IsEqual<ValidatePath<Case14>, Case14>>,
  Assert<IsEqual<ValidatePath<Case15>, Case15>>,
  Assert<IsEqual<ValidatePath<Case16>, Case16>>,
  Assert<IsEqual<ValidatePath<Case17>, Case17>>,
  Assert<IsEqual<ValidatePath<Case18>, Case18>>,
  Assert<IsEqual<ValidatePath<Case19>, Case19>>,
  Assert<IsEqual<ValidatePath<Case20>, Case20>>,
  Assert<IsEqual<ValidatePath<Case21>, Case21>>,
  Assert<IsEqual<ValidatePath<Case22>, Case22>>,
  Assert<IsEqual<ValidatePath<Case23>, Case23>>,
  Assert<IsEqual<ValidatePath<Case24>, Case24>>,
  Assert<IsEqual<ValidatePath<Case25>, Case25>>,
  Assert<IsEqual<ValidatePath<Case26>, Case26>>,
  Assert<IsEqual<ValidatePath<Case27>, Case27>>,
  Assert<IsEqual<ValidatePath<Case28>, Case28>>,
  Assert<IsEqual<ValidatePath<Case29>, Case29>>,
  Assert<
    IsEqual<
      ValidatePath<Case30>,
      ['invalid', '/:id<hello|world>{number,number}+']
    >
  >,
  Assert<
    IsEqual<ValidatePath<Case31>, ['invalid', '/:id<hello|world>{1,number}']>
  >,
  Assert<
    IsEqual<ValidatePath<Case32>, ['invalid', '/:id<hello|world>{number,1}+']>
  >,
];
