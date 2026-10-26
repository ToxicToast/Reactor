export interface StartAuthorizationInput {
  readonly state: string;
  readonly redirect_uri: string;
}

export interface StartAuthorizationOutput {
  readonly url: string;
}

export interface CompleteAuthorizationInput {
  readonly code: string;
  readonly redirect_uri: string;
}
