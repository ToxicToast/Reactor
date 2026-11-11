export interface DomainEventDefinition<
  TName extends string = string,
  TNamespace extends string = string,
> {
  readonly namespace: TNamespace;
  readonly name: TName;
  readonly version: number;
}
