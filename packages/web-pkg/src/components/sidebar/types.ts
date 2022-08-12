import { Component } from 'vue'

export type IconFillType = 'fill' | 'line' | 'none'

export interface Panel {
  app: string
  icon: string
  title: string
  component: Component
  componentAttrs: any
  componentHandlers: any
  default?: (() => boolean) | boolean
  enabled: boolean
  iconFillType?: IconFillType
}
