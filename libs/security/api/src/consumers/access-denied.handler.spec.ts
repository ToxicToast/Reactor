import { RecordAccessDeniedUseCase } from '@toxictoast/security-application';
import { Result } from '@toxictoast/shared-kernel';
import { AccessDeniedHandler } from './access-denied.handler.js';

describe('AccessDeniedHandler', () => {
  let execute: jest.Mock;
  let handler: AccessDeniedHandler;

  beforeEach(() => {
    execute = jest
      .fn()
      .mockResolvedValue(Result.ok({ failed_attempts: 1, ban: null }));
    handler = new AccessDeniedHandler({
      execute,
    } as unknown as RecordAccessDeniedUseCase);
  });

  it('records the ip of a denied request', async () => {
    await handler.handle({
      ip: '203.0.113.7',
      status_code: 401,
      method: 'POST',
      path: '/api/v1/blog/posts',
      user_agent: null,
    });

    expect(execute).toHaveBeenCalledWith({ ip: '203.0.113.7' });
  });

  it('ignores invalid payloads', async () => {
    await handler.handle({ status_code: 401 });

    expect(execute).not.toHaveBeenCalled();
  });
});
