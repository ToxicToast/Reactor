import { HttpStatus, Logger } from '@nestjs/common';
import { describeError } from '@toxictoast/shared-system';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Socket } from 'node:net';

const logger = new Logger('AdminProxy');

export const proxyErrorHandler = (
  error: Error,
  _request: IncomingMessage,
  response: ServerResponse | Socket,
): void => {
  logger.error('Admin upstream is not reachable', describeError(error));
  if (!('writeHead' in response) || response.headersSent) {
    response.end();
    return;
  }

  response.writeHead(HttpStatus.BAD_GATEWAY, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(
    JSON.stringify({
      status_code: HttpStatus.BAD_GATEWAY,
      message: 'admin upstream is not reachable',
    }),
  );
};
