import type { Result } from '@toxictoast/shared-kernel';

export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<Result<TOutput>>;
}
