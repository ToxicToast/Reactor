import { requiredEnv } from '@toxictoast/shared-system';
import type { KafkaConfig } from '../interfaces/index.js';

export const kafkaConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): KafkaConfig => {
  return {
    clientId: requiredEnv('KAFKA_CLIENT_ID', source),
    brokers: requiredEnv('KAFKA_BROKERS', source)
      .split(',')
      .map((broker) => broker.trim())
      .filter((broker) => broker !== ''),
  };
};
