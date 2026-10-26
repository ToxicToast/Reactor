import { Module } from '@nestjs/common';
import {
  AccessDeniedHandler,
  BanGrpcController,
} from '@toxictoast/security-api';
import {
  ListBansUseCase,
  RecordAccessDeniedUseCase,
  UnbanIpUseCase,
} from '@toxictoast/security-application';
import { BanPolicy, IpBanFactory } from '@toxictoast/security-domain';
import {
  banPolicyConfigFromEnv,
  createRedisClient,
  RedisFailedAttemptCounter,
  TypeOrmIpBanRepository,
} from '@toxictoast/security-infrastructure';
import { DomainPersistence } from '@toxictoast/shared-application';
import { provideClass, TOKENS } from '@toxictoast/shared-nest';
import { TransactionContext } from '@toxictoast/shared-persistence';
import { redisConnectionFromEnv } from '@toxictoast/shared-system';
import { DataSource } from 'typeorm';
import { SECURITY_TOKENS } from './constants/index.js';
import { RedisLifecycle } from './lifecycles/index.js';

const { BAN_POLICY_CONFIG, REDIS } = SECURITY_TOKENS;
const { IP_BAN_REPOSITORY, FAILED_ATTEMPT_COUNTER } = SECURITY_TOKENS;
const { CLOCK, DOMAIN_CONTEXT } = TOKENS;
const DATABASE = [DataSource, TransactionContext];

@Module({
  controllers: [BanGrpcController],
  providers: [
    // ── Configs ───────────────────────────────
    {
      provide: BAN_POLICY_CONFIG,
      useFactory: () => banPolicyConfigFromEnv(),
    },
    {
      provide: REDIS,
      useFactory: () => createRedisClient(redisConnectionFromEnv()),
    },
    RedisLifecycle,

    // ── Domain ──────────────────────────────────
    provideClass(BanPolicy, [BAN_POLICY_CONFIG]),
    provideClass(IpBanFactory, [DOMAIN_CONTEXT]),

    // ── Infrastructure ──────────────────────────
    provideClass(TypeOrmIpBanRepository, DATABASE, IP_BAN_REPOSITORY),
    provideClass(RedisFailedAttemptCounter, [REDIS], FAILED_ATTEMPT_COUNTER),

    // ── Use Cases ───────────────────────────────
    provideClass(RecordAccessDeniedUseCase, [
      IpBanFactory,
      IP_BAN_REPOSITORY,
      BanPolicy,
      FAILED_ATTEMPT_COUNTER,
      DomainPersistence,
      CLOCK,
    ]),
    provideClass(UnbanIpUseCase, [
      IpBanFactory,
      IP_BAN_REPOSITORY,
      DomainPersistence,
      CLOCK,
    ]),
    provideClass(ListBansUseCase, [IP_BAN_REPOSITORY, CLOCK]),

    AccessDeniedHandler,
  ],
  exports: [AccessDeniedHandler],
})
export class SecurityModule {}
