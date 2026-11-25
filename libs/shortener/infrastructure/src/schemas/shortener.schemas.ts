import { OutboxSchema } from '@toxictoast/shared-persistence';
import { LinkClickSchema } from './link-click.schema.js';
import { LinkSchema } from './link.schema.js';

export const shortenerSchemas = [LinkSchema, LinkClickSchema, OutboxSchema];
