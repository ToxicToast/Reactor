import type {
  ObservedEvent,
  Outbox,
  UnitOfWork,
} from '@toxictoast/shared-application';

/** ohne Beobachtung kein leerer Schreibvorgang */
export const publishObserved = async (
  outbox: Outbox,
  uow: UnitOfWork,
  events: ReadonlyArray<ObservedEvent>,
): Promise<void> => {
  if (events.length === 0) {
    return;
  }
  await uow.run(() => outbox.add(events));
};
