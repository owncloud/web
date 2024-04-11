export const call = function* <T>(p: T | Promise<T>): Generator<Promise<T>, T, T> {
  return yield Promise.resolve(p)
}
