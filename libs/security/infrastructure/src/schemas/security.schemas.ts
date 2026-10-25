import { OutboxSchema } from '@toxictoast/shared-persistence';
import { IpBanSchema } from './ip-ban.schema.js';

export const securitySchemas = [IpBanSchema, OutboxSchema];
