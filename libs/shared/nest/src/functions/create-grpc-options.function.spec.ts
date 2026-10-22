import { Transport } from '@nestjs/microservices';
import { createGrpcOptions } from './create-grpc-options.function.js';

describe('createGrpcOptions', () => {
  it('configures the loader to match the generated contracts', () => {
    const options = createGrpcOptions({
      package: 'blog.v1',
      protoPath: ['/protos/blog/v1/tag.proto'],
    });

    expect(options.transport).toBe(Transport.GRPC);
    expect(options.options).toMatchObject({
      package: 'blog.v1',
      protoPath: ['/protos/blog/v1/tag.proto'],
      loader: {
        keepCase: true,
        enums: String,
        longs: String,
        defaults: true,
        oneofs: false,
      },
    });
  });
});
