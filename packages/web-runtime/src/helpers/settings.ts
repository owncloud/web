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

/** IDs of notifications setting bundles */
export enum SettingsNotificationBundle {
  /** Email Notifications options */
  EmailSendingInterval = '08dec2fe-3f97-42a9-9d1b-500855e92f25',
  /** Share created */
  ShareCreated = '872d8ef6-6f2a-42ab-af7d-f53cc81d7046',
  /** Share removed */
  ShareRemoved = 'd7484394-8321-4c84-9677-741ba71e1f80',
  /** Share expired */
  ShareExpired = 'e1aa0b7c-1b0f-4072-9325-c643c89fee4e',
  /** Space shared */
  SpaceShared = '694d5ee1-a41c-448c-8d14-396b95d2a918',
  /** Space unshared */
  SpaceUnshared = '26c20e0e-98df-4483-8a77-759b3a766af0',
  /** Space membership expired */
  SpaceMembershipExpired = '7275921e-b737-4074-ba91-3c2983be3edd',
  /** Space disabled */
  SpaceDisabled = 'eb5c716e-03be-42c6-9ed1-1105d24e109f',
  /** Space deleted */
  SpaceDeleted = '094ceca9-5a00-40ba-bb1a-bbc7bccd39ee',
  /** Postprocessing Step Finished */
  PostprocessingStepFinished = 'fe0a3011-d886-49c8-b797-33d02fa426ef',
  /** Science Mesh Invite Token Generated */
  ScienceMeshInviteTokenGenerated = 'b441ffb1-f5ee-4733-a08f-48d03f6e7f22'
}
