import { OutboxSchema } from '@toxictoast/shared-persistence';
import { AccountSnapshotSchema } from './account-snapshot.schema.js';
import { AccountSchema } from './account.schema.js';
import { PostCheckSchema } from './post-check.schema.js';
import { PostSnapshotSchema } from './post-snapshot.schema.js';
import { PostSchema } from './post.schema.js';

export const publisherSchemas = [
  AccountSchema,
  AccountSnapshotSchema,
  PostSchema,
  PostSnapshotSchema,
  PostCheckSchema,
  OutboxSchema,
];
