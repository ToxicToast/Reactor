import type { Clock } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import { TWITCH_CREDENTIALS_TTL } from '../constants';
import type { TwitchCredentialsStatus } from '../interfaces';
import { errorMessage } from '@toxictoast/shared-system';

export class TwitchCredentialsCheck {
  private last: Nullable<TwitchCredentialsStatus> = null;
  private running: Nullable<Promise<TwitchCredentialsStatus>> = null;

  constructor(
    private readonly requestToken: () => Promise<unknown>,
    private readonly clock: Clock,
  ) {}

  check(): Promise<TwitchCredentialsStatus> {
    if (this.last && this.isFresh(this.last)) {
      return Promise.resolve(this.last);
    }
    if (!this.running) {
      this.running = this.refresh().finally(() => {
        this.running = null;
      });
    }
    return this.running;
  }

  private async refresh(): Promise<TwitchCredentialsStatus> {
    let status: TwitchCredentialsStatus;
    try {
      await this.requestToken();
      status = { valid: true, message: null, checked_at: this.clock.now() };
    } catch (error: unknown) {
      status = {
        valid: false,
        message: errorMessage(error),
        checked_at: this.clock.now(),
      };
    }
    this.last = status;
    return status;
  }

  private isFresh(status: TwitchCredentialsStatus): boolean {
    const age = this.clock.now().getTime() - status.checked_at.getTime();
    const ttl = status.valid
      ? TWITCH_CREDENTIALS_TTL.VALID_MS
      : TWITCH_CREDENTIALS_TTL.INVALID_MS;
    return age < ttl;
  }
}
