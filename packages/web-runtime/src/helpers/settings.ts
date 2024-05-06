export interface SettingsValue {
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

export interface SettingsBundle {
  displayName: string
  extension: string
  id: string
  name: string
  resource: {
    type: string
  }
  settings: {
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
  }[]
  type: string
  roleId?: string
}

export interface LanguageOption {
  label: string
  value: string
}
