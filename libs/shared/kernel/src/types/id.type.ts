import type { Brand } from './brand.type.js';

export type Id<Type extends string> = Brand<string, Type>;
