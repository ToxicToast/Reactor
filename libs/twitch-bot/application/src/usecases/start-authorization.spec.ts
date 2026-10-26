import { FakeTwitchAuthClient } from '../testing/index.js';
import { StartAuthorizationUseCase } from './start-authorization.usecase.js';

const REDIRECT = 'http://localhost:4000/admin/twitch/callback';

describe('StartAuthorizationUseCase', () => {
  const useCase = new StartAuthorizationUseCase(new FakeTwitchAuthClient());

  it('builds the twitch url with state, redirect and all scopes', async () => {
    const result = await useCase.execute({
      state: 'state-1',
      redirect_uri: REDIRECT,
    });

    const url = new URL(result.value.url);
    expect(url.searchParams.get('state')).toBe('state-1');
    expect(url.searchParams.get('redirect_uri')).toBe(REDIRECT);
    expect(url.searchParams.get('scope')).toContain('user:read:chat');
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
