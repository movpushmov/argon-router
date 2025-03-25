import { describe, expect, test } from 'vitest';
import { compile } from '../lib/compile';

describe('parse path', () => {
  test('parse root path', () => {
    const { parse } = compile('/');

    expect(parse('/not-found')).toStrictEqual(null);
  });

  test('parse path without parameters', () => {
    const { parse } = compile('/profile');

    expect(parse('/profile')).toStrictEqual({
      path: '/profile',
      params: null,
    });
  });

  test('parse path with default string parameter', () => {
    const { parse } = compile('/profile/:id');

    expect(parse('/profile/12323')).toStrictEqual({
      path: '/profile/12323',
      params: { id: '12323' },
    });
  });

  test('parse path with generic parameter (number)', () => {
    const { parse } = compile('/profile/:id<number>');

    expect(parse('/profile/12323')).toStrictEqual({
      path: '/profile/12323',
      params: { id: 12323 },
    });
  });

  test('parse path with generic parameter (union)', () => {
    const { parse } = compile('/profile/:id<hello|world>');

    expect(parse('/profile/hello')).toStrictEqual({
      path: '/profile/hello',
      params: { id: 'hello' },
    });

    expect(parse('/profile/world')).toStrictEqual({
      path: '/profile/world',
      params: { id: 'world' },
    });

    expect(parse('/profile/test')).toStrictEqual(null);
  });

  test('parse path with range string parameter', () => {
    const { parse } = compile('/profile/:id{3,4}');

    expect(parse('/profile/1/2')).toStrictEqual(null);

    expect(parse('/profile/1/2/3')).toStrictEqual({
      path: '/profile/1/2/3',
      params: { id: ['1', '2', '3'] },
    });

    expect(parse('/profile/1/2/3/4')).toStrictEqual({
      path: '/profile/1/2/3/4',
      params: { id: ['1', '2', '3', '4'] },
    });

    expect(parse('/profile/1/2/3/4/5')).toStrictEqual(null);
  });

  test('parse path with range number parameter', () => {
    const { parse } = compile('/profile/:id<number>{3,4}');

    expect(parse('/profile/1/2')).toStrictEqual(null);

    expect(parse('/profile/1/2/3')).toStrictEqual({
      path: '/profile/1/2/3',
      params: { id: [1, 2, 3] },
    });

    expect(parse('/profile/1/2/3/4')).toStrictEqual({
      path: '/profile/1/2/3/4',
      params: { id: [1, 2, 3, 4] },
    });

    expect(parse('/profile/1/2/3/4/5')).toStrictEqual(null);
  });

  test('parse path with range union parameter', () => {
    const { parse } = compile('/profile/:id<hello|argon|router>{3,4}');

    expect(parse('/profile/test/hello/router')).toStrictEqual(null);

    expect(parse('/profile/hello/argon/router')).toStrictEqual({
      path: '/profile/hello/argon/router',
      params: { id: ['hello', 'argon', 'router'] },
    });

    expect(parse('/profile/hello/hello/argon/router')).toStrictEqual({
      path: '/profile/hello/hello/argon/router',
      params: { id: ['hello', 'hello', 'argon', 'router'] },
    });

    expect(parse('/profile/hello/hello/argon/argon/router')).toStrictEqual(
      null,
    );
  });

  test('parse path with range string parameter with modificator ?', () => {
    const { parse } = compile('/profile/:id{3,4}?');

    expect(parse('/profile/1/2')).toStrictEqual(null);

    expect(parse('/profile/1/2/3')).toStrictEqual({
      path: '/profile/1/2/3',
      params: { id: ['1', '2', '3'] },
    });

    expect(parse('/profile/1/2/3/4')).toStrictEqual({
      path: '/profile/1/2/3/4',
      params: { id: ['1', '2', '3', '4'] },
    });

    expect(parse('/profile/1/2/3/4/5')).toStrictEqual(null);
  });

  test('parse path with default string parameter and modificator +', () => {
    const { parse } = compile('/profile/:id+');

    expect(parse('/profile/1')).toStrictEqual({
      path: '/profile/1',
      params: { id: ['1'] },
    });

    expect(parse('/profile/1/2')).toStrictEqual({
      path: '/profile/1/2',
      params: { id: ['1', '2'] },
    });

    expect(parse('/profile')).toStrictEqual(null);
  });

  test('parse path with default string parameter and modificator *', () => {
    const { parse } = compile('/profile/:id*');

    expect(parse('/profile/1')).toStrictEqual({
      path: '/profile/1',
      params: { id: ['1'] },
    });

    expect(parse('/profile/1/2')).toStrictEqual({
      path: '/profile/1/2',
      params: { id: ['1', '2'] },
    });

    expect(parse('/profile')).toStrictEqual({
      path: '/profile',
      params: { id: [] },
    });
  });

  test('parse path with default string parameter and modificator ?', () => {
    const { parse } = compile('/profile/:id?');

    expect(parse('/profile/1')).toStrictEqual({
      path: '/profile/1',
      params: { id: '1' },
    });

    expect(parse('/profile')).toStrictEqual({
      path: '/profile',
      params: { id: undefined },
    });
  });

  test('parse path with generic parameter (number) and modificator +', () => {
    const { parse } = compile('/profile/:id<number>+');

    expect(parse('/profile/1')).toStrictEqual({
      path: '/profile/1',
      params: { id: [1] },
    });

    expect(parse('/profile/1/2')).toStrictEqual({
      path: '/profile/1/2',
      params: { id: [1, 2] },
    });

    expect(parse('/profile')).toStrictEqual(null);
  });

  test('parse path with generic parameter (number) and modificator *', () => {
    const { parse } = compile('/profile/:id<number>*');

    expect(parse('/profile/1')).toStrictEqual({
      path: '/profile/1',
      params: { id: [1] },
    });

    expect(parse('/profile/1/2')).toStrictEqual({
      path: '/profile/1/2',
      params: { id: [1, 2] },
    });

    expect(parse('/profile')).toStrictEqual({
      path: '/profile',
      params: { id: [] },
    });
  });

  test('parse path with generic parameter (number) and modificator ?', () => {
    const { parse } = compile('/profile/:id<number>?');

    expect(parse('/profile/1')).toStrictEqual({
      path: '/profile/1',
      params: { id: 1 },
    });

    expect(parse('/profile')).toStrictEqual({
      path: '/profile',
      params: { id: undefined },
    });
  });

  test('parse path with generic parameter (union) and modificator +', () => {
    const { parse } = compile('/profile/:id<hello|world>+');

    expect(parse('/profile/hello/world')).toStrictEqual({
      path: '/profile/hello/world',
      params: { id: ['hello', 'world'] },
    });

    expect(parse('/profile/world/hello')).toStrictEqual({
      path: '/profile/world/hello',
      params: { id: ['world', 'hello'] },
    });

    expect(parse('/profile/world')).toStrictEqual({
      path: '/profile/world',
      params: { id: ['world'] },
    });

    expect(parse('/profile/test')).toStrictEqual(null);
  });

  test('parse path with generic parameter (union) and modificator *', () => {
    const { parse } = compile('/profile/:id<hello|world>*');

    expect(parse('/profile/hello/world')).toStrictEqual({
      path: '/profile/hello/world',
      params: { id: ['hello', 'world'] },
    });

    expect(parse('/profile/world/hello')).toStrictEqual({
      path: '/profile/world/hello',
      params: { id: ['world', 'hello'] },
    });

    expect(parse('/profile/world')).toStrictEqual({
      path: '/profile/world',
      params: { id: ['world'] },
    });

    expect(parse('/profile')).toStrictEqual({
      path: '/profile',
      params: { id: [] },
    });

    expect(parse('/profile/test')).toStrictEqual(null);
  });

  test('parse path with generic parameter (union) and modificator ?', () => {
    const { parse } = compile('/profile/:id<hello|world>?');

    expect(parse('/profile/hello')).toStrictEqual({
      path: '/profile/hello',
      params: { id: 'hello' },
    });

    expect(parse('/profile/world')).toStrictEqual({
      path: '/profile/world',
      params: { id: 'world' },
    });

    expect(parse('/profile')).toStrictEqual({
      path: '/profile',
      params: { id: undefined },
    });
  });
});

