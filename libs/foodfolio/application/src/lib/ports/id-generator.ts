/** Produces unique opaque ids (e.g. UUID v7); the use case brands them. */
export interface IdGenerator {
  next(): string;
}
