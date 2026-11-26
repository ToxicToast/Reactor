import type { Platforms } from '../constants/index.js';

export type Platform = (typeof Platforms)[keyof typeof Platforms];
