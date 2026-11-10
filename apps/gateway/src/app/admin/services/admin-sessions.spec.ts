import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ActorType } from '@toxictoast/shared-kernel';
import type { Request } from 'express';
import type { AdminAuthConfig } from '../interfaces/index.js';
import { AdminSessions } from './admin-sessions.service.js';
import { SealedCookie } from './sealed-cookie.service.js';

describe('AdminSessions', () => {
  const cookies = new SealedCookie({
    sessionSecret: new Uint8Array(32).fill(7),
  } as AdminAuthConfig);
  const sessions = new AdminSessions(cookies);

  const request = async (permissions?: Array<string>): Promise<Request> => {
    const cookie = permissions
      ? `azk_admin=${await cookies.seal({ sub: 'user-1', permissions }, 60)}`
      : undefined;
    return { headers: { cookie }, ip: '203.0.113.7' } as unknown as Request;
  };

  it('requires a session', async () => {
    await expect(
      sessions.requireActor(await request(), 'twitch.stats.read'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('requires the permission', async () => {
    await expect(
      sessions.requireActor(
        await request(['blog.post.write']),
        'twitch.stats.read',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('turns the session into an actor', async () => {
    const actor = await sessions.requireActor(
      await request(['twitch.stats.read']),
      'twitch.stats.read',
    );

    expect(actor).toEqual({
      type: ActorType.USER,
      id: 'user-1',
      ip: '203.0.113.7',
      permissions: ['twitch.stats.read'],
    });
  });
});
