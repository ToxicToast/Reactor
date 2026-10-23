import type { Consumer } from '@platformatic/kafka';
import type { KafkaConfig } from '../interfaces/index.js';

export const createKafkaConsumer = async (
  config: KafkaConfig,
  groupId: string,
): Promise<Consumer<string, string, string, string>> => {
  const kafka = await import('@platformatic/kafka');
  return new kafka.Consumer({
    groupId,
    clientId: config.clientId,
    bootstrapBrokers: [...config.brokers],
    deserializers: kafka.stringDeserializers,
  });
};
