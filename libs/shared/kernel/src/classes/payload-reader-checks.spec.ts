import { InvalidPayloadError } from '../errors/invalid-payload.error.js';
import { PayloadReader } from './payload-reader.js';

describe('PayloadReader checks', () => {
  const reader = new PayloadReader({
    id: '0192F3A0-0000-7000-8000-000000000001',
    version: 2,
    fraction: 1.5,
    name: 'blog.tag',
    empty: '',
    verdict: 'spam',
    nested: { title: 'KI' },
    list: [1],
    raw: { type: 'ai' },
  });

  it('reads uuids in lower case', () => {
    expect(reader.uuid('id')).toBe('0192f3a0-0000-7000-8000-000000000001');
    expect(() => reader.uuid('name')).toThrow('name must be a uuid');
  });

  it('reads integers only', () => {
    expect(reader.integer('version')).toBe(2);
    expect(() => reader.integer('fraction')).toThrow(InvalidPayloadError);
  });

  it('reads strings within bounds', () => {
    expect(reader.boundedString('name', 8)).toBe('blog.tag');
    expect(() => reader.boundedString('name', 7)).toThrow(
      'name must have between 1 and 7 characters',
    );
    expect(() => reader.boundedString('empty', 7)).toThrow(InvalidPayloadError);
  });

  it('reads one of the allowed values', () => {
    expect(reader.oneOf('verdict', ['approved', 'spam'])).toBe('spam');
    expect(() => reader.oneOf('verdict', ['approved'])).toThrow(
      'verdict must be one of approved',
    );
  });

  it('reads nested objects', () => {
    expect(reader.record('nested').string('title')).toBe('KI');
    expect(reader.record('nested').object).toEqual({ title: 'KI' });
    expect(() => reader.record('list')).toThrow('list must be an object');
    expect(() => reader.record('missing')).toThrow(InvalidPayloadError);
  });

  it('hands out raw values unchecked', () => {
    expect(reader.value('raw')).toEqual({ type: 'ai' });
    expect(reader.value('missing')).toBeUndefined();
  });
});
