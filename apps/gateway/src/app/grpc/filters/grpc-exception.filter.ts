import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { describeError } from '@toxictoast/shared-system';
import type { Response } from 'express';
import { HTTP_STATUS_BY_GRPC_CODE } from '../constants/index.js';
import { isGrpcError } from '../functions/index.js';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GrpcExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ZodValidationException) {
      const { issues } = exception.getZodError() as ZodError;
      response.status(HttpStatus.BAD_REQUEST).json({
        status_code: HttpStatus.BAD_REQUEST,
        message: 'validation failed',
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
      const statusCode = exception.getStatus();
      response.status(statusCode).json({
        status_code: statusCode,
        message: exception.message,
      });
      return;
    }

    if (isGrpcError(exception)) {
      const statusCode =
        HTTP_STATUS_BY_GRPC_CODE[exception.code] ??
        HttpStatus.INTERNAL_SERVER_ERROR;
      if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error('Unexpected gRPC error', describeError(exception));
      }
      response.status(statusCode).json({
        status_code: statusCode,
        message: exception.details,
      });
      return;
    }

    this.logger.error('Unhandled error', describeError(exception));
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'internal server error',
    });
  }
}
