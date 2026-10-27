import { Metadata } from '@grpc/grpc-js';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, of } from 'rxjs';
import type { RequestMetadata } from '../../grpc/services/index.js';
import { TagGateway } from './tag.gateway.js';

describe('TagGateway', () => {
  const metadata = new Metadata();
  const client = {
    createTag: jest.fn().mockReturnValue(of({ tag: { id: 't-1' } })),
    deleteTag: jest.fn().mockReturnValue(of({ tag: { id: 't-1' } })),
  };
  const gateway = new TagGateway(
    { getService: () => client } as unknown as ClientGrpc,
    { current: () => metadata } as unknown as RequestMetadata,
  );

  beforeAll(() => {
    gateway.onModuleInit();
  });

  it('forwards the request with the actor metadata', async () => {
    await lastValueFrom(gateway.create({ title: 'NestJS' }));

    expect(client.createTag).toHaveBeenCalledWith(
      { title: 'NestJS' },
      metadata,
    );
  });

  it('wraps the id for delete', async () => {
    await lastValueFrom(gateway.delete('t-1'));

    expect(client.deleteTag).toHaveBeenCalledWith({ id: 't-1' }, metadata);
  });
});
