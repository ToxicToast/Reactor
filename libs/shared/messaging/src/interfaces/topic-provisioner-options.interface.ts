import { Optional } from '@toxictoast/shared-types';

export interface TopicProvisionerOptions {
  readonly partitions: number;
  readonly replicas: number;
  readonly retentionMs?: Optional<Readonly<Record<string, number>>>;
}
