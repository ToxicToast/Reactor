import { kafkaConfigFromEnv } from './kafka-config-from-env.function.js';

describe('kafkaConfigFromEnv', () => {
  it('splits and trims the broker list', () => {
    const config = kafkaConfigFromEnv({
      KAFKA_CLIENT_ID: 'blog-service',
      KAFKA_BROKERS: 'redpanda-0:9092, redpanda-1:9092,',
    });

    expect(config).toEqual({
      clientId: 'blog-service',
      brokers: ['redpanda-0:9092', 'redpanda-1:9092'],
    });
  });

  it('fails without brokers', () => {
    expect(() => {
      return kafkaConfigFromEnv({ KAFKA_CLIENT_ID: 'blog-service' });
    }).toThrow('KAFKA_BROKERS');
  });
});
