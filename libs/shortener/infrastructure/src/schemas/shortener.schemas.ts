import { OutboxSchema } from '@toxictoast/shared-persistence';
import { LinkSchema } from './link.schema.js';

export const shortenerSchemas = [LinkSchema, OutboxSchema];
