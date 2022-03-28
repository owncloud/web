import { Component } from 'vue'

export interface Panel {
  app: string
  icon: string
  component: Component
  default?: (() => boolean) | boolean
  enabled: boolean
}
