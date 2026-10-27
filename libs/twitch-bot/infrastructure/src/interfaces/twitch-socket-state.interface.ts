export interface TwitchSocketState {
  readonly twitch_id: string;
  readonly login: string;
  readonly connected: boolean;
  readonly since: Date;
}
