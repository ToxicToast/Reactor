import type { Admin } from '@platformatic/kafka';
import type { KafkaConfig } from '../interfaces/index.js';

export const createKafkaAdmin = async (config: KafkaConfig): Promise<Admin> => {
  const kafka = await import('@platformatic/kafka');
  return new kafka.Admin({
    clientId: `${config.clientId}-admin`,
    bootstrapBrokers: [...config.brokers],
  });
};
