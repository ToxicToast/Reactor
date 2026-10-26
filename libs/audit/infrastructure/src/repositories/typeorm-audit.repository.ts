import type {
  AuditEntry,
  AuditFilter,
  AuditPurgeRule,
  AuditRepository,
} from '@toxictoast/audit-domain';
import type { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import type { AuditEventRow } from '../interfaces/index.js';
import { AuditEventMapper } from '../mappers/index.js';
import { AuditEventSchema } from '../schemas/index.js';

export class TypeOrmAuditRepository implements AuditRepository {
  private readonly mapper = new AuditEventMapper();

  constructor(private readonly dataSource: DataSource) {}

  async record(entry: AuditEntry): Promise<void> {
    await this.repository()
      .createQueryBuilder()
      .insert()
      .into(AuditEventSchema)
      .values(this.mapper.toRow(entry))
      .orIgnore()
      .execute();
  }

  async find(filter: AuditFilter): Promise<Array<AuditEntry>> {
    const query = this.filtered(filter)
      .orderBy('e.occurred_at', 'DESC')
      .addOrderBy('e.event_id', 'DESC')
      .limit(filter.limit)
      .offset(filter.offset);
    const rows = await query.getMany();
    return rows.map((row) => this.mapper.toEntry(row));
  }

  async deleteBefore(rule: AuditPurgeRule): Promise<number> {
    if (rule.include && rule.include.length === 0) {
      return 0;
    }

    const query = this.repository()
      .createQueryBuilder()
      .delete()
      .from(AuditEventSchema)
      .where('occurred_at < :before', { before: rule.before });
    if (rule.include) {
      query.andWhere('event_namespace IN (:...include)', {
        include: rule.include,
      });
    }
    if (rule.exclude && rule.exclude.length > 0) {
      query.andWhere('event_namespace NOT IN (:...exclude)', {
        exclude: rule.exclude,
      });
    }

    const result = await query.execute();
    return result.affected ?? 0;
  }

  private filtered(filter: AuditFilter): SelectQueryBuilder<AuditEventRow> {
    const query = this.repository().createQueryBuilder('e');
    if (filter.correlation_id !== undefined) {
      query.andWhere('e.correlation_id = :correlationId', {
        correlationId: filter.correlation_id,
      });
    }
    if (filter.actor_id !== undefined) {
      query.andWhere('e.actor_id = :actorId', { actorId: filter.actor_id });
    }
    if (filter.actor_type !== undefined) {
      query.andWhere('e.actor_type = :actorType', {
        actorType: filter.actor_type,
      });
    }
    if (filter.aggregate_id !== undefined) {
      query.andWhere('e.aggregate_id = :aggregateId', {
        aggregateId: filter.aggregate_id,
      });
    }
    if (filter.event_namespace !== undefined) {
      query.andWhere('e.event_namespace = :namespace', {
        namespace: filter.event_namespace,
      });
    }
    if (filter.from !== undefined) {
      query.andWhere('e.occurred_at >= :from', { from: filter.from });
    }
    if (filter.to !== undefined) {
      query.andWhere('e.occurred_at < :to', { to: filter.to });
    }
    return query;
  }

  private repository(): Repository<AuditEventRow> {
    return this.dataSource.getRepository(AuditEventSchema);
  }
}
