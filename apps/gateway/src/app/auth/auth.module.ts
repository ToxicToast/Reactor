import { Module } from '@nestjs/common';
import { provideClass } from '@toxictoast/shared-nest';
import { GATEWAY_TOKENS } from '../constants/index.js';
import { keycloakConfigFromEnv } from './functions/index.js';
import { KeycloakTokenVerifier } from './services/index.js';

const { KEYCLOAK_CONFIG } = GATEWAY_TOKENS;

@Module({
  providers: [
    {
      provide: KEYCLOAK_CONFIG,
      useFactory: () => keycloakConfigFromEnv(),
    },
    provideClass(KeycloakTokenVerifier, [KEYCLOAK_CONFIG]),
  ],
  exports: [KEYCLOAK_CONFIG, KeycloakTokenVerifier],
})
export class AuthModule {}
