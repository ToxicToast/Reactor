import { Metadata } from '@grpc/grpc-js';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, of } from 'rxjs';
import type { ActorMetadata } from '../../grpc/services/index.js';
import { BanGateway } from './ban.gateway.js';

describe('BanGateway', () => {
  const metadata = new Metadata();
  const client = {
    listBans: jest.fn().mockReturnValue(of({ bans: [] })),
    unbanIp: jest.fn().mockReturnValue(of({ ban: { id: 'ban-1' } })),
  };
  const gateway = new BanGateway(
    { getService: () => client } as unknown as ClientGrpc,
    { current: () => metadata } as unknown as ActorMetadata,
  );

  beforeAll(() => {
    gateway.onModuleInit();
  });

  it('forwards the list request with the actor metadata', async () => {
    await lastValueFrom(gateway.list({ active_only: true, limit: 20 }));

    expect(client.listBans).toHaveBeenCalledWith(
      { active_only: true, limit: 20 },
      metadata,
    );
  });

  it('wraps the ip for unban', async () => {
    await lastValueFrom(gateway.unban('::1'));

    expect(client.unbanIp).toHaveBeenCalledWith({ ip: '::1' }, metadata);
  });
});
