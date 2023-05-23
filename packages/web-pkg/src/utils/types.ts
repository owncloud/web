import { Ref } from 'vue'

export type ReadOnlyRef<T> = Readonly<Ref<T>>
export type MaybeRef<T> = T | Ref<T>
export type MaybeReadonlyRef<T> = MaybeRef<T> | ReadOnlyRef<T>
