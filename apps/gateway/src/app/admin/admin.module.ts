import { Module } from '@nestjs/common';
import { provideClass } from '@toxictoast/shared-nest';
import { AuthModule } from '../auth/auth.module.js';
import { GATEWAY_TOKENS } from '../constants/index.js';
import { AdminAuthController } from './controllers/index.js';
import { adminAuthConfigFromEnv } from './functions/index.js';
import { AdminSessionMiddleware } from './middlewares/index.js';
import { KeycloakOidcClient, SealedCookie } from './services/index.js';

const { ADMIN_AUTH_CONFIG, KEYCLOAK_CONFIG } = GATEWAY_TOKENS;

@Module({
  imports: [AuthModule],
  controllers: [AdminAuthController],
  providers: [
    // ── Configs ───────────────────────────────
    {
      provide: ADMIN_AUTH_CONFIG,
      useFactory: () => adminAuthConfigFromEnv(),
    },

    // ── Services ────────────────────────────────
    provideClass(SealedCookie, [ADMIN_AUTH_CONFIG]),
    provideClass(KeycloakOidcClient, [KEYCLOAK_CONFIG, ADMIN_AUTH_CONFIG]),
    AdminSessionMiddleware,
  ],
  exports: [ADMIN_AUTH_CONFIG, SealedCookie],
})
export class AdminModule {}
