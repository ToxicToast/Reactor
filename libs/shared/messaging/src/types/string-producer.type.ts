import type { Producer } from '@platformatic/kafka';

export type StringProducer = Producer<string, string, string, string>;
