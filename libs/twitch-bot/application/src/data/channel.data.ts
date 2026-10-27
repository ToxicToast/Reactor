export interface DisconnectChannelInput {
  readonly id: string;
}

export interface RevokeChannelInput {
  readonly twitch_id: string;
}

export interface ResumeSubscriptionsOutput {
  readonly started: Array<string>;
  readonly failed: Array<string>;
}
