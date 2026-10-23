import type { DomainContext } from '@toxictoast/shared-kernel';
import { CorrelationContext } from '@toxictoast/shared-system';
import type { Request, Response } from 'express';
import { CorrelationMiddleware } from './correlation.middleware.js';

const ID = '01a16a00-3111-7049-8d8d-0db609f31f2a';
const GENERATED = '01a16a00-0000-7000-8000-000000000001';

describe('CorrelationMiddleware', () => {
  let correlations: CorrelationContext;
  let middleware: CorrelationMiddleware;
  let setHeader: jest.Mock;

  const handle = (headers: Record<string, string>): string | null => {
    let seen: string | null = null;
    middleware.use(
      { headers } as unknown as Request,
      { setHeader } as unknown as Response,
      () => {
        seen = correlations.current();
      },
    );
    return seen;
  };

  beforeEach(() => {
    correlations = new CorrelationContext();
    setHeader = jest.fn();
    middleware = new CorrelationMiddleware(correlations, {
      id: { generate: () => GENERATED },
    } as unknown as DomainContext);
  });

  it('takes over a uuid sent by the client', () => {
    expect(handle({ 'x-correlation-id': ID })).toBe(ID);
    expect(setHeader).toHaveBeenCalledWith('x-correlation-id', ID);
  });

  it('replaces values that are not uuids', () => {
    expect(handle({ 'x-correlation-id': 'kaputt' })).toBe(GENERATED);
  });

  it('generates a correlation id when none is sent', () => {
    expect(handle({})).toBe(GENERATED);
    expect(setHeader).toHaveBeenCalledWith('x-correlation-id', GENERATED);
  });
});
