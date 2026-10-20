import { numberEnv } from './number-env.function.js';
import { optionalEnv } from './optional-env.function.js';
import { requiredEnv } from './required-env.function.js';

const SOURCE: NodeJS.ProcessEnv = {
  HOST: 'postgres',
  PORT: '5432',
  EMPTY: '',
  BROKEN: 'abc',
};

describe('requiredEnv', () => {
  it('returns a set variable', () => {
    expect(requiredEnv('HOST', SOURCE)).toBe('postgres');
  });

  it.each(['MISSING', 'EMPTY'])('throws when %s is not set', (name) => {
    expect(() => requiredEnv(name, SOURCE)).toThrow(name);
  });
});

describe('optionalEnv', () => {
  it('returns a set variable', () => {
    expect(optionalEnv('HOST', 'localhost', SOURCE)).toBe('postgres');
  });

  it('returns the fallback for a missing or empty variable', () => {
    expect(optionalEnv('MISSING', 'localhost', SOURCE)).toBe('localhost');
    expect(optionalEnv('EMPTY', 'localhost', SOURCE)).toBe('localhost');
  });
});

describe('numberEnv', () => {
  it('parses an integer', () => {
    expect(numberEnv('PORT', undefined, SOURCE)).toBe(5432);
  });

  it('returns the fallback for a missing variable', () => {
    expect(numberEnv('MISSING', 5432, SOURCE)).toBe(5432);
  });

  it('throws for a missing variable without fallback', () => {
    expect(() => numberEnv('MISSING', undefined, SOURCE)).toThrow('MISSING');
  });

  it('throws for a value that is not an integer', () => {
    expect(() => numberEnv('BROKEN', 5432, SOURCE)).toThrow('integer');
  });
});
