export type Dimension = 'count' | 'mass' | 'volume';

export type Unit = 'piece' | 'g' | 'kg' | 'ml' | 'l';

/** `factor` converts an amount in this unit to the base unit of its dimension (piece, g, ml). */
export const UNITS: Readonly<Record<Unit, { dimension: Dimension; factor: number }>> = {
  piece: { dimension: 'count', factor: 1 },
  g: { dimension: 'mass', factor: 1 },
  kg: { dimension: 'mass', factor: 1000 },
  ml: { dimension: 'volume', factor: 1 },
  l: { dimension: 'volume', factor: 1000 },
};
