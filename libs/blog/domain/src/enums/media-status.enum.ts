export const MediaStatus = {
  PENDING: 'pending',
  READY: 'ready',
} as const;

export type MediaStatus = (typeof MediaStatus)[keyof typeof MediaStatus];
