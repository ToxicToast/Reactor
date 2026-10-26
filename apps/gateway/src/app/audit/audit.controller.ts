import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { map, type Observable } from 'rxjs';
import { AuditGateway } from './audit.gateway.js';
import {
  AuditEventListResponseDto,
  ListAuditEventsQueryDto,
} from './dtos/index.js';
import { auditEventView } from './functions/index.js';
import type { AuditEventView } from './interfaces/index.js';

@ApiTags('Admin · Audit')
@ApiBearerAuth()
@Controller('api/v1/admin/audit')
export class AuditController {
  constructor(private readonly audit: AuditGateway) {}

  @Get()
  @ApiOkResponse({ type: AuditEventListResponseDto })
  list(
    @Query() query: ListAuditEventsQueryDto,
  ): Observable<{ events: Array<AuditEventView> }> {
    return this.audit
      .list({
        correlation_id: query.correlation_id,
        actor_id: query.actor_id,
        actor_type: query.actor_type,
        aggregate_id: query.aggregate_id,
        event_namespace: query.namespace,
        from: query.from,
        to: query.to,
        limit: query.limit,
        offset: query.offset,
      })
      .pipe(
        map((response) => {
          return { events: response.events.map(auditEventView) };
        }),
      );
  }
}
