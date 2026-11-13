import { Injectable, Logger } from '@nestjs/common';
import { RecordAuditEventUseCase } from '@toxictoast/audit-application';
import { auditInputFromEvent } from '../functions/index.js';

@Injectable()
export class AuditEventHandler {
  private readonly logger = new Logger(AuditEventHandler.name);

  constructor(
    private readonly recordAuditEventUseCase: RecordAuditEventUseCase,
  ) {}

  async handle(event: unknown): Promise<void> {
    const input = auditInputFromEvent(event);
    if (input.isFailure) {
      this.logger.warn(
        `Ignoring an event that cannot be audited: ${input.error.message}`,
      );
      return;
    }
    await this.recordAuditEventUseCase.execute(input.value);
  }
}
