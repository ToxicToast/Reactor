import { decimalEnv } from './decimal-env.function.js';

describe('decimalEnv', () => {
  it('parses decimals', () => {
    expect(decimalEnv('X', undefined, { X: '0.85' })).toBe(0.85);
  });

  it('falls back when unset', () => {
    expect(decimalEnv('X', 0.9, {})).toBe(0.9);
  });

  it('throws without value and fallback', () => {
    expect(() => decimalEnv('X', undefined, {})).toThrow('Missing');
  });

  it('throws on non-numeric values', () => {
    expect(() => decimalEnv('X', undefined, { X: 'viel' })).toThrow(
      'must be a number',
    );
  });
});
