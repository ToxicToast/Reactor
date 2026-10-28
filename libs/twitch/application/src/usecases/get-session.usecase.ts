import type { UseCase } from '@toxictoast/shared-application';
import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  StreamSessionAnemic,
  StreamSessionId,
  StreamSessionRepository,
} from '@toxictoast/twitch-domain';
import type { GetSessionInput } from '../data/index.js';

export class GetSessionUseCase implements UseCase<
  GetSessionInput,
  StreamSessionAnemic
> {
  constructor(private readonly sessions: StreamSessionRepository) {}

  async execute(input: GetSessionInput): Promise<Result<StreamSessionAnemic>> {
    const session = await this.sessions.findById(input.id as StreamSessionId);
    if (!session) {
      return Result.fail(new NotFoundError('Stream session', input.id));
    }
    return Result.ok(session);
  }
}
