import { Admin } from '@platformatic/kafka';
import type { KafkaConfig } from '../interfaces/index.js';

export const createKafkaAdmin = (config: KafkaConfig): Admin => {
  return new Admin({
    clientId: `${config.clientId}-admin`,
    bootstrapBrokers: [...config.brokers],
  });
};
