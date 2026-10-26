import { TWITCH_BOT_SCOPES } from '@toxictoast/twitch-bot-application';
import { TwurpleTwitchAuthClient } from './twurple-twitch-auth-client.service.js';

describe('TwurpleTwitchAuthClient', () => {
  it('builds the twitch authorization url', () => {
    const client = new TwurpleTwitchAuthClient({
      clientId: 'client',
      clientSecret: 'secret',
    });

    const url = new URL(
      client.authorizationUrl(
        'state-1',
        'http://localhost:4000/admin/twitch/callback',
        TWITCH_BOT_SCOPES,
      ),
    );

    expect(`${url.origin}${url.pathname}`).toBe(
      'https://id.twitch.tv/oauth2/authorize',
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: 'client',
      redirect_uri: 'http://localhost:4000/admin/twitch/callback',
      response_type: 'code',
      scope: TWITCH_BOT_SCOPES.join(' '),
      state: 'state-1',
      force_verify: 'true',
    });
  });
});
