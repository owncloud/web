import { Ref } from 'vue'
import { MongoAbility } from '@casl/ability'

export type ReadOnlyRef<T> = Readonly<Ref<T>>
export type MaybeRef<T> = T | Ref<T>
export type MaybeReadonlyRef<T> = MaybeRef<T> | ReadOnlyRef<T>

export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'
export type Subjects = 'Space'

export type Ability = MongoAbility<[Actions, Subjects]>
