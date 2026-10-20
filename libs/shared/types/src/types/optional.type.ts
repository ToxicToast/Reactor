import type { Either } from './either.type.js';

export type Optional<Type> = Either<Type, undefined>;
