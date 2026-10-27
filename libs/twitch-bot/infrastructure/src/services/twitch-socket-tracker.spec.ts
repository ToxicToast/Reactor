import { TwitchSocketTracker } from './twitch-socket-tracker.service.js';

describe('TwitchSocketTracker', () => {
  let now: Date;
  let tracker: TwitchSocketTracker;

  beforeEach(() => {
    now = new Date('2026-10-27T12:00:00Z');
    tracker = new TwitchSocketTracker({ now: () => now });
  });

  it('starts a tracked socket as disconnected', () => {
    tracker.track('1', 'toxictoast');

    expect(tracker.snapshot()).toEqual([
      { twitch_id: '1', login: 'toxictoast', connected: false, since: now },
    ]);
  });

  it('remembers since when a socket has its current state', () => {
    tracker.track('1', 'toxictoast');
    const readyAt = new Date('2026-10-27T12:00:05Z');
    now = readyAt;
    tracker.connected('1');
    now = new Date('2026-10-27T12:10:00Z');
    tracker.connected('1');

    expect(tracker.snapshot()[0]).toMatchObject({
      connected: true,
      since: readyAt,
    });
  });

  it('keeps the state when a channel is tracked again', () => {
    tracker.track('1', 'toxictoast');
    tracker.connected('1');

    tracker.track('1', 'toxictoast');

    expect(tracker.snapshot()[0].connected).toBe(true);
  });

  it('finds sockets that are disconnected for too long', () => {
    tracker.track('1', 'toxictoast');
    tracker.track('2', 'codemechanicus');
    tracker.connected('2');

    expect(
      tracker
        .disconnectedSince(new Date('2026-10-27T12:00:00Z'))
        .map((socket) => socket.login),
    ).toEqual(['toxictoast']);
    expect(tracker.disconnectedSince(new Date('2026-10-27T11:59:00Z'))).toEqual(
      [],
    );
  });

  it('ignores unknown sockets and forgets stopped ones', () => {
    tracker.connected('9');
    tracker.track('1', 'toxictoast');

    tracker.forget('1');

    expect(tracker.snapshot()).toEqual([]);
  });
});
