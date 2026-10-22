import { isUuid } from './is-uuid.function.js';

describe('isUuid', () => {
  it.each([
    '0192f3a0-0000-7000-8000-000000000001',
    '0192F3A0-0000-7000-8000-000000000001',
  ])('accepts %s', (value) => {
    expect(isUuid(value)).toBe(true);
  });

  it.each(['', 'abc', '0192f3a0-0000-7000-8000-0000000000011', undefined, 42])(
    'rejects %p',
    (value) => {
      expect(isUuid(value)).toBe(false);
    },
  );
});
