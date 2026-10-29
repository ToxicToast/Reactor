import { InvalidPayloadError } from '../errors/invalid-payload.error.js';
import { readPayload } from '../functions/read-payload.function.js';
import { PayloadReader } from './payload-reader.js';

describe('PayloadReader', () => {
  const reader = new PayloadReader({
    name: 'toast',
    count: 3,
    active: true,
    at: '2026-10-29T12:00:00Z',
    missing: null,
    items: [{ id: 'a' }, { id: 'b' }],
  });

  it('reads typed values', () => {
    expect(reader.string('name')).toBe('toast');
    expect(reader.number('count')).toBe(3);
    expect(reader.boolean('active')).toBe(true);
    expect(reader.date('at')).toEqual(new Date('2026-10-29T12:00:00Z'));
    expect(reader.list('items').map((item) => item.string('id'))).toEqual([
      'a',
      'b',
    ]);
  });

  it('reads missing and null values as null', () => {
    expect(reader.has('missing')).toBe(false);
    expect(reader.nullableString('missing')).toBeNull();
    expect(reader.nullableDate('unknown')).toBeNull();
  });

  it('rejects wrong types and non objects', () => {
    expect(() => reader.string('count')).toThrow(InvalidPayloadError);
    expect(() => reader.number('name')).toThrow(InvalidPayloadError);
    expect(() => reader.date('name')).toThrow(InvalidPayloadError);
    expect(() => new PayloadReader('nope')).toThrow(InvalidPayloadError);
    expect(() => new PayloadReader([1, 2])).toThrow(InvalidPayloadError);
  });
});

describe('readPayload', () => {
  it('returns the read value', () => {
    const result = readPayload({ ip: '203.0.113.7' }, (payload) => {
      return payload.string('ip');
    });

    expect(result.value).toBe('203.0.113.7');
  });

  it('turns invalid payloads into a validation failure', () => {
    const result = readPayload({}, (payload) => payload.string('ip'));

    expect(result.error.code).toBe('VALIDATION');
    expect(result.error.message).toBe('ip must be a string');
  });

  it('rethrows unexpected errors', () => {
    expect(() => {
      return readPayload({}, () => {
        throw new Error('boom');
      });
    }).toThrow('boom');
  });
});
