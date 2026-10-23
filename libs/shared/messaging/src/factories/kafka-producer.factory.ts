import type { Producer } from '@platformatic/kafka';
import type { KafkaConfig } from '../interfaces/index.js';

export const createKafkaProducer = async (
  config: KafkaConfig,
): Promise<Producer<string, string, string, string>> => {
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
