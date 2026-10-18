/** Serializable domain failure; `code` is stable and machine-readable. */
export interface DomainError<C extends string = string> {
  readonly code: C;
  readonly message: string;
}
