import type {
  AuditEntry,
  AuditFilter,
  AuditPurgeRule,
  AuditRepository,
} from '@toxictoast/audit-domain';

export class InMemoryAuditRepository implements AuditRepository {
  readonly items = new Map<string, AuditEntry>();

  async record(entry: AuditEntry): Promise<void> {
    if (!this.items.has(entry.event_id)) {
      this.items.set(entry.event_id, entry);
    }
  }

  async find(filter: AuditFilter): Promise<Array<AuditEntry>> {
    const offset = filter.offset ?? 0;
    const matching = [...this.items.values()]
      .filter((entry) => this.matches(entry, filter))
      .sort((a, b) => b.occurred_at.getTime() - a.occurred_at.getTime());
    return matching.slice(
      offset,
      filter.limit === undefined ? undefined : offset + filter.limit,
    );
  }

  async deleteBefore(rule: AuditPurgeRule): Promise<number> {
    let removed = 0;
    for (const [id, entry] of this.items) {
      if (this.isCoveredBy(entry, rule)) {
        this.items.delete(id);
        removed++;
      }
    }
    return removed;
  }

  private matches(entry: AuditEntry, filter: AuditFilter): boolean {
    return (
      (filter.correlation_id === undefined ||
        entry.correlation_id === filter.correlation_id) &&
      (filter.actor_id === undefined || entry.actor_id === filter.actor_id) &&
      (filter.actor_type === undefined ||
        entry.actor_type === filter.actor_type) &&
      (filter.aggregate_id === undefined ||
        entry.aggregate_id === filter.aggregate_id) &&
      (filter.event_namespace === undefined ||
        entry.event_namespace === filter.event_namespace) &&
      (filter.from === undefined || entry.occurred_at >= filter.from) &&
      (filter.to === undefined || entry.occurred_at < filter.to)
    );
  }

  private isCoveredBy(entry: AuditEntry, rule: AuditPurgeRule): boolean {
    if (entry.occurred_at >= rule.before) {
      return false;
    }
    if (rule.include && !rule.include.includes(entry.event_namespace)) {
      return false;
    }
    if (rule.exclude && rule.exclude.includes(entry.event_namespace)) {
      return false;
    }
    return true;
  }
}
