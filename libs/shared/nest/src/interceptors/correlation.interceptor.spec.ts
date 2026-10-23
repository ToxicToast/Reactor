import type { CallHandler, ExecutionContext } from '@nestjs/common';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { CorrelationContext } from '@toxictoast/shared-system';
import { defer, lastValueFrom } from 'rxjs';
import type { GrpcMetadata } from '../interfaces/index.js';
import { CorrelationInterceptor } from './correlation.interceptor.js';

const ID = '01a16a00-3111-7049-8d8d-0db609f31f2a';
const GENERATED = '01a16a00-0000-7000-8000-000000000001';

const rpc = (values: Record<string, string>): ExecutionContext => {
  const metadata: GrpcMetadata = {
    get: (key) => (key in values ? [values[key]] : []),
  };
  return {
    getType: () => 'rpc',
    switchToRpc: () => ({ getContext: () => metadata }),
  } as unknown as ExecutionContext;
};

describe('CorrelationInterceptor', () => {
  let correlations: CorrelationContext;
  let interceptor: CorrelationInterceptor;
  let next: CallHandler;

  beforeEach(() => {
    correlations = new CorrelationContext();
    const ctx = {
      id: { generate: () => GENERATED },
    } as unknown as DomainContext;
    interceptor = new CorrelationInterceptor(correlations, ctx);
    next = {
      handle: () =>
        defer(async () => {
          await Promise.resolve();
          return correlations.current();
        }),
    };
  });

  it('runs the handler with the correlation id from the metadata', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(rpc({ 'x-correlation-id': ID }), next),
    );

    expect(result).toBe(ID);
  });

  it('generates a correlation id when none is sent', async () => {
    const result = await lastValueFrom(interceptor.intercept(rpc({}), next));

    expect(result).toBe(GENERATED);
  });
});
