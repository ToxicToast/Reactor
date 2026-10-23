import { Metadata } from '@grpc/grpc-js';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, of } from 'rxjs';
import type { ActorMetadata } from '../../grpc/services/index.js';
import { MediaGateway } from './media.gateway.js';

describe('MediaGateway', () => {
  const metadata = new Metadata();
  const client = {
    requestMediaUpload: jest
      .fn()
      .mockReturnValue(of({ upload_url: 'http://silo' })),
    confirmMediaUpload: jest.fn().mockReturnValue(of({ media: { id: 'm-1' } })),
  };
  const gateway = new MediaGateway(
    { getService: () => client } as unknown as ClientGrpc,
    { current: () => metadata } as unknown as ActorMetadata,
  );

  beforeAll(() => {
    gateway.onModuleInit();
  });

  it('forwards the upload request with the actor metadata', async () => {
    const request = {
      filename: 'hero.png',
      mime_type: 'image/png',
      size: 1024,
    };

    await lastValueFrom(gateway.requestUpload(request));

    expect(client.requestMediaUpload).toHaveBeenCalledWith(request, metadata);
  });

  it('wraps the id for confirm', async () => {
    await lastValueFrom(gateway.confirmUpload('m-1'));

    expect(client.confirmMediaUpload).toHaveBeenCalledWith(
      { id: 'm-1' },
      metadata,
    );
  });
});
