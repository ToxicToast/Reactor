import { Injectable, Logger } from '@nestjs/common';
import { RecordAuditEventUseCase } from '@toxictoast/audit-application';
import { auditInputFromEvent, isAuditableEvent } from '../functions/index.js';

@Injectable()
export class AuditEventHandler {
  private readonly logger = new Logger(AuditEventHandler.name);

  constructor(
    private readonly recordAuditEventUseCase: RecordAuditEventUseCase,
  ) {}

  async handle(event: unknown): Promise<void> {
    if (!isAuditableEvent(event)) {
      this.logger.warn('Ignoring an event that cannot be audited');
      return;
    }
    await this.recordAuditEventUseCase.execute(auditInputFromEvent(event));
  }
}
