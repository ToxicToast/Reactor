import { status } from '@grpc/grpc-js';
import { ForbiddenException, type ArgumentsHost } from '@nestjs/common';
import { CorrelationContext } from '@toxictoast/shared-system';
import { ZodValidationException } from 'nestjs-zod';
import { z } from 'zod';
import { GrpcExceptionFilter } from './grpc-exception.filter.js';
import type { AccessDeniedReporter } from '../../security/services/index.js';

const CID = '01a16a00-3111-7049-8d8d-0db609f31f2a';

const grpcError = (code: status, details: string): Error => {
  return Object.assign(new Error(details), { code, details, metadata: {} });
};

describe('GrpcExceptionFilter', () => {
  let json: jest.Mock;
  let statusOf: jest.Mock;
  let report: jest.Mock;
  let host: ArgumentsHost;
  let filter: GrpcExceptionFilter;
  const correlations = new CorrelationContext();
  const request = { ip: '203.0.113.7' };

  beforeEach(() => {
    json = jest.fn();
    statusOf = jest.fn().mockReturnValue({ json });
    report = jest.fn();
    filter = new GrpcExceptionFilter(correlations, {
      report,
    } as unknown as AccessDeniedReporter);
    host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({ status: statusOf }),
      }),
    } as unknown as ArgumentsHost;
  });

  it.each([
    [status.NOT_FOUND, 404],
    [status.INVALID_ARGUMENT, 400],
    [status.FAILED_PRECONDITION, 409],
    [status.UNAUTHENTICATED, 401],
    [status.PERMISSION_DENIED, 403],
    [status.UNAVAILABLE, 503],
  ])('maps grpc code %p to http %p', (code, http) => {
    filter.catch(grpcError(code, 'Post p-1 not found'), host);

    expect(statusOf).toHaveBeenCalledWith(http);
    expect(json).toHaveBeenCalledWith({
      status_code: http,
      message: 'Post p-1 not found',
      correlation_id: null,
    });
  });

  it('answers http exceptions in snake_case', () => {
    filter.catch(new ForbiddenException('nope'), host);

    expect(statusOf).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      status_code: 403,
      message: 'nope',
      correlation_id: null,
    });
  });

  it('reduces zod errors to path and message', () => {
    const { error } = z
      .object({ id: z.uuid() })
      .safeParse({ id: 'keine-uuid' });

    filter.catch(new ZodValidationException(error), host);

    expect(json).toHaveBeenCalledWith({
      status_code: 400,
      message: 'validation failed',
      errors: [{ path: 'id', message: 'Invalid UUID' }],
      correlation_id: null,
    });
  });

  it('hides unexpected errors behind a neutral message', () => {
    filter.catch(new Error('db password wrong'), host);

    expect(json).toHaveBeenCalledWith({
      status_code: 500,
      message: 'internal server error',
      correlation_id: null,
    });
  });

  it('includes the correlation id of the request', () => {
    correlations.run(CID, () => {
      filter.catch(new ForbiddenException('nope'), host);
    });

    expect(json).toHaveBeenCalledWith({
      status_code: 403,
      message: 'nope',
      correlation_id: CID,
    });
  });

  it('hands every error to the access reporter', () => {
    filter.catch(
      grpcError(status.UNAUTHENTICATED, 'a signed-in actor is required'),
      host,
    );

    expect(report).toHaveBeenCalledWith(request, 401);
  });
});
