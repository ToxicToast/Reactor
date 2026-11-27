import type { OAuthAuthorizationUrl } from '../interfaces/index.js';
import { StartOAuthUseCase } from './start-oauth.usecase.js';

const REDIRECT = 'http://localhost:4000/admin/youtube/callback';

const auth: OAuthAuthorizationUrl = {
  authorizationUrl: (state, redirectUri, scopes) => {
    const params = new URLSearchParams({
      state,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
    });
    return `https://accounts.example.com/authorize?${params.toString()}`;
  },
};

describe('StartOAuthUseCase', () => {
  const useCase = new StartOAuthUseCase(auth, ['scope:a', 'scope:b']);

  it('builds the url with state, redirect and all scopes', async () => {
    const result = await useCase.execute({
      state: 'state-1',
      redirect_uri: REDIRECT,
    });

    const url = new URL(result.value.url);
    expect(url.searchParams.get('state')).toBe('state-1');
    expect(url.searchParams.get('redirect_uri')).toBe(REDIRECT);
    expect(url.searchParams.get('scope')).toBe('scope:a scope:b');
  });

  it.each([
    [{ state: ' ', redirect_uri: REDIRECT }],
    [{ state: 'state-1', redirect_uri: 'kein-link' }],
  ])('refuses %p', async (input) => {
    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
  });
});
