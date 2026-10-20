import { ProduceAcks, Producer, stringSerializers } from '@platformatic/kafka';
import type { KafkaConfig } from '../interfaces/index.js';

export const createKafkaProducer = (
  config: KafkaConfig,
): Producer<string, string, string, string> => {
  return new Producer({
    clientId: config.clientId,
    bootstrapBrokers: [...config.brokers],
    serializers: stringSerializers,
    idempotent: true,
    acks: ProduceAcks.ALL,
    autocreateTopics: false,
  });
};
