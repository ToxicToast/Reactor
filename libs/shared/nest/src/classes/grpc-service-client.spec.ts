import type { ClientGrpc } from '@nestjs/microservices';
import { GrpcServiceClient } from './grpc-service-client.js';

describe('GrpcServiceClient', () => {
  const service = { ping: jest.fn() };
  let getService: jest.Mock;
  let client: GrpcServiceClient<typeof service>;

  beforeEach(() => {
    getService = jest.fn().mockReturnValue(service);
    client = new GrpcServiceClient<typeof service>(
      { getService } as unknown as ClientGrpc,
      'PingService',
    );
  });

  it('resolves the service lazily on first access', () => {
    expect(getService).not.toHaveBeenCalled();

    expect(client.service).toBe(service);
    expect(getService).toHaveBeenCalledWith('PingService');
  });

  it('resolves the service only once', () => {
    void client.service;
    void client.service;

    expect(getService).toHaveBeenCalledTimes(1);
  });
});
