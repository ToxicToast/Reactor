export interface DisconnectChannelInput {
  readonly id: string;
}

export interface ResumeSubscriptionsOutput {
  readonly started: Array<string>;
  readonly failed: Array<string>;
}
