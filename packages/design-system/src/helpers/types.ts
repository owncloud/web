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
