import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import { parseOptionalUuid } from './parse-optional-uuid.function.js';

describe('parseOptionalUuid', () => {
  it('returns the uuid in lower case', () => {
    expect(
      parseOptionalUuid(
        '01A16A00-CCCC-7000-8000-000000000001',
        'correlation_id',
      ),
    ).toBe('01a16a00-cccc-7000-8000-000000000001');
  });

  it.each([[undefined], ['']])('treats %p as missing', (value) => {
    expect(parseOptionalUuid(value, 'correlation_id')).toBeUndefined();
  });

  it('refuses values that are not uuids', () => {
    let error: unknown;
    try {
      parseOptionalUuid('kaputt', 'correlation_id');
    } catch (thrown) {
      error = thrown;
    }

    expect(error).toBeInstanceOf(RpcException);
    expect((error as RpcException).getError()).toEqual({
      code: status.INVALID_ARGUMENT,
      message: 'correlation_id must be a uuid',
    });
  });
});
