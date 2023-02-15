import { Ref } from 'vue'
import { MongoAbility } from '@casl/ability'

export type ReadOnlyRef<T> = Readonly<Ref<T>>
export type MaybeRef<T> = T | Ref<T>
export type MaybeReadonlyRef<T> = MaybeRef<T> | ReadOnlyRef<T>

export type Actions = 'create' | 'delete' | 'read' | 'set-quota' | 'update'
export type Subjects = 'Account' | 'Group' | 'Language' | 'Logo' | 'Role' | 'Setting' | 'Space'

export type Ability = MongoAbility<[Actions, Subjects]>
