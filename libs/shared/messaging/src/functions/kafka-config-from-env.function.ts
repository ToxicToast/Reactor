import { requiredEnv } from '@toxictoast/shared-system';
import { MESSAGING_DEFAULTS, MESSAGING_ENV } from '../constants/index.js';
import type { KafkaConfig } from '../interfaces/index.js';

export const kafkaConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): KafkaConfig => {
  return {
    clientId: requiredEnv(MESSAGING_ENV.CLIENT_ID, source),
    brokers: requiredEnv(MESSAGING_ENV.BROKERS, source)
      .split(MESSAGING_DEFAULTS.BROKER_SEPARATOR)
      .map((broker) => broker.trim())
      .filter((broker) => broker !== ''),
  };
};
