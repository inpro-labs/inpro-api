export type DateAsString<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends object
      ? DateAsString<T[K]>
      : T[K];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = {
  [K in Keys]: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[Keys];
