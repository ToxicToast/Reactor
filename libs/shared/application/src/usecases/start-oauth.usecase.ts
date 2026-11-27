import { Result, ValidationError } from '@toxictoast/shared-kernel';
import type { StartOAuthInput, StartOAuthOutput } from '../data/index.js';
import type { OAuthAuthorizationUrl, UseCase } from '../interfaces/index.js';

/** baut die Login-Adresse der Plattform; die Scopes legt die Integration fest */
export class StartOAuthUseCase implements UseCase<
  StartOAuthInput,
  StartOAuthOutput
> {
  constructor(
    private readonly auth: OAuthAuthorizationUrl,
    private readonly scopes: ReadonlyArray<string>,
  ) {}

  async execute(input: StartOAuthInput): Promise<Result<StartOAuthOutput>> {
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
        this.scopes,
      ),
    });
  }
}
