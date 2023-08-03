import { ConfigurationManager } from 'web-pkg'

export type IconFillType = 'fill' | 'line' | 'none'
export type IconType = {
  name: string
  color?: string
  fillType?: IconFillType
}

export interface ContextualHelperDataListItem {
  text: string
  headline?: boolean
}
export interface ContextualHelperData {
  title: string
  text?: string
  list?: ContextualHelperDataListItem[]
  readMoreLink?: string
}

export interface ContextualHelperOptions {
  configurationManager: ConfigurationManager
}

export interface ContextualHelper {
  isEnabled: boolean
  data: ContextualHelperData
}
