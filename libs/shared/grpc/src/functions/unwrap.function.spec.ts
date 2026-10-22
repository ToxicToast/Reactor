import { status } from '@grpc/grpc-js';
import type { RpcException } from '@nestjs/microservices';
import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import { unwrap } from './unwrap.function.js';

describe('unwrap', () => {
  it('returns the value of a successful result', () => {
    expect(unwrap(Result.ok('value'))).toBe('value');
  });

  it('throws the mapped rpc exception of a failed result', () => {
    const result = Result.fail<string>(new NotFoundError('Tag', 'id-1'));

    try {
      unwrap(result);
      fail('expected an exception');
    } catch (error) {
      expect((error as RpcException).getError()).toMatchObject({
        code: status.NOT_FOUND,
      });
    }
  });
});
