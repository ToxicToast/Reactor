import type { FollowStates } from '../constants/index.js';

export type FollowState = (typeof FollowStates)[keyof typeof FollowStates];
