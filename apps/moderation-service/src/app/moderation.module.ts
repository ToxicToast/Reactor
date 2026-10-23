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

@Module({
  providers: [
    {
      provide: ModerationPolicy,
      useFactory: () => new ModerationPolicy(moderationThresholdsFromEnv()),
    },
    {
      provide: CONTENT_CLASSIFIER,
      useFactory: () => new NimContentClassifier(nimConfigFromEnv()),
    },
    provideClass(
      KafkaDecisionPublisher,
      [TOKENS.EVENT_PUBLISHER, TOKENS.DOMAIN_CONTEXT],
      DECISION_PUBLISHER,
    ),
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
