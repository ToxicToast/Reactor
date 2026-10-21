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
  it('reads type, id, ip and permissions', () => {
    const actor = actorFromMetadata(
      metadata({
        'x-actor-type': 'user',
        'x-actor-id': 'user-1',
        'x-actor-ip': '203.0.113.7',
        'x-actor-permissions': 'blog.comment.write, blog.post.write',
      }),
    );

    expect(actor).toEqual({
      type: 'user',
      id: 'user-1',
      ip: '203.0.113.7',
      permissions: ['blog.comment.write', 'blog.post.write'],
    });
  });

  it('is anonymous without metadata', () => {
    expect(actorFromMetadata(metadata({}))).toEqual({
      type: 'anonymous',
      id: null,
      ip: null,
      permissions: [],
    });
  });

  it('never grants id or permissions to unknown or anonymous actors', () => {
    const unknown = actorFromMetadata(
      metadata({
        'x-actor-type': 'admin',
        'x-actor-id': 'user-1',
        'x-actor-ip': '2001:db8::1',
        'x-actor-permissions': 'blog.post.write',
      }),
    );
    const anonymous = actorFromMetadata(
      metadata({
        'x-actor-type': 'anonymous',
        'x-actor-id': 'user-1',
        'x-actor-permissions': 'blog.post.write',
      }),
    );

    expect(unknown).toEqual({
      type: 'anonymous',
      id: null,
      ip: '2001:db8::1',
      permissions: [],
    });
    expect(anonymous.permissions).toEqual([]);
    expect(anonymous.id).toBeNull();
  });

  it('ignores invalid ips, oversized ids, empty and duplicate permissions', () => {
    const actor = actorFromMetadata(
      metadata({
        'x-actor-type': 'user',
        'x-actor-id': 'x'.repeat(65),
        'x-actor-ip': 'not-an-ip',
        'x-actor-permissions': 'blog.post.write,, blog.post.write ,',
      }),
    );

    expect(actor).toEqual({
      type: 'user',
      id: null,
      ip: null,
      permissions: ['blog.post.write'],
    });
  });
});
