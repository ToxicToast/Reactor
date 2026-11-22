import type { KafkaConfig } from '../interfaces/index.js';
import type { StringConsumer } from '../types/index.js';

export const createKafkaConsumer = async (
  config: KafkaConfig,
  groupId: string,
): Promise<StringConsumer> => {
  const kafka = await import('@platformatic/kafka');
  return new kafka.Consumer({
    groupId,
    clientId: config.clientId,
    bootstrapBrokers: [...config.brokers],
    deserializers: kafka.stringDeserializers,
  });
};
