import type { SessionCounterKey } from './session-counter-key.type.js';

export type SessionCounters = Readonly<Record<SessionCounterKey, number>>;
