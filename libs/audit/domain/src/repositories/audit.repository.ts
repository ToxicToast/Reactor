import type { AuditFilter } from '../data/index.js';
import type { AuditEntry, AuditPurgeRule } from '../interfaces/index.js';

export interface AuditRepository {
  record(entry: AuditEntry): Promise<void>;
  find(filter: AuditFilter): Promise<Array<AuditEntry>>;
  deleteBefore(rule: AuditPurgeRule): Promise<number>;
}
