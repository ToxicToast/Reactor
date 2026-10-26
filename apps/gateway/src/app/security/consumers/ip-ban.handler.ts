import { Injectable, Logger } from '@nestjs/common';
import { isIpBanPayload } from '../functions/index.js';
import { BanList } from '../services/index.js';

@Injectable()
export class IpBanHandler {
  private readonly logger = new Logger(IpBanHandler.name);

  constructor(private readonly bans: BanList) {}

  async banned(payload: unknown): Promise<void> {
    if (!isIpBanPayload(payload)) {
      this.logger.warn('Ignoring invalid security.ip.banned payload');
      return;
    }
    this.bans.ban(payload);
  }

  async unbanned(payload: unknown): Promise<void> {
    if (!isIpBanPayload(payload)) {
      this.logger.warn('Ignoring invalid security.ip.unbanned payload');
      return;
    }
    this.bans.unban(payload);
  }
}
