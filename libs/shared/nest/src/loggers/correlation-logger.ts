import { ConsoleLogger } from '@nestjs/common';
import type { CorrelationContext } from '@toxictoast/shared-system';

export class CorrelationLogger extends ConsoleLogger {
  constructor(private readonly correlations: CorrelationContext) {
    super();
  }

  protected override formatContext(context: string): string {
    const formatted = super.formatContext(context);
    const correlationId = this.correlations.current();
    if (!correlationId) {
      return formatted;
    }
    return `${formatted}[cid:${correlationId}] `;
  }
}
