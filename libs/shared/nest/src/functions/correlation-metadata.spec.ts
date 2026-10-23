import { Metadata } from '@grpc/grpc-js';
import { addCorrelationMetadata } from './add-correlation-metadata.function.js';
import { correlationFromMetadata } from './correlation-from-metadata.function.js';

const ID = '01a16a00-3111-7049-8d8d-0db609f31f2a';

describe('correlation metadata', () => {
  it('round-trips the correlation id', () => {
    const metadata = addCorrelationMetadata(new Metadata(), ID);

    expect(correlationFromMetadata(metadata)).toBe(ID);
  });

  it('adds nothing without a correlation id', () => {
    const metadata = addCorrelationMetadata(new Metadata(), null);

    expect(metadata.get('x-correlation-id')).toEqual([]);
  });

  it('ignores values that are not uuids', () => {
    const metadata = new Metadata();
    metadata.set('x-correlation-id', 'drop table;');

    expect(correlationFromMetadata(metadata)).toBeNull();
  });
});
