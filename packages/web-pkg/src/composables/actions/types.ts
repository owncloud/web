import { Resource, SpaceResource } from 'web-client/src'
import { Group, User } from 'web-client/src/generated'
import { RouteLocationRaw } from 'vue-router'

export type ActionOptions = Record<string, unknown | unknown[]>
export interface Action<T = ActionOptions> {
  name: string
  icon: string
  iconFillType?: string
  variation?: string
  img?: string
  componentType: 'button' | 'router-link'
  class: string
  hasPriority?: boolean
  hideLabel?: boolean
  shortcut?: string
  keepOpen?: boolean
  opensInNewWindow?: boolean
  ext?: string

  label(options?: T): string
  isEnabled(options?: T): boolean

  // componentType: button
  handler?(options?: T): void

  // componentType: router-link
  route?(options?: T): RouteLocationRaw

  // can be used to display the action in a disabled state in the UI
  isDisabled?(options?: T): boolean
  disabledTooltip?(options?: T): string
}

export type FileActionOptions = {
  space: SpaceResource
  resources: Resource[]
}
export type FileAction = Action<FileActionOptions>

export type GroupActionOptions = {
  resources: Group[]
}
export type GroupAction = Action<GroupActionOptions>

export type SpaceActionOptions = {
  resources?: SpaceResource[]
}
export type SpaceAction = Action<SpaceActionOptions>

export type UserActionOptions = {
  resources: User[]
}
export type UserAction = Action<UserActionOptions>
