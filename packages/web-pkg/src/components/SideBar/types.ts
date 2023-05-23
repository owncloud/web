import { defineComponent } from 'vue'
import { IconFillType } from 'design-system/src/helpers'

export interface Panel {
  app: string
  icon: string
  title: string
  component: ReturnType<typeof defineComponent>
  componentAttrs?: any
  default?: (() => boolean) | boolean
  enabled: boolean
  iconFillType?: IconFillType
}
