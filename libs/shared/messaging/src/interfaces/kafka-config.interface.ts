export interface KafkaConfig {
  readonly clientId: string;
  readonly brokers: ReadonlyArray<string>;
}
