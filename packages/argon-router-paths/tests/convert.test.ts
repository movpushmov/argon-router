import { describe, expect, test } from 'vitest';
import { convertPath } from '../lib';

describe('convert paths', () => {
  test('const path', () => {
    expect(convertPath('/', 'express')).toStrictEqual('/');
  });

  test('path with params', () => {
    expect(convertPath('/:id', 'express')).toStrictEqual('/:id');
  });

  test('path with wildcard (+)', () => {
    expect(convertPath('/:id+', 'express')).toStrictEqual('/*id');
  });

  test('path with wildcard (*)', () => {
    expect(convertPath('/:id*', 'express')).toStrictEqual('/*id');
  });

  test('path with nullable params', () => {
    expect(convertPath('/:id?', 'express')).toStrictEqual('/{:id}');
  });

  test('path with nullable params', () => {
    expect(convertPath('/files/:id?', 'express')).toStrictEqual('/files{/:id}');
  });

  test('path with generics', () => {
    expect(convertPath('/files/:id<number>', 'express')).toStrictEqual(
      '/files/:id',
    );
  });

  test('path with nullable generics', () => {
    expect(convertPath('/files/:id<number>?', 'express')).toStrictEqual(
      '/files{/:id}',
    );
  });

  test('path with ranges', () => {
    expect(convertPath('/files/:id{1,2}', 'express')).toStrictEqual(
      '/files/*id',
    );
  });

  test('path with nullable ranges', () => {
    expect(convertPath('/files/:id{1,2}?', 'express')).toMatch('/files{/*id}');
  });
});
