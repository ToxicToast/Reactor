export const ActorType = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system',
  ANONYMOUS: 'anonymous',
} as const;

export type ActorType = (typeof ActorType)[keyof typeof ActorType];
