import type {
  ChatMessageDeleted,
  ChatMessagePosted,
  ChatUserCleared,
} from '../interfaces/index.js';

export type ChatChange =
  ChatMessagePosted | ChatMessageDeleted | ChatUserCleared;
