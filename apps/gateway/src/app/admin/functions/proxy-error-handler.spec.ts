import type { IncomingMessage, ServerResponse } from 'node:http';
import { proxyErrorHandler } from './proxy-error-handler.function.js';

describe('proxyErrorHandler', () => {
  it('answers with 502 in the usual error format', () => {
    const writeHead = jest.fn();
    const end = jest.fn();
    const response = {
      writeHead,
      end,
      headersSent: false,
    } as unknown as ServerResponse;

    proxyErrorHandler(
      new Error('connect ECONNREFUSED 127.0.0.1:3335'),
      {} as IncomingMessage,
      response,
    );

    expect(writeHead).toHaveBeenCalledWith(502, {
      'Content-Type': 'application/json; charset=utf-8',
    });
    expect(JSON.parse(end.mock.calls[0][0])).toEqual({
      status_code: 502,
      message: 'admin upstream is not reachable',
    });
  });
});
