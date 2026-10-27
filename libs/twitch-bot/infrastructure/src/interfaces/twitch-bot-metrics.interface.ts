export interface TwitchBotMetrics {
  eventReceived(channel: string, topic: string, name: string): void;
  eventPublishFailed(channel: string, topic: string, name: string): void;
  subscriptionFailed(): void;
  subscriptionRevoked(status: string): void;
  tokenRefreshed(success: boolean): void;
}
