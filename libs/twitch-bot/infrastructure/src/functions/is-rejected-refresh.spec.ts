import { isRejectedRefresh } from './is-rejected-refresh.function.js';

describe('isRejectedRefresh', () => {
  it.each([[400], [401]])('treats status %p as rejected', (statusCode) => {
    expect(isRejectedRefresh({ statusCode, message: 'Invalid' })).toBe(true);
  });

  it.each([
    [{ statusCode: 500 }],
    [{ statusCode: '400' }],
    [new Error('socket hang up')],
    [null],
    ['kaputt'],
  ])('keeps the authorization for %p', (error) => {
    expect(isRejectedRefresh(error)).toBe(false);
  });
});
