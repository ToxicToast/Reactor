import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { CorrelationContext, describeError } from '@toxictoast/shared-system';
import type { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import type { ZodError } from 'zod';
import { HTTP_STATUS_BY_GRPC_CODE } from '../constants/index.js';
import { isGrpcError } from '../functions/index.js';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GrpcExceptionFilter.name);

  constructor(private readonly correlations: CorrelationContext) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ZodValidationException) {
      const { issues } = exception.getZodError() as ZodError;
      this.send(response, HttpStatus.BAD_REQUEST, 'validation failed', {
        errors: issues.map((issue) => {
          return {
            path: issue.path.map(String).join('.'),
            message: issue.message,
          };
        }),
      });
      return;
    }

    if (exception instanceof HttpException) {
      this.send(response, exception.getStatus(), exception.message);
      return;
    }

    if (isGrpcError(exception)) {
      const statusCode =
        HTTP_STATUS_BY_GRPC_CODE[exception.code] ??
        HttpStatus.INTERNAL_SERVER_ERROR;
      if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error('Unexpected gRPC error', describeError(exception));
      }
      this.send(response, statusCode, exception.details);
      return;
    }

    this.logger.error('Unhandled error', describeError(exception));
    this.send(
      response,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'internal server error',
    );
  }

  private send(
    response: Response,
    statusCode: number,
    message: string,
    extra: object = {},
  ): void {
    response.status(statusCode).json({
      status_code: statusCode,
      message,
      ...extra,
      correlation_id: this.correlations.current(),
    });
  }
}
