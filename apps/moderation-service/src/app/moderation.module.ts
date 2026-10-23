import { Module } from '@nestjs/common';
import { ModerationRequestedHandler } from '@toxictoast/moderation-api';
import { ModerateContentUseCase } from '@toxictoast/moderation-application';
import { ModerationPolicy } from '@toxictoast/moderation-domain';
import {
  KafkaDecisionPublisher,
  moderationThresholdsFromEnv,
  NimContentClassifier,
  nimConfigFromEnv,
} from '@toxictoast/moderation-infrastructure';
import { provideClass, TOKENS } from '@toxictoast/shared-nest';
import { MODERATION_TOKENS } from './constants/index.js';

const { CONTENT_CLASSIFIER, DECISION_PUBLISHER } = MODERATION_TOKENS;
const { MODERATION_THRESHOLDS, NIM_CONFIG } = MODERATION_TOKENS;

@Module({
  providers: [
    // ── Configs ───────────────────────────────
    {
      provide: MODERATION_THRESHOLDS,
      useFactory: () => moderationThresholdsFromEnv(),
    },
    {
      provide: NIM_CONFIG,
      useFactory: () => nimConfigFromEnv(),
    },

    // ── Domain ──────────────────────────────────
    provideClass(ModerationPolicy, [MODERATION_THRESHOLDS]),

    // ── Infrastructure ──────────────────────────
    provideClass(NimContentClassifier, [NIM_CONFIG], CONTENT_CLASSIFIER),
    provideClass(
      KafkaDecisionPublisher,
      [TOKENS.EVENT_PUBLISHER, TOKENS.DOMAIN_CONTEXT],
      DECISION_PUBLISHER,
    ),

    // ── Use Cases ───────────────────────────────
    provideClass(ModerateContentUseCase, [
      CONTENT_CLASSIFIER,
      ModerationPolicy,
      DECISION_PUBLISHER,
    ]),

    ModerationRequestedHandler,
  ],
  exports: [ModerationRequestedHandler],
})
export class ModerationModule {}
