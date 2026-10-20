import type { GrpcMetadata } from '../interfaces/index.js';
import { actorFromMetadata } from './actor-from-metadata.function.js';

const metadata = (values: Record<string, string>): GrpcMetadata => {
  return {
    get: (key) => {
      if (key in values) {
        return [values[key]];
      }
      return [];
    },
  };
};

describe('actorFromMetadata', () => {
  it('reads type, id and ip', () => {
    const actor = actorFromMetadata(
      metadata({
        'x-actor-type': 'user',
        'x-actor-id': 'user-1',
        'x-actor-ip': '203.0.113.7',
      }),
    );

    expect(actor).toEqual({ type: 'user', id: 'user-1', ip: '203.0.113.7' });
  });

  it('is anonymous without metadata', () => {
    expect(actorFromMetadata(metadata({}))).toEqual({
      type: 'anonymous',
      id: null,
      ip: null,
    });
  });

  it('drops the id of unknown actor types but keeps the ip', () => {
    const actor = actorFromMetadata(
      metadata({
        'x-actor-type': 'admin',
        'x-actor-id': 'user-1',
        'x-actor-ip': '2001:db8::1',
      }),
    );

    expect(actor).toEqual({ type: 'anonymous', id: null, ip: '2001:db8::1' });
  });

  it('ignores invalid ips and oversized ids', () => {
    const actor = actorFromMetadata(
      metadata({
        'x-actor-type': 'user',
        'x-actor-id': 'x'.repeat(65),
        'x-actor-ip': 'not-an-ip',
      }),
    );

    expect(actor).toEqual({ type: 'user', id: null, ip: null });
  });
});
