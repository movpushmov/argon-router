const anySymbol = Symbol('any');
const numberSymbol = Symbol('number');
const stringSymbol = Symbol('string');
const arraySymbol = Symbol('array');

export type AnyParameter = typeof anySymbol;
export type NumberParameter = typeof numberSymbol;
export type StringParameter = typeof stringSymbol;
export type ArrayParameter = typeof arraySymbol;

type Parameters = {
  any: AnyParameter;
  number: NumberParameter;
  string: StringParameter;
  array: ArrayParameter;
};

export const parameters: Parameters = {
  any: anySymbol,
  number: numberSymbol,
  string: stringSymbol,
  array: arraySymbol,
};
