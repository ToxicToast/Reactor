import { status } from '@grpc/grpc-js';
import { grpcCode } from '../testing/index.js';
import { mapEnum } from './map-enum.function.js';
import { mapOptionalEnum } from './map-optional-enum.function.js';

type Proto = 'COLOR_UNSPECIFIED' | 'COLOR_RED';

const TABLE: Record<Proto, 'red' | null> = {
  COLOR_UNSPECIFIED: null,
  COLOR_RED: 'red',
};

describe('mapEnum', () => {
  it('maps a known value', () => {
    expect(mapEnum(TABLE, 'COLOR_RED', 'color')).toBe('red');
  });

  it('rejects UNSPECIFIED with INVALID_ARGUMENT', async () => {
    const call = Promise.resolve().then(() => {
      return mapEnum(TABLE, 'COLOR_UNSPECIFIED', 'color');
    });

    expect(await grpcCode(call)).toBe(status.INVALID_ARGUMENT);
  });

  it('rejects an unknown value with INVALID_ARGUMENT', async () => {
    const call = Promise.resolve().then(() => {
      return mapEnum(TABLE, 'COLOR_BLUE' as Proto, 'color');
    });

    expect(await grpcCode(call)).toBe(status.INVALID_ARGUMENT);
  });
});

describe('mapOptionalEnum', () => {
  it('keeps undefined', () => {
    expect(mapOptionalEnum(TABLE, undefined, 'color')).toBeUndefined();
  });

  it('maps a given value', () => {
    expect(mapOptionalEnum(TABLE, 'COLOR_RED', 'color')).toBe('red');
  });
});
