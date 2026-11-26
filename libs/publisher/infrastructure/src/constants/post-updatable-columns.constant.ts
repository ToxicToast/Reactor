/** was ein erneuter Abgleich überschreiben darf; origin bleibt, wie es beim ersten Speichern war */
export const POST_UPDATABLE_COLUMNS = [
  'account_remote_id',
  'url',
  'title',
  'published_at',
  'duration_seconds',
] as const;
