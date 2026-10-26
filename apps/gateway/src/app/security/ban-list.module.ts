import { Module } from '@nestjs/common';
import { provideClass, TOKENS } from '@toxictoast/shared-nest';
import { IpBanHandler } from './consumers/index.js';
import { BanMiddleware } from './middlewares/index.js';
import { BanList } from './services/index.js';

@Module({
  providers: [
    provideClass(BanList, [TOKENS.CLOCK]),
    IpBanHandler,
    BanMiddleware,
  ],
  exports: [BanList, IpBanHandler, BanMiddleware],
})
export class BanListModule {}
