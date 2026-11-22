import type { MessagesStream } from '@platformatic/kafka';

export type StringStream = MessagesStream<string, string, string, string>;
