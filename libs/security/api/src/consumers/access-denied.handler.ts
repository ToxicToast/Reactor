import { Injectable, Logger } from '@nestjs/common';
import { RecordAccessDeniedUseCase } from '@toxictoast/security-application';
import { readPayload } from '@toxictoast/shared-kernel';

@Injectable()
export class AccessDeniedHandler {
  private readonly logger = new Logger(AccessDeniedHandler.name);

  constructor(
    private readonly recordAccessDeniedUseCase: RecordAccessDeniedUseCase,
  ) {}

  async handle(payload: unknown): Promise<void> {
    const ip = readPayload(payload, (reader) => {
      // status_code wird nur geprüft, damit fremde Payloads nicht als Denial zählen
      reader.number('status_code');
      return reader.string('ip');
    });
    if (ip.isFailure) {
      this.logger.warn(
        `Ignoring invalid security.access.denied payload: ${ip.error.message}`,
      );
      return;
    }

    const result = await this.recordAccessDeniedUseCase.execute({
      ip: ip.value,
    });
    if (result.isFailure) {
      this.logger.warn(
        `Access denial for ${ip.value} not recorded: ${result.error.message}`,
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
