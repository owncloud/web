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
  configurationManager: unknown
}

export interface ContextualHelper {
  isEnabled: boolean
  data: ContextualHelperData
}

export interface PasswordPolicy {
  rules: unknown[]

  check(password: string): boolean

  missing(password: string): {
    rules: {
      code: string
      message: string
      format: (number | string)[]
      verified: boolean
    }[]
  }
}
