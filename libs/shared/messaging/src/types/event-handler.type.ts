import type { ConsumedEvent } from '../interfaces/index.js';

export type EventHandler = (event: ConsumedEvent) => Promise<void>;
