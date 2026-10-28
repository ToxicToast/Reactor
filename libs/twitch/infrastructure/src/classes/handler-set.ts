import type { FeedHandler, Unsubscribe } from '@toxictoast/twitch-application';

export class HandlerSet<T> {
  private readonly handlers = new Set<FeedHandler<T>>();

  add(handler: FeedHandler<T>): Unsubscribe {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  emit(value: T): void {
    for (const handler of this.handlers) {
      handler(value);
    }
  }
}
