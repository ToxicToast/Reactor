import type { Either } from './either.type.js';

export type Nullable<Type> = Either<Type, null>;
