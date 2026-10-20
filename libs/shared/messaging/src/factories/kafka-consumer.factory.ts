import { Consumer, stringDeserializers } from '@platformatic/kafka';
import type { KafkaConfig } from '../interfaces/index.js';

export const createKafkaConsumer = (
  config: KafkaConfig,
  groupId: string,
): Consumer<string, string, string, string> => {
  return new Consumer({
    groupId,
    clientId: config.clientId,
    bootstrapBrokers: [...config.brokers],
    deserializers: stringDeserializers,
  });
};
