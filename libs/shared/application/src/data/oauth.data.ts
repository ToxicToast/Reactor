export interface StartOAuthInput {
  readonly state: string;
  readonly redirect_uri: string;
}

export interface StartOAuthOutput {
  readonly url: string;
}
