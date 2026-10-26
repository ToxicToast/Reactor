import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { CorrelationContext, describeError } from '@toxictoast/shared-system';
import type { Request, Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import type { ZodError } from 'zod';
import { AccessDeniedReporter } from '../../security/services/index.js';
import { HTTP_STATUS_BY_GRPC_CODE } from '../constants/index.js';
import { isGrpcError } from '../functions/index.js';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GrpcExceptionFilter.name);

  constructor(
    private readonly correlations: CorrelationContext,
    private readonly reporter: AccessDeniedReporter,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const { statusCode, message, extra } = this.describe(exception);

    this.reporter.report(request, statusCode);
    response.status(statusCode).json({
      status_code: statusCode,
      message,
      ...extra,
      correlation_id: this.correlations.current(),
    });
  }

  private describe(exception: unknown): {
    statusCode: number;
    message: string;
    extra: object;
  } {
    if (exception instanceof ZodValidationException) {
      const { issues } = exception.getZodError() as ZodError;
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'validation failed',
        extra: {
          errors: issues.map((issue) => {
            return {
              path: issue.path.map(String).join('.'),
              message: issue.message,
            };
          }),
        },
      };
    }

    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        message: exception.message,
        extra: {},
      };
    }

    if (isGrpcError(exception)) {
      const statusCode =
        HTTP_STATUS_BY_GRPC_CODE[exception.code] ??
        HttpStatus.INTERNAL_SERVER_ERROR;
      if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error('Unexpected gRPC error', describeError(exception));
      }
      return { statusCode, message: exception.details, extra: {} };
    }

    this.logger.error('Unhandled error', describeError(exception));
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'internal server error',
      extra: {},
    };
  }
}
