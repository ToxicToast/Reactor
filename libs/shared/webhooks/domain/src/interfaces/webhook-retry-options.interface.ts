export interface WebhookRetryOptions {
  readonly MAX_ATTEMPTS: number;
  readonly BASE_DELAY_MS: number;
  readonly MAX_DELAY_MS: number;
}
