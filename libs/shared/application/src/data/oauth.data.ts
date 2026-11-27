export interface StartOAuthInput {
  readonly state: string;
  readonly redirect_uri: string;
}

export interface StartOAuthOutput {
  readonly url: string;
}

export interface CompleteOAuthInput {
  readonly code: string;
  readonly redirect_uri: string;
}

export interface DisconnectAccountInput<TId extends string = string> {
  readonly id: TId;
}
