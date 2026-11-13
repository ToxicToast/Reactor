import { retentionCutoff } from './retention-cutoff.function.js';

describe('retentionCutoff', () => {
  it('goes back the given number of days', () => {
    expect(retentionCutoff(new Date('2026-11-11T03:45:00Z'), 365)).toEqual(
      new Date('2025-11-11T03:45:00Z'),
    );
  });
});
