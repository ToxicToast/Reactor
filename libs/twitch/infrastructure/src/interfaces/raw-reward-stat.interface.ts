/** Rohzeile der Ranglisten-Abfrage – Summen liefert Postgres als string. */
export interface RawRewardStat {
  readonly reward_id: string;
  readonly title: string;
  readonly cost: number;
  readonly redemptions: string;
  readonly points_spent: string;
}
