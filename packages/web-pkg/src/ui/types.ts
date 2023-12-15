import { IconFillType } from '../helpers/resource'
import { defineComponent } from 'vue'

export type FolderView = {
  name: string
  label: string
  icon: {
    name: string
    fillType: IconFillType
  }
  isScrollable?: boolean
  component: ReturnType<typeof defineComponent>
  componentAttrs?: () => Record<string, unknown>
}
