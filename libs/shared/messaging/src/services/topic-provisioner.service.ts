import type { Admin } from '@platformatic/kafka';
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
      if (missing.length === 0) {
        return [];
      }

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
      return missing;
    } finally {
      await this.admin.close();
    }
  }

  private async missing(): Promise<Array<string>> {
    const existing = new Set(await this.admin.listTopics());
    return [...new Set(this.topics)].filter((topic) => !existing.has(topic));
  }
}
