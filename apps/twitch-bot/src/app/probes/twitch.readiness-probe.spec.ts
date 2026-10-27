import {
  TwitchCredentialsCheck,
  TwitchSocketTracker,
} from '@toxictoast/twitch-bot-infrastructure';
import { TwitchReadinessProbe } from './twitch.readiness-probe.js';

describe('TwitchReadinessProbe', () => {
  let now: Date;
  let sockets: TwitchSocketTracker;
  let requestToken: jest.Mock;
  let probe: TwitchReadinessProbe;

  beforeEach(() => {
    now = new Date('2026-10-27T12:00:00Z');
    const clock = { now: () => now };
    sockets = new TwitchSocketTracker(clock);
    requestToken = jest.fn().mockResolvedValue({});
    probe = new TwitchReadinessProbe(
      new TwitchCredentialsCheck(requestToken, clock),
      sockets,
      clock,
    );
  });

  it('is up without channels when the credentials are valid', async () => {
    await expect(probe.probe()).resolves.toEqual({
      up: true,
      details: { credentials: 'valid', channels: [] },
    });
  });

  it('is down when the credentials are invalid', async () => {
    requestToken.mockRejectedValue(new Error('invalid client'));

    await expect(probe.probe()).resolves.toMatchObject({
      up: false,
      details: { credentials: 'invalid client' },
    });
  });

  it('gives a disconnected socket 60 seconds to reconnect', async () => {
    sockets.track('1', 'toxictoast');

    now = new Date('2026-10-27T12:00:59Z');
    expect((await probe.probe()).up).toBe(true);

    now = new Date('2026-10-27T12:01:00Z');
    expect((await probe.probe()).up).toBe(false);

    sockets.connected('1');
    expect((await probe.probe()).up).toBe(true);
  });
});
