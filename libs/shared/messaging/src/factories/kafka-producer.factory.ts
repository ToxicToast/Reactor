import type { KafkaConfig } from '../interfaces/index.js';
import type { StringProducer } from '../types/index.js';

export const createKafkaProducer = async (
  config: KafkaConfig,
): Promise<StringProducer> => {
  const kafka = await import('@platformatic/kafka');
  return new kafka.Producer({
    clientId: config.clientId,
    bootstrapBrokers: [...config.brokers],
    serializers: kafka.stringSerializers,
    idempotent: true,
    acks: kafka.ProduceAcks.ALL,
    autocreateTopics: false,
  });
};
