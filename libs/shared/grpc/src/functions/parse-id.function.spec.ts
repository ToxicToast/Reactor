import { status } from '@grpc/grpc-js';
import type { RpcException } from '@nestjs/microservices';
import { parseId } from './parse-id.function.js';
import { parseOptionalId } from './parse-optional-id.function.js';

const ID = '0192f3a0-0000-7000-8000-000000000001';

const codeOf = (call: () => unknown): unknown => {
  try {
    call();
    return 'no error';
  } catch (error) {
    return ((error as RpcException).getError() as { code: number }).code;
  }
};

describe('parseId', () => {
  it('accepts a uuid and lowercases it', () => {
    expect(parseId(ID.toUpperCase())).toBe(ID);
  });

  it.each(['', 'abc', `${ID}0`, 'not-a-uuid-at-all-0000000000000000'])(
    'rejects "%s" with INVALID_ARGUMENT',
    (value) => {
      expect(codeOf(() => parseId(value))).toBe(status.INVALID_ARGUMENT);
    },
  );

  it('names the field in the message', () => {
    try {
      parseId('abc', 'post_id');
    } catch (error) {
      expect((error as RpcException).message).toContain('post_id');
    }
  });
});

describe('parseOptionalId', () => {
  it.each([undefined, ''])('turns %p into null', (value) => {
    expect(parseOptionalId(value, 'parent_id')).toBeNull();
  });

  it('parses a given id', () => {
    expect(parseOptionalId(ID, 'parent_id')).toBe(ID);
  });

  it('rejects an invalid id', () => {
    expect(codeOf(() => parseOptionalId('abc', 'parent_id'))).toBe(
      status.INVALID_ARGUMENT,
    );
  });
});
