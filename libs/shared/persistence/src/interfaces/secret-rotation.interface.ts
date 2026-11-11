export interface SecretRotation {
  readonly table: string;
  /** verschlüsselt alle Werte neu, die nicht aktuell sind; liefert die Anzahl Zeilen */
  rotate(): Promise<number>;
}