describe('build path', () => {
  test('build root path', () => {
    const { build } = compile('/');

    expect(build()).toStrictEqual('/');
  });

  test('build path without parameters', () => {
    const { build } = compile('/profile');

    expect(build()).toBe('/profile');
  });

  test('build path with default string parameter', () => {
    const { build } = compile('/profile/:id');

    expect(build({ id: '123' })).toBe('/profile/123');
  });

  test('build path with generic parameter (number)', () => {
    const { build } = compile('/profile/:id<number>');

    expect(build({ id: 123 })).toBe('/profile/123');
  });

  test('build path with generic parameter (union)', () => {
    const { build } = compile('/profile/:id<hello|world>');

    expect(build({ id: 'hello' })).toBe('/profile/hello');
    expect(build({ id: 'world' })).toBe('/profile/world');
  });

  test('build path with default string parameter and modificator +', () => {
    const { build } = compile('/profile/:id+');

    expect(build({ id: ['123', '321'] })).toBe('/profile/123/321');
    expect(build({ id: ['123'] })).toBe('/profile/123');
  });

  test('build path with default string parameter and modificator *', () => {
    const { build } = compile('/profile/:id*');

    expect(build({ id: ['123', '321'] })).toBe('/profile/123/321');
    expect(build({ id: ['123'] })).toBe('/profile/123');
    expect(build({ id: [] })).toBe('/profile');
  });

  test('build path with default string parameter and modificator ?', () => {
    const { build } = compile('/profile/:id?');

    expect(build({ id: 'world' })).toBe('/profile/world');
    expect(build({ id: undefined })).toBe('/profile');
  });

  test('build path with generic parameter (number) and modificator +', () => {
    const { build } = compile('/profile/:id<number>+');

    expect(build({ id: [123, 321] })).toBe('/profile/123/321');
    expect(build({ id: [123] })).toBe('/profile/123');
  });

  test('build path with generic parameter (number) and modificator *', () => {
    const { build } = compile('/profile/:id<number>*');

    expect(build({ id: [123, 321] })).toBe('/profile/123/321');
    expect(build({ id: [123] })).toBe('/profile/123');
    expect(build({ id: [] })).toBe('/profile');
  });

  test('build path with generic parameter (number) and modificator ?', () => {
    const { build } = compile('/profile/:id<number>?');

    expect(build({ id: 123 })).toBe('/profile/123');
    expect(build({ id: undefined })).toBe('/profile');
  });

  test('build path with generic parameter (union) and modificator +', () => {
    const { build } = compile('/profile/:id<hello|world>+');

    expect(build({ id: ['hello', 'world'] })).toBe('/profile/hello/world');
    expect(build({ id: ['hello'] })).toBe('/profile/hello');
  });

  test('build path with generic parameter (union) and modificator *', () => {
    const { build } = compile('/profile/:id<hello|world>*');

    expect(build({ id: ['hello', 'world'] })).toBe('/profile/hello/world');
    expect(build({ id: ['hello'] })).toBe('/profile/hello');
    expect(build({ id: [] })).toBe('/profile');
  });

  test('build path with generic parameter (union) and modificator ?', () => {
    const { build } = compile('/profile/:id<hello|world>?');

    expect(build({ id: 'hello' })).toBe('/profile/hello');
    expect(build({ id: undefined })).toBe('/profile');
  });
});
