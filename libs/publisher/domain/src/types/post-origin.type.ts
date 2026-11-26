import type { PostOrigins } from '../constants/index.js';

export type PostOrigin = (typeof PostOrigins)[keyof typeof PostOrigins];
