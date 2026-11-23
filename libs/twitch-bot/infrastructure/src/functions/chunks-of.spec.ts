import { chunksOf } from './chunks-of.function.js';

describe('chunksOf', () => {
  it('splits into chunks of the given size', () => {
    expect(chunksOf([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns nothing for an empty list', () => {
    expect(chunksOf([], 100)).toEqual([]);
  });
});
