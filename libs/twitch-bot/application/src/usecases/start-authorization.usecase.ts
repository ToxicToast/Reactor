import type { UseCase } from '@toxictoast/shared-application';
import { Result, ValidationError } from '@toxictoast/shared-kernel';
import { TWITCH_BOT_SCOPES } from '../constants/index.js';
import type {
  StartAuthorizationInput,
  StartAuthorizationOutput,
} from '../data/index.js';
import type { TwitchAuthClient } from '../interfaces/index.js';

export class StartAuthorizationUseCase implements UseCase<
  StartAuthorizationInput,
  StartAuthorizationOutput
> {
  constructor(private readonly auth: TwitchAuthClient) {}

  async execute(
    input: StartAuthorizationInput,
  ): Promise<Result<StartAuthorizationOutput>> {
    if (input.state.trim().length === 0) {
      return Result.fail(new ValidationError('State must not be empty'));
    }
    if (!URL.canParse(input.redirect_uri)) {
      return Result.fail(
        new ValidationError(`Invalid redirect uri ${input.redirect_uri}`),
      );
    }

    return Result.ok({
      url: this.auth.authorizationUrl(
        input.state,
        input.redirect_uri,
        TWITCH_BOT_SCOPES,
      ),
    });
  }
}
