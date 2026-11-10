import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import type { Optional } from '@toxictoast/shared-types';
import { parseDate } from './parse-date.function.js';
import { requireDate } from './require-date.function.js';
import { toIso } from './to-iso.function.js';

const codeOf = (work: () => unknown): Optional<number> => {
  try {
    work();
    return undefined;
  } catch (error) {
    if (error instanceof RpcException) {
      return (error.getError() as { code: number }).code;
    }
    throw error;
  }
};

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
    expect(codeOf(() => parseDate('gestern', 'published_at'))).toBe(
      status.INVALID_ARGUMENT,
    );
  });
});

describe('requireDate', () => {
  it('parses an ISO date', () => {
    expect(requireDate('2026-10-20T12:00:00Z', 'from')).toEqual(
      new Date('2026-10-20T12:00:00Z'),
    );
  });

  it.each([undefined, '', 'gestern'])(
    'rejects %p with INVALID_ARGUMENT',
    (value) => {
      expect(codeOf(() => requireDate(value, 'from'))).toBe(
        status.INVALID_ARGUMENT,
      );
    },
  );
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
