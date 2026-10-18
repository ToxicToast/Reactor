declare const brand: unique symbol;

/** Nominal type: a `string` branded as `ProductId` is not assignable to `StockLotId`. */
export type Brand<T, B extends string> = T & { readonly [brand]: B };
