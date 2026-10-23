import { pkceChallenge } from './pkce-challenge.function.js';
import { safeReturnTo } from './safe-return-to.function.js';

describe('pkceChallenge', () => {
  it('matches the example from RFC 7636', () => {
    expect(pkceChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    );
  });
});

describe('safeReturnTo', () => {
  it('keeps paths inside the admin queues', () => {
    expect(safeReturnTo('/admin/queues/queue/blog')).toBe(
      '/admin/queues/queue/blog',
    );
  });

  it.each([
    ['https://evil.example'],
    ['//evil.example'],
    ['/api/v1/blog/posts'],
    [undefined],
  ])('falls back for %p', (value) => {
    expect(safeReturnTo(value)).toBe('/admin/queues');
  });
});
