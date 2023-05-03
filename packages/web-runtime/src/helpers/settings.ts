export interface SettingValue {
  identifier: {
    bundle: string
    extension: string
    setting: string
  }
  value: {
    accountUuid: string
    bundleId: string
    id: string
    resource: {
      type: string
    }
    settingId: string
    boolValue?: boolean
    listValue?: {
      values: {
        stringValue: string
      }[]
    }
  }
}

export interface AccountBundleSetting {
  description: string
  displayName: string
  id: string
  name: string
  resource: {
    type: string
  }
  singleChoiceValue?: {
    options: Record<string, any>[]
  }
  boolValue?: Record<string, any>
}

export interface AccountBundle {
  displayName: string
  extension: string
  id: string
  name: string
  resource: {
    type: string
  }
  settings: AccountBundleSetting[]
  type: string
}

export interface LanguageOption {
  label: string
  value: string
}
