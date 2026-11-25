import { createFixedTestContext } from '@toxictoast/shared-kernel/testing';
import { LinkFactory } from '../factories/index.js';

const ctx = createFixedTestContext(
  '0192f3a0-0000-7000-8000-00000000d001',
  () => new Date('2026-11-24T12:00:00Z'),
);

describe('LinkDomain', () => {
  const factory = new LinkFactory(ctx);

  it('creates an active link and normalizes the url', () => {
    const link = factory.createDomain({
      target_url: ' https://www.youtube.com/@ToxicToast ',
      description: '  ',
    }).value;

    expect(link.toAnemic()).toMatchObject({
      target_url: 'https://www.youtube.com/@ToxicToast',
      description: null,
      active: true,
    });
    expect(link.isResolvable).toBe(true);
    expect(link.toEvents().map((event) => event.event_name)).toEqual([
      'created',
    ]);
  });

  it('rejects urls without http or https', () => {
    const result = factory.createDomain({
      target_url: 'javascript:alert(1)',
      description: null,
    });

    expect(result.isFailure).toBe(true);
  });

  it('can be deactivated and is then no longer resolvable', () => {
    const link = factory.createDomain({
      target_url: 'https://twitch.tv/toxictoast',
      description: null,
    }).value;
    link.toEvents();

    const result = link.update({
      target_url: 'https://twitch.tv/toxictoast',
      description: null,
      active: false,
    });

    expect(result.isSuccess).toBe(true);
    expect(link.isResolvable).toBe(false);
    expect(link.toEvents().map((event) => event.event_name)).toEqual([
      'updated',
    ]);
  });

  it('does not raise an event without changes', () => {
    const link = factory.createDomain({
      target_url: 'https://twitch.tv/toxictoast',
      description: null,
    }).value;
    link.toEvents();

    link.update({
      target_url: 'https://twitch.tv/toxictoast',
      description: null,
      active: true,
    });

    expect(link.toEvents()).toEqual([]);
  });

  it('is not resolvable once deleted', () => {
    const link = factory.createDomain({
      target_url: 'https://twitch.tv/toxictoast',
      description: null,
    }).value;

    link.delete();

    expect(link.isResolvable).toBe(false);
  });
});
