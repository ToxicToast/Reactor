import type { VideoTypes } from '../constants/index.js';

export type VideoType = (typeof VideoTypes)[keyof typeof VideoTypes];
