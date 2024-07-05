export interface ContextualHelperDataListItem {
  text: string
  headline?: boolean
}

export interface ContextualHelperData {
  title?: string
  text?: string
  list?: ContextualHelperDataListItem[]
  readMoreLink?: string
}

export interface ContextualHelper {
  isEnabled: boolean
  data: ContextualHelperData
}

export interface PasswordPolicyRule {
  code: string
  message: string
  helperMessage?: string
  format: (number | string)[]
  verified: boolean
}

export interface PasswordPolicy {
  rules: unknown[]

  check(password: string): boolean

  missing(password: string): {
    rules: PasswordPolicyRule[]
  }
}
