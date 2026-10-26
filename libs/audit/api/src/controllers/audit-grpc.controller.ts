import { Controller } from '@nestjs/common';
import {
  ListAuditEventsUseCase,
  PurgeExpiredAuditEventsUseCase,
} from '@toxictoast/audit-application';
import {
  AuditPermission,
  AuditServiceControllerMethods,
  type AuditServiceController,
  type ListEventsRequest,
  type ListEventsResponse,
  type PurgeExpiredEventsResponse,
} from '@toxictoast/contracts-grpc';
import {
  parseDate,
  parseOptionalUuid,
  requirePermission,
  unwrap,
} from '@toxictoast/shared-grpc';
import { ActorProvider } from '@toxictoast/shared-kernel';
import { AuditEventGrpcMapper } from '../mappers/index.js';

@Controller()
@AuditServiceControllerMethods()
export class AuditGrpcController implements AuditServiceController {
  private readonly mapper = new AuditEventGrpcMapper();

  constructor(
    private readonly listAuditEventsUseCase: ListAuditEventsUseCase,
    private readonly purgeExpiredAuditEventsUseCase: PurgeExpiredAuditEventsUseCase,
    private readonly actors: ActorProvider,
  ) {}

  async listEvents(request: ListEventsRequest): Promise<ListEventsResponse> {
    requirePermission(this.actors.current(), AuditPermission.READ);
    const events = unwrap(
      await this.listAuditEventsUseCase.execute({
        correlation_id: parseOptionalUuid(
          request.correlation_id,
          'correlation_id',
        ),
        actor_id: request.actor_id,
        actor_type: request.actor_type,
        aggregate_id: request.aggregate_id,
        event_namespace: request.event_namespace,
        from: parseDate(request.from, 'from'),
        to: parseDate(request.to, 'to'),
        limit: request.limit,
        offset: request.offset,
      }),
    );
    return { events: events.map((entry) => this.mapper.toProto(entry)) };
  }

  async purgeExpiredEvents(): Promise<PurgeExpiredEventsResponse> {
    requirePermission(this.actors.current(), AuditPermission.PURGE);
    const { removed } = unwrap(
      await this.purgeExpiredAuditEventsUseCase.execute(),
    );
    return { removed };
  }
}
