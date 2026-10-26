import { HttpStatus } from '@nestjs/common';

export const REPORTED_STATUS_CODES: ReadonlySet<number> = new Set([
  HttpStatus.BAD_REQUEST,
  HttpStatus.UNAUTHORIZED,
  HttpStatus.FORBIDDEN,
]);
