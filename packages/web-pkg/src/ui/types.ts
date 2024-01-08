import { IconFillType } from '../helpers/resource'

export type ViewMode = {
  name: string
  label: string
  icon: {
    name: string
    fillType: IconFillType
  }
}
