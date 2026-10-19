import { contractsGrpc } from './contracts-grpc.js';

describe('contractsGrpc', () => {
  it('should work', () => {
    expect(contractsGrpc()).toEqual('contracts-grpc');
  });
});
