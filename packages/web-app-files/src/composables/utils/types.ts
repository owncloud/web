import { Ref } from '@vue/composition-api'

export type MaybeRef<T> = T | Ref<T>
