import { Injectable, Logger } from '@nestjs/common';
import { RecordAccessDeniedUseCase } from '@toxictoast/security-application';
import { isAccessDeniedPayload } from '../functions/index.js';

@Injectable()
export class AccessDeniedHandler {
  private readonly logger = new Logger(AccessDeniedHandler.name);

  constructor(
    private readonly recordAccessDeniedUseCase: RecordAccessDeniedUseCase,
  ) {}

  async handle(payload: unknown): Promise<void> {
    if (!isAccessDeniedPayload(payload)) {
      this.logger.warn('Ignoring invalid security.access.denied payload');
      return;
    }

    const result = await this.recordAccessDeniedUseCase.execute({
      ip: payload.ip,
    });
    if (result.isFailure) {
      this.logger.warn(
        `Access denial for ${payload.ip} not recorded: ${result.error.message}`,
      );
      return;
    }

    const { ban, failed_attempts } = result.value;
    if (ban && failed_attempts > 0) {
      this.logger.warn(
        `Banned ${ban.ip} on level ${ban.level} until ${ban.banned_until.toISOString()}`,
      );
    }
  }
}
