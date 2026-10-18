import { err, ok } from './result.js';

describe('Result', () => {
  it('wraps a success value', () => {
    const result = ok(42);

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toBe(42);
  });

  it('wraps an error value', () => {
    const result = err({ code: 'boom' });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toEqual({ code: 'boom' });
  });
});
