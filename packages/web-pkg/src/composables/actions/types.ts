import { Resource } from 'web-client/src'

export type ActionOptions = {
  space: SpaceResource
  resources: Resource[]
}
export interface Action {
  name: string
  icon: string
  img?: string
  componentType: 'button'
  class: string
  canBeDefault?: boolean
  label(options?: ActionOptions): string
  isEnabled(options?: ActionOptions): boolean
  handler(options?: ActionOptions): void
}
