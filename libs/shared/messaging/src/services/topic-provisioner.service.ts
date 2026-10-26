import type { Admin } from '@platformatic/kafka';
import { KAFKA_ADMIN } from '../constants/index.js';
import type { TopicProvisionerOptions } from '../interfaces/index.js';

export class TopicProvisioner {
  constructor(
    private readonly admin: Admin,
    private readonly topics: ReadonlyArray<string>,
    private readonly options: TopicProvisionerOptions,
  ) {}

  async provision(): Promise<Array<string>> {
    try {
      const missing = await this.missing();
      if (missing.length > 0) {
        await this.create(missing);
      }
      await this.applyRetention();
      return missing;
    } finally {
      await this.admin.close();
    }
  }

  private async create(missing: Array<string>): Promise<void> {
    try {
      await this.admin.createTopics({
        topics: missing,
        partitions: this.options.partitions,
        replicas: this.options.replicas,
      });
    } catch (error) {
      const stillMissing = await this.missing();
      if (stillMissing.length > 0) {
        throw error;
      }
    }
  }

  private async applyRetention(): Promise<void> {
    const retention = Object.entries(this.options.retentionMs ?? {}).filter(
      ([topic]) => this.topics.includes(topic),
    );
    if (retention.length === 0) {
      return;
    }

    await this.admin.incrementalAlterConfigs({
      resources: retention.map(([topic, ms]) => {
        return {
          resourceType: KAFKA_ADMIN.TOPIC_RESOURCE,
          resourceName: topic,
          configs: [
            {
              name: 'retention.ms',
              configOperation: KAFKA_ADMIN.SET_CONFIG,
              value: String(ms),
            },
          ],
        };
      }),
    });
  }

  private async missing(): Promise<Array<string>> {
    const existing = new Set(await this.admin.listTopics());
    return [...new Set(this.topics)].filter((topic) => !existing.has(topic));
  }
}
