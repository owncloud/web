import { Component } from 'vue'

export type IconFillType = 'fill' | 'line' | 'none'

export interface Panel {
  app: string
  icon: string
  title: string
  component: Component
  componentAttrs: any
  componentListeners: any
  default?: (() => boolean) | boolean
  enabled: boolean
  iconFillType?: IconFillType
}
