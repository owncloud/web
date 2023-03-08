import { Resource, SpaceResource } from 'web-client/src'

export type ActionOptions = {
  space: SpaceResource
  resources: Resource[]
}
export interface Action {
  name: string
  icon: string
  iconFillType?: string
  variation?: string
  img?: string
  componentType: 'button' | 'router-link'
  class: string
  canBeDefault?: boolean
  hideLabel?: boolean
  shortcut?: string
  keepOpen?: boolean
  label(options?: ActionOptions): string
  isEnabled(options?: ActionOptions): boolean

  // componentType: button
  handler?(options?: ActionOptions): void

  // componentType: router-link
  route?(options?: ActionOptions): void

  // TODO: We have isEnabled, why do we have isDisabled as well? It's only used once
  isDisabled?(options?: ActionOptions): boolean
}
