import { status } from '@grpc/grpc-js';
import type { RpcException } from '@nestjs/microservices';
import { parseDate } from './parse-date.function.js';
import { toIso } from './to-iso.function.js';

describe('parseDate', () => {
  it('parses an ISO date', () => {
    expect(parseDate('2026-10-20T12:00:00Z', 'published_at')).toEqual(
      new Date('2026-10-20T12:00:00Z'),
    );
  });

  it.each([undefined, ''])('turns %p into undefined', (value) => {
    expect(parseDate(value, 'published_at')).toBeUndefined();
  });

  it('rejects an invalid date with INVALID_ARGUMENT', () => {
    try {
      parseDate('gestern', 'published_at');
      fail('expected an exception');
    } catch (error) {
      expect((error as RpcException).getError()).toMatchObject({
        code: status.INVALID_ARGUMENT,
      });
    }
  });
});

describe('toIso', () => {
  it('formats a date', () => {
    expect(toIso(new Date('2026-10-20T12:00:00Z'))).toBe(
      '2026-10-20T12:00:00.000Z',
    );
  });

  it('turns null into undefined', () => {
    expect(toIso(null)).toBeUndefined();
  });
});
