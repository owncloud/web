import { Resource } from 'web-client/src'

export interface Action {
  name: string
  icon: string
  img?: string
  componentType: 'button'
  class: string
  canBeDefault?: boolean
  label(): string
  isEnabled(options?: { resources?: Resource[] }): boolean
  handler(options?: { resources?: Resource[] }): void
}
