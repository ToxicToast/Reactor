import { status } from '@grpc/grpc-js';
import { grpcCode } from '../testing/index.js';
import { parseMask } from './parse-mask.function.js';

const FIELDS = ['title', 'content'] as const;

describe('parseMask', () => {
  it('returns the fields of the mask', () => {
    const mask = parseMask(['title'], FIELDS);

    expect(mask.has('title')).toBe(true);
    expect(mask.has('content')).toBe(false);
  });

  it('accepts an empty mask', () => {
    expect(parseMask([], FIELDS).size).toBe(0);
  });

  it('rejects unknown fields with INVALID_ARGUMENT', async () => {
    const call = Promise.resolve().then(() => {
      return parseMask(['title', 'titel'], FIELDS);
    });

    expect(await grpcCode(call)).toBe(status.INVALID_ARGUMENT);
  });
});
