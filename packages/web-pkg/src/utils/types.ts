import { Ref } from 'vue'
import { MongoAbility, SubjectRawRule } from '@casl/ability'

export type ReadOnlyRef<T> = Readonly<Ref<T>>
export type MaybeRef<T> = T | Ref<T>
export type MaybeReadonlyRef<T> = MaybeRef<T> | ReadOnlyRef<T>

export type AbilityActions =
  | 'create'
  | 'create-all'
  | 'delete'
  | 'delete-all'
  | 'read'
  | 'read-all'
  | 'set-quota'
  | 'set-quota-all'
  | 'update'
  | 'update-all'

export type AbilitySubjects =
  | 'Account'
  | 'Group'
  | 'Language'
  | 'Logo'
  | 'PublicLink'
  | 'Role'
  | 'Setting'
  | 'Space'

export type Ability = MongoAbility<[AbilityActions, AbilitySubjects]>

export type AbilityRule = SubjectRawRule<AbilityActions, AbilitySubjects, any>
