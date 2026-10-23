import { CorrelationContext } from './correlation-context.js';

const ID = '01a16a00-3111-7049-8d8d-0db609f31f2a';

describe('CorrelationContext', () => {
  it('has no correlation id outside of a run', () => {
    expect(new CorrelationContext().current()).toBeNull();
  });

  it('keeps the correlation id across async boundaries', async () => {
    const correlations = new CorrelationContext();

    const result = await correlations.run(ID, async () => {
      await Promise.resolve();
      return correlations.current();
    });

    expect(result).toBe(ID);
    expect(correlations.current()).toBeNull();
  });
});
