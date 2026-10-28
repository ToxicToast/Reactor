import { errorMessage } from './error-message.function.js';

describe('errorMessage', () => {
  it('takes the message of an error', () => {
    expect(errorMessage(new Error('timeout'))).toBe('timeout');
  });

  it.each([
    ['kaputt', 'kaputt'],
    [404, '404'],
    [null, 'null'],
  ])('stringifies %p', (value, expected) => {
    expect(errorMessage(value)).toBe(expected);
  });
});
